import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PartyCard } from './components/PartyCard';
import { ResultsSection } from './components/ResultsSection';
import { CandidateVotingView } from './components/CandidateVotingView';
import { ConfirmationView } from './components/ConfirmationView';
import { VoteSuccessView } from './components/VoteSuccessView';
import { AdminPortal } from './components/admin/AdminPortal';
import { AndroidInstallBanner } from './components/mobile/AndroidInstallBanner';
import { NotificationSettingsModal } from './components/mobile/NotificationSettingsModal';
import { VoteToastNotification } from './components/mobile/VoteToastNotification';
import { Language, translations } from './i18n';
import { Party, Candidate, ElectionStatusResponse, ResultsData } from './types';
import { initialSettings } from './data/initialData';
import {
  testFirestoreConnection,
  seedFirestoreIfEmpty,
  submitBallotToFirestore,
  listenToFirestoreParties,
  listenToFirestoreCandidates,
  listenToFirestoreSettings,
} from './lib/firebase';
import { dispatchVoteNotification } from './services/notificationService';
import { AlertCircle } from 'lucide-react';

export function App() {
  // Language & RTL State
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    return (localStorage.getItem('seddouk_lang') as Language) || 'fr';
  });

  // Current view state
  const [currentView, setCurrentView] = useState<
    'home' | 'lists' | 'vote' | 'confirm' | 'success' | 'results' | 'admin'
  >('home');

  // Backend & Firestore state
  const [statusData, setStatusData] = useState<ElectionStatusResponse>({
    settings: initialSettings,
    hasVoted: false,
    totalValidBallots: 0,
    totalParties: 4,
    totalCandidates: 104,
  });

  const [parties, setParties] = useState<(Party & { candidates?: Candidate[] })[]>([]);
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);

  // Voting flow state
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ipBlockedModal, setIpBlockedModal] = useState(false);

  // Notification settings modal state
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Update HTML dir and lang on change
  useEffect(() => {
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
    localStorage.setItem('seddouk_lang', currentLang);
  }, [currentLang]);

  // Fetch election status & results
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch (e) {
      console.error('Failed to load status:', e);
    }
  };

  const fetchParties = async () => {
    try {
      const res = await fetch('/api/parties');
      if (res.ok) {
        const data = await res.json();
        setParties(data);
      }
    } catch (e) {
      console.error('Failed to load parties:', e);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/results');
      if (res.ok) {
        const data = await res.json();
        setResultsData(data);
      }
    } catch (e) {
      console.error('Failed to load results:', e);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchParties();
    fetchResults();

    // 1. Initialize Firestore connection and seed initial election documents if needed
    testFirestoreConnection();
    seedFirestoreIfEmpty();

    // 2. Listen to real-time changes in Firestore for Settings, Parties & Candidates
    const unsubSettings = listenToFirestoreSettings((settings) => {
      setStatusData((prev) => ({ ...prev, settings }));
    });

    const unsubParties = listenToFirestoreParties((firestoreParties) => {
      setParties((prev) => {
        return firestoreParties.map((fp) => {
          const existing = prev.find((p) => p.id === fp.id);
          return {
            ...fp,
            candidates: existing?.candidates || [],
          };
        });
      });
    });

    const unsubCandidates = listenToFirestoreCandidates((firestoreCandidates) => {
      setParties((prev) => {
        return prev.map((p) => ({
          ...p,
          candidates: firestoreCandidates.filter((c) => c.partyId === p.id),
        }));
      });
    });

    // 3. Connect to Server-Sent Events (SSE) for live mobile vote notifications
    const eventSource = new EventSource('/api/live-votes');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_vote') {
          // Trigger notification via our notification service
          dispatchVoteNotification(
            {
              id: `vote-${Date.now()}`,
              partyId: data.partyId,
              partyName: data.partyName,
              listNumber: data.listNumber,
              candidateCount: data.candidateCount,
              timestamp: data.timestamp,
              totalBallots: data.totalBallots,
            },
            false
          );
          // Refresh live results & status
          fetchStatus();
          fetchResults();
        }
      } catch (err) {
        console.error('Error handling live vote event:', err);
      }
    };

    // 4. Listen to route changes (/adminin)
    const handleRouteChange = () => {
      if (window.location.pathname.startsWith('/adminin')) {
        setCurrentView('admin');
      }
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      eventSource.close();
      unsubSettings();
      unsubParties();
      unsubCandidates();
    };
  }, []);

  // Submit vote to server and Cloud Firestore
  const handleConfirmVote = async () => {
    if (!selectedPartyId || selectedCandidateIds.length === 0) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId: selectedPartyId,
          candidateIds: selectedCandidateIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'ALREADY_VOTED' || data.code === 'IP_BLOCKED') {
          setIpBlockedModal(true);
        } else {
          setErrorMessage(data.error || 'Erreur lors du vote.');
        }
        setIsSubmitting(false);
        return;
      }

      // Store ballot document in Cloud Firestore directly
      try {
        await submitBallotToFirestore(data.ballotId, selectedPartyId, selectedCandidateIds);
      } catch (fsErr) {
        console.warn('Firestore ballot storage sync:', fsErr);
      }

      // Local success
      setIsSubmitting(false);
      setCurrentView('success');
      fetchStatus();
      fetchResults();
    } catch (e) {
      setErrorMessage('Une erreur de connexion est survenue. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  const selectedParty = parties.find((p) => p.id === selectedPartyId);
  const selectedCandidates = selectedParty?.candidates?.filter((c) =>
    selectedCandidateIds.includes(c.id)
  ) || [];

  const t = translations[currentLang];

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#0F172A] flex flex-col font-sans">
      {/* Real-time in-app floating vote notification toast */}
      <VoteToastNotification currentLang={currentLang} />

      {/* Android Mobile Install Banner on public view access */}
      {currentView !== 'admin' && (
        <AndroidInstallBanner
          currentLang={currentLang}
          onOpenNotificationSettings={() => setIsNotificationModalOpen(true)}
        />
      )}

      {/* Header is shown on public views */}
      {currentView !== 'admin' && (
        <Header
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
          onNavigate={(view) => {
            if (view === 'home') setCurrentView('home');
            else if (view === 'lists') setCurrentView('lists');
            else if (view === 'results') setCurrentView('results');
            else if (view === 'admin') setCurrentView('admin');
          }}
          currentView={currentView}
          onOpenNotificationSettings={() => setIsNotificationModalOpen(true)}
        />
      )}

      {/* Main View Container */}
      <div className="flex-1">
        {/* VIEW 1: HOME WELCOME SCREEN */}
        {currentView === 'home' && (
          <WelcomeScreen
            currentLang={currentLang}
            settings={statusData.settings}
            onStart={() => setCurrentView('lists')}
            hasVoted={statusData.hasVoted}
            onViewResults={() => setCurrentView('results')}
          />
        )}

        {/* VIEW 2: THE 4 LISTS & RANKING */}
        {currentView === 'lists' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {/* Page Header */}
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-black uppercase tracking-wider text-[#0060A8] block mb-2">
                {t.step1}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight">
                {t.allListsTitle}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[#475569] font-medium">
                {t.allListsSubtitle}
              </p>
            </div>

            {/* The 4 Parties Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {parties.map((party) => (
                <PartyCard
                  key={party.id}
                  party={party}
                  currentLang={currentLang}
                  candidateCount={party.candidates?.length || 26}
                  onSelect={(partyId) => {
                    setSelectedPartyId(partyId);
                    setSelectedCandidateIds([]);
                    setCurrentView('vote');
                  }}
                />
              ))}
            </div>

            {/* Integrated Results & Ranking Section on the same page */}
            <ResultsSection
              results={resultsData}
              currentLang={currentLang}
            />
          </div>
        )}

        {/* VIEW 3: CANDIDATE VOTING VIEW (1 to 10 max) */}
        {currentView === 'vote' && selectedParty && (
          <CandidateVotingView
            party={selectedParty}
            candidates={selectedParty.candidates || []}
            currentLang={currentLang}
            onBack={() => setCurrentView('lists')}
            onProceedToConfirm={(candidateIds) => {
              setSelectedCandidateIds(candidateIds);
              setCurrentView('confirm');
            }}
          />
        )}

        {/* VIEW 4: CONFIRMATION VIEW */}
        {currentView === 'confirm' && selectedParty && (
          <ConfirmationView
            party={selectedParty}
            selectedCandidates={selectedCandidates}
            currentLang={currentLang}
            onConfirm={handleConfirmVote}
            onBack={() => setCurrentView('vote')}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
          />
        )}

        {/* VIEW 5: VOTE SUCCESS VIEW */}
        {currentView === 'success' && (
          <VoteSuccessView
            currentLang={currentLang}
            onViewResults={() => setCurrentView('results')}
            onBackHome={() => {
              setSelectedPartyId(null);
              setSelectedCandidateIds([]);
              setCurrentView('home');
            }}
          />
        )}

        {/* VIEW 6: DIRECT RESULTS VIEW */}
        {currentView === 'results' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-6">
              <button
                onClick={() => setCurrentView('lists')}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#0060A8] hover:underline cursor-pointer"
              >
                ← {currentLang === 'ar' ? 'الرجوع للقوائم' : 'Retour aux listes'}
              </button>
            </div>
            <ResultsSection
              results={resultsData}
              currentLang={currentLang}
            />
          </div>
        )}

        {/* VIEW 7: ADMINISTRATOR PORTAL (/adminin) */}
        {currentView === 'admin' && (
          <AdminPortal
            onLogout={() => {
              window.history.pushState({}, '', '/');
              setCurrentView('home');
            }}
            onBackToPublic={() => {
              window.history.pushState({}, '', '/');
              setCurrentView('home');
            }}
          />
        )}
      </div>

      {/* IP ALREADY VOTED MODAL */}
      {ipBlockedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-amber-300 p-8 max-w-lg w-full text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#0F172A]">
              {t.alreadyVotedTitle}
            </h3>

            <p className="mt-3 text-sm text-[#334155] font-medium leading-relaxed">
              {t.alreadyVotedMessage}
            </p>

            <div className="mt-8">
              <button
                onClick={() => {
                  setIpBlockedModal(false);
                  setCurrentView('home');
                }}
                className="w-full py-4 rounded-xl bg-[#0060A8] text-white font-extrabold text-base hover:bg-[#004B87] transition-colors cursor-pointer"
              >
                {t.backHome}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Customization Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        currentLang={currentLang}
      />

      {/* Municipal Institutional Footer */}
      {currentView !== 'admin' && (
        <footer className="mt-auto border-t border-[#D0DFEE] bg-white py-6 px-4 text-center text-xs text-[#475569] font-medium">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#0060A8]">COMMUNE DE SEDDOUK · بلدية صدوق</span>
              <span>·</span>
              <span>Wilaya de Béjaïa (06)</span>
            </div>

            <div className="text-right rtl:text-left text-[#475569] font-semibold">
              <span>Hôtel de Ville · Elections 2026 · ⵜⴰⵖⵉⵡⴰⵏⵜ ⵏ ⵚⴻⴷⴷⵓⵇ</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
