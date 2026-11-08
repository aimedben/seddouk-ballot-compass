import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Layers,
  Users,
  ShieldCheck,
  History,
  Settings,
  LogOut,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Download,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  BarChart2,
  Check,
  Mail,
} from 'lucide-react';
import { Party, Candidate, AuditLog, SecurityRecord, ElectionSettings, ResultsData } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

interface AdminPortalProps {
  onLogout: () => void;
  onBackToPublic: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onLogout, onBackToPublic }) => {
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('seddouk2004@gmail.com');
  const [isSignUp, setIsSignUp] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin Navigation
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'parties' | 'candidates' | 'results' | 'security' | 'audit' | 'settings'
  >('dashboard');

  // Data state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityData, setSecurityData] = useState<{
    ipProtectionEnabled: boolean;
    records: SecurityRecord[];
    totalVotedIps: number;
    totalBlockedAttempts: number;
  } | null>(null);
  const [settings, setSettings] = useState<ElectionSettings | null>(null);

  // Modals
  const [voteAdjustModal, setVoteAdjustModal] = useState<{
    isOpen: boolean;
    type: 'party' | 'candidate';
    entityId: string;
    entityName: string;
    currentVotes: number;
  } | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustError, setAdjustError] = useState<string>('');
  const [adjustIsAdd, setAdjustIsAdd] = useState<boolean>(true);

  // Unblock IP Modal
  const [unblockModal, setUnblockModal] = useState<{
    isOpen: boolean;
    ipFingerprint: string;
  } | null>(null);
  const [unblockReason, setUnblockReason] = useState('');

  // Candidate Edit/Add Modal
  const [candidateModal, setCandidateModal] = useState<{
    isOpen: boolean;
    candidate: Partial<Candidate> | null;
    isNew: boolean;
  } | null>(null);

  // Selected party for candidates tab
  const [selectedPartyFilter, setSelectedPartyFilter] = useState<string>('all');

  // Search in audit logs
  const [auditSearch, setAuditSearch] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState('all');

  // Reset confirmation
  const [resetPhrase, setResetPhrase] = useState('');
  const [resetReason, setResetReason] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  // Fetch admin data
  const fetchData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Dashboard
      const dashRes = await fetch('/api/public/admin/dashboard', { headers });
      if (dashRes.ok) {
        const d = await dashRes.json();
        setDashboardData(d);
        setSettings(d.settings);
      }

      // Parties & Candidates
      const partiesRes = await fetch('/api/public/parties');
      if (partiesRes.ok) {
        const pList = await partiesRes.json();
        setParties(pList);
        const allCands: Candidate[] = [];
        pList.forEach((p: any) => {
          if (p.candidates) allCands.push(...p.candidates);
        });
        setCandidates(allCands);
      }

      // Security
      const secRes = await fetch('/api/public/admin/security', { headers });
      if (secRes.ok) {
        setSecurityData(await secRes.json());
      }

      // Audit logs
      const auditRes = await fetch('/api/public/admin/audit-logs', { headers });
      if (auditRes.ok) {
        setAuditLogs(await auditRes.json());
      }
    } catch (e) {
      console.error('Fetch admin error:', e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Lovable Cloud session -> admin access (role checked on the server)
  const checkAdmin = async (accessToken: string | undefined) => {
    if (!accessToken) {
      setToken(null);
      return;
    }
    const res = await fetch('/api/public/admin/me', { headers: { Authorization: `Bearer ${accessToken}` } });
    if (res.ok) {
      setToken(accessToken);
      setLoginError('');
    } else {
      setToken(null);
      setLoginError("Ce compte n'a pas les privilèges administrateur pour Seddouk 2026.");
    }
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => checkAdmin(session?.access_token), 0);
    });
    supabase.auth.getSession().then(({ data }) => checkAdmin(data.session?.access_token));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: `${window.location.origin}/adminin`,
      });
      if (result.error) setLoginError(result.error.message || 'Échec de la connexion Google.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Email/Password Sign-In & Sign-Up
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: emailInput,
          password: passwordInput,
          options: { emailRedirectTo: `${window.location.origin}/adminin` },
        });
        if (error) throw error;
        if (!data.session) {
          setLoginError('Compte créé. Vérifiez votre boîte email pour confirmer votre adresse, puis connectez-vous.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: emailInput, password: passwordInput });
        if (error) throw error;
      }
    } catch (e: any) {
      setLoginError(e.message || "Erreur d'authentification.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setToken(null);
    onLogout();
  };

  const handleExportCsv = async () => {
    const res = await fetch('/api/public/admin/export-csv', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elections_seddouk_2026_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Adjust votes handler
  const submitVoteAdjustment = async () => {
    if (!voteAdjustModal || !adjustReason.trim()) {
      setAdjustError('Le motif est obligatoire.');
      return;
    }

    const delta = adjustIsAdd ? Math.abs(adjustAmount) : -Math.abs(adjustAmount);

    try {
      const res = await fetch('/api/public/admin/adjust-votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: voteAdjustModal.type,
          entityId: voteAdjustModal.entityId,
          adjustment: delta,
          reason: adjustReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAdjustError(data.error || 'Erreur lors de l\'ajustement.');
        return;
      }

      setVoteAdjustModal(null);
      setAdjustReason('');
      setAdjustError('');
      fetchData();
    } catch (e) {
      setAdjustError('Erreur réseau.');
    }
  };

  // Unblock IP
  const submitUnblock = async () => {
    if (!unblockModal || !unblockReason.trim()) return;

    try {
      const res = await fetch('/api/public/admin/security/unblock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ipFingerprint: unblockModal.ipFingerprint,
          reason: unblockReason,
        }),
      });

      if (res.ok) {
        setUnblockModal(null);
        setUnblockReason('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle IP Protection
  const toggleIpProtection = async (enabled: boolean) => {
    try {
      const res = await fetch('/api/public/admin/security/toggle-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update Settings
  const handleUpdateSettings = async (partialSettings: Partial<ElectionSettings>) => {
    try {
      const res = await fetch('/api/public/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(partialSettings),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reset Election
  const handleResetElection = async () => {
    if (resetPhrase !== 'REINITIALISER') {
      setResetMsg('La phrase de confirmation est incorrecte.');
      return;
    }

    try {
      const res = await fetch('/api/public/admin/reset-election', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          confirmationPhrase: resetPhrase,
          reason: resetReason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResetPhrase('');
        setResetReason('');
        setResetMsg('Consultation réinitialisée avec succès.');
        fetchData();
      } else {
        setResetMsg(data.error || 'Erreur lors de la réinitialisation.');
      }
    } catch (e) {
      setResetMsg('Erreur réseau.');
    }
  };

  // IF NOT LOGGED IN -> RENDER LOGIN FORM
  if (!token) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border-2 border-[#D0DFEE] p-8 shadow-2xl">
          {/* Header with APC Diamond */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#E0F2FE] text-[#0060A8] flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Lock className="w-8 h-8 text-[#0060A8]" />
            </div>
            <h2 className="text-2xl font-black text-[#0060A8]">ESPACE ADMINISTRATION</h2>
            <p className="text-xs text-[#475569] font-bold mt-1">
              APC Seddouk · Elections 2026
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-300 text-red-800 text-xs font-bold leading-relaxed">
              {loginError}
            </div>
          )}

          {/* 1-Click Google Sign-In Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loginLoading}
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-[#D0DFEE] hover:border-[#0060A8] bg-white text-[#0F172A] hover:bg-[#F8FAFC] font-extrabold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Se connecter avec Google</span>
            </button>
            <p className="text-[11px] text-center text-[#64748B] font-semibold mt-1.5">
              Accès direct pour <span className="font-bold text-[#0060A8]">seddouk2004@gmail.com</span>
            </p>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D0DFEE]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-[#64748B] font-black tracking-wider">
                ou par email
              </span>
            </div>
          </div>

          {(
            <form onSubmit={handleEmailSignIn} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">
                  Adresse Email
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="seddouk2004@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D0DFEE] focus:border-[#0060A8] focus:outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D0DFEE] focus:border-[#0060A8] focus:outline-none text-sm font-semibold pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold pt-1">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[#0060A8] hover:underline"
                >
                  {isSignUp ? '← J\'ai déjà un compte' : 'Créer un nouveau compte ?'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 rounded-xl bg-[#0060A8] hover:bg-[#004B87] text-white font-black text-sm transition-all cursor-pointer shadow-md disabled:opacity-50 mt-2"
              >
                {loginLoading
                  ? 'Vérification...'
                  : isSignUp
                  ? 'CRÉER LE COMPTE ADMIN'
                  : 'SE CONNECTER PAR EMAIL'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-[#D0DFEE] text-center">
            <button
              onClick={onBackToPublic}
              className="text-xs font-bold text-[#0060A8] hover:underline cursor-pointer"
            >
              ← Retour au portail citoyen public
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F4EE] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#E2E8E3] p-4 flex md:flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="px-2 py-3 mb-4 hidden md:block">
            <span className="text-xs font-black tracking-widest text-[#B94A48] block uppercase">
              Admin Console
            </span>
            <h1 className="text-lg font-black text-[#174B3A]">SEDDOUK 2026</h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-[#174B3A] text-white shadow-xs'
                  : 'text-[#202A27]/70 hover:bg-[#E8F0EB] hover:text-[#174B3A]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tableau de bord</span>
            </button>

            <button
              onClick={() => setActiveTab('parties')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'parties'
                  ? 'bg-[#174B3A] text-white shadow-xs'
                  : 'text-[#202A27]/70 hover:bg-[#E8F0EB] hover:text-[#174B3A]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Gestion des listes</span>
            </button>

            <button
              onClick={() => setActiveTab('candidates')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'candidates'
                  ? 'bg-[#174B3A] text-white shadow-xs'
                  : 'text-[#202A27]/70 hover:bg-[#E8F0EB] hover:text-[#174B3A]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Candidats (104)</span>
            </button>

            <button
              onClick={() => setActiveTab('results')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'results'
                  ? 'bg-[#174B3A] text-white shadow-xs'
                  : 'text-[#202A27]/70 hover:bg-[#E8F0EB] hover:text-[#174B3A]'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Votes & Résultats</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'security'
                  ? 'bg-[#174B3A] text-white shadow-xs'
                  : 'text-[#202A27]/70 hover:bg-[#E8F0EB] hover:text-[#174B3A]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sécurité IP</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-[#174B3A] text-white shadow-xs'
                  : 'text-[#202A27]/70 hover:bg-[#E8F0EB] hover:text-[#174B3A]'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Journal d'audit</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-[#174B3A] text-white shadow-xs'
                  : 'text-[#202A27]/70 hover:bg-[#E8F0EB] hover:text-[#174B3A]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Paramètres</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-[#E2E8E3] hidden md:flex flex-col gap-2">
          <button
            onClick={onBackToPublic}
            className="w-full py-2 px-3 text-xs font-bold text-[#174B3A] hover:bg-[#E8F0EB] rounded-lg text-left transition-colors cursor-pointer"
          >
            ← Voir le site public
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 text-xs font-bold text-red-700 hover:bg-red-50 rounded-lg text-left flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && dashboardData && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#202A27]">
                  Tableau de bord électoral
                </h2>
                <p className="text-xs sm:text-sm text-[#202A27]/60 font-medium">
                  Supervision en direct de la consultation à Seddouk
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchData}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8E3] text-xs font-bold text-[#174B3A] flex items-center gap-1.5 hover:bg-[#E8F0EB] cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Actualiser</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-4 py-2 rounded-xl bg-[#174B3A] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#103D32] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter CSV</span>
                </button>
              </div>
            </div>

            {/* 6 Key Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E2E8E3] shadow-xs">
                <span className="text-xs font-bold text-[#202A27]/60 block uppercase">Total Bulletins</span>
                <span className="text-3xl sm:text-4xl font-black text-[#174B3A] tabular-nums mt-1 block">
                  {dashboardData.totalBallots}
                </span>
                <span className="text-[11px] text-[#202A27]/50 font-medium mt-1 block">
                  Validés dans l'urne virtuelle
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E2E8E3] shadow-xs">
                <span className="text-xs font-bold text-[#202A27]/60 block uppercase">Sélections Candidats</span>
                <span className="text-3xl sm:text-4xl font-black text-[#202A27] tabular-nums mt-1 block">
                  {dashboardData.candidateSelections}
                </span>
                <span className="text-[11px] text-[#202A27]/50 font-medium mt-1 block">
                  Voix individuelles cumulées
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E2E8E3] shadow-xs">
                <span className="text-xs font-bold text-[#202A27]/60 block uppercase">Adresses IP Uniques</span>
                <span className="text-3xl sm:text-4xl font-black text-[#202A27] tabular-nums mt-1 block">
                  {dashboardData.uniqueIps}
                </span>
                <span className="text-[11px] text-[#202A27]/50 font-medium mt-1 block">
                  Empreintes vérifiées
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E2E8E3] shadow-xs">
                <span className="text-xs font-bold text-[#202A27]/60 block uppercase">Tentatives Bloquées</span>
                <span className="text-3xl sm:text-4xl font-black text-amber-700 tabular-nums mt-1 block">
                  {dashboardData.blockedAttempts}
                </span>
                <span className="text-[11px] text-[#202A27]/50 font-medium mt-1 block">
                  Doublons rejetés par sécurité
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E2E8E3] shadow-xs">
                <span className="text-xs font-bold text-[#202A27]/60 block uppercase">Listes & Candidats</span>
                <span className="text-3xl sm:text-4xl font-black text-[#202A27] tabular-nums mt-1 block">
                  4 <span className="text-xl font-normal text-slate-400">/ 104</span>
                </span>
                <span className="text-[11px] text-[#202A27]/50 font-medium mt-1 block">
                  Tous enregistrés et actifs
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E2E8E3] shadow-xs">
                <span className="text-xs font-bold text-[#202A27]/60 block uppercase">Publication Résultats</span>
                <span className="text-lg sm:text-xl font-black text-[#174B3A] mt-2 block">
                  {dashboardData.settings.publicResultsEnabled ? 'EN LIGNE' : 'SUSPENDUE'}
                </span>
                <span className="text-[11px] text-[#202A27]/50 font-medium mt-0.5 block">
                  Statut: {dashboardData.settings.resultsStatus}
                </span>
              </div>
            </div>

            {/* Listes Overview Bars */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8E3] shadow-xs">
              <h3 className="text-lg font-black text-[#202A27] mb-4">
                Répartition des suffrages par liste
              </h3>
              <div className="space-y-4">
                {dashboardData.parties.map((p: any) => (
                  <div key={p.id}>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[#202A27]">{p.name}</span>
                        <span className="text-[#202A27]/50">(Liste N° {p.listNumber})</span>
                      </div>
                      <span className="text-sm font-black text-[#174B3A] tabular-nums">
                        {p.ballotCount} votes ({p.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8E3] rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(2, p.percentage)}%`,
                          backgroundColor: p.themeColor || '#174B3A',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GESTION DES LISTES */}
        {activeTab === 'parties' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#202A27]">Gestion des 4 Listes</h2>
                <p className="text-xs text-[#202A27]/60 font-medium">
                  Ajustements de voix, visibilité publique et informations officielles
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parties.map((party) => (
                <div
                  key={party.id}
                  className="bg-white p-6 rounded-2xl border border-[#E2E8E3] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-[#F6F4EE] border border-[#E2E8E3] p-1 flex items-center justify-center overflow-hidden">
                        <img
                          src={party.logoUrl}
                          alt={party.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-400 uppercase">Numéro</span>
                        <span className="text-3xl font-black text-[#174B3A] block tabular-nums">
                          {party.listNumber}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-extrabold text-[#202A27]">{party.name}</h3>
                    <p className="text-xs text-[#202A27]/70 font-semibold mt-0.5" dir="rtl">
                      {party.arabicName}
                    </p>

                    <div className="mt-4 p-3 bg-[#F6F4EE] rounded-xl flex items-center justify-between text-xs font-semibold">
                      <span>Bulletins attribués :</span>
                      <span className="text-base font-black text-[#174B3A] tabular-nums">
                        {party.ballotCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-[#E2E8E3] flex items-center gap-2">
                    <button
                      onClick={() => {
                        setVoteAdjustModal({
                          isOpen: true,
                          type: 'party',
                          entityId: party.id,
                          entityName: party.name,
                          currentVotes: party.ballotCount || 0,
                        });
                        setAdjustIsAdd(true);
                        setAdjustAmount(1);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-[#E8F0EB] text-[#174B3A] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#174B3A] hover:text-white transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter voix</span>
                    </button>

                    <button
                      onClick={() => {
                        setVoteAdjustModal({
                          isOpen: true,
                          type: 'party',
                          entityId: party.id,
                          entityName: party.name,
                          currentVotes: party.ballotCount || 0,
                        });
                        setAdjustIsAdd(false);
                        setAdjustAmount(1);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-red-50 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-red-700 hover:text-white transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>Retirer voix</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: GESTION DES CANDIDATS */}
        {activeTab === 'candidates' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#202A27]">Gestion des Candidats</h2>
                <p className="text-xs text-[#202A27]/60 font-medium">
                  Total de 104 candidats conformes aux affiches officielles
                </p>
              </div>

              {/* Filter by party */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#202A27]/60">Parti :</span>
                <select
                  value={selectedPartyFilter}
                  onChange={(e) => setSelectedPartyFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#E2E8E3] bg-white text-xs font-bold"
                >
                  <option value="all">Tous les partis (104)</option>
                  <option value="fln">FLN (Liste 1)</option>
                  <option value="ffs">FFS (Liste 7)</option>
                  <option value="rcd">RCD (Liste 9)</option>
                  <option value="amaynut">AMAYNUT (Liste 101)</option>
                </select>
              </div>
            </div>

            {/* Candidates Table */}
            <div className="bg-white rounded-2xl border border-[#E2E8E3] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F6F4EE] border-b border-[#E2E8E3] text-[#202A27]/70 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Photo</th>
                      <th className="py-3 px-4">N° Ordre</th>
                      <th className="py-3 px-4">Nom & Prénom</th>
                      <th className="py-3 px-4">Liste</th>
                      <th className="py-3 px-4">Profession / Âge</th>
                      <th className="py-3 px-4 text-center">Voix Actuelles</th>
                      <th className="py-3 px-4 text-right">Actions Voix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8E3]">
                    {candidates
                      .filter((c) => selectedPartyFilter === 'all' || c.partyId === selectedPartyFilter)
                      .map((c) => (
                        <tr key={c.id} className="hover:bg-[#F6F4EE]/50 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="w-10 h-12 rounded-lg overflow-hidden border border-[#E2E8E3] bg-slate-100">
                              <img
                                src={c.photoUrl}
                                alt={c.lastName}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-black text-[#174B3A] tabular-nums">
                            #{c.listPosition}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="font-extrabold text-[#202A27] block text-sm">
                              {c.firstName} {c.lastName}
                            </span>
                            {c.arabicName && (
                              <span className="text-[11px] font-bold text-[#202A27]/60 block" dir="rtl">
                                {c.arabicName}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-[#174B3A] uppercase">
                            {c.partyId}
                          </td>
                          <td className="py-2.5 px-4 text-[#202A27]/70 font-medium">
                            {c.profession || '—'} {c.age ? `(${c.age} ans)` : ''}
                          </td>
                          <td className="py-2.5 px-4 text-center font-black text-base text-[#174B3A] tabular-nums">
                            {c.voteCount || 0}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setVoteAdjustModal({
                                    isOpen: true,
                                    type: 'candidate',
                                    entityId: c.id,
                                    entityName: `${c.firstName} ${c.lastName}`,
                                    currentVotes: c.voteCount || 0,
                                  });
                                  setAdjustIsAdd(true);
                                  setAdjustAmount(1);
                                }}
                                title="Ajouter voix"
                                className="w-7 h-7 rounded-lg bg-[#E8F0EB] text-[#174B3A] flex items-center justify-center hover:bg-[#174B3A] hover:text-white cursor-pointer font-bold"
                              >
                                +
                              </button>
                              <button
                                onClick={() => {
                                  setVoteAdjustModal({
                                    isOpen: true,
                                    type: 'candidate',
                                    entityId: c.id,
                                    entityName: `${c.firstName} ${c.lastName}`,
                                    currentVotes: c.voteCount || 0,
                                  });
                                  setAdjustIsAdd(false);
                                  setAdjustAmount(1);
                                }}
                                title="Retirer voix"
                                className="w-7 h-7 rounded-lg bg-red-50 text-red-700 flex items-center justify-center hover:bg-red-700 hover:text-white cursor-pointer font-bold"
                              >
                                -
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VOTES & RÉSULTATS */}
        {activeTab === 'results' && settings && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-[#202A27]">Publication des Résultats</h2>
              <p className="text-xs text-[#202A27]/60 font-medium">
                Contrôlez l'affichage public et le statut officiel des résultats
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Publication Toggle */}
              <div className="bg-white p-6 rounded-2xl border border-[#E2E8E3] shadow-xs">
                <h3 className="text-lg font-black text-[#202A27] mb-2">Visibilité publique</h3>
                <p className="text-xs text-[#202A27]/60 mb-4 font-medium">
                  Si désactivé, les chiffres sont masqués aux citoyens et un message informatif est affiché.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUpdateSettings({ publicResultsEnabled: true })}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer ${
                      settings.publicResultsEnabled
                        ? 'bg-[#174B3A] text-white shadow-xs'
                        : 'bg-[#F6F4EE] text-[#202A27]/60 border border-[#E2E8E3]'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>RÉSULTATS ACTIVÉS</span>
                  </button>

                  <button
                    onClick={() => handleUpdateSettings({ publicResultsEnabled: false })}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer ${
                      !settings.publicResultsEnabled
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-[#F6F4EE] text-[#202A27]/60 border border-[#E2E8E3]'
                    }`}
                  >
                    <span>RÉSULTATS MASQUÉS</span>
                  </button>
                </div>
              </div>

              {/* Status Selector */}
              <div className="bg-white p-6 rounded-2xl border border-[#E2E8E3] shadow-xs">
                <h3 className="text-lg font-black text-[#202A27] mb-2">Statut du scrutin</h3>
                <p className="text-xs text-[#202A27]/60 mb-4 font-medium">
                  Indique le degré d'avancement de la consultation aux visiteurs.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateSettings({ resultsStatus: 'provisoire' })}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs cursor-pointer ${
                      settings.resultsStatus === 'provisoire'
                        ? 'bg-[#174B3A] text-white'
                        : 'bg-[#F6F4EE] text-[#202A27]'
                    }`}
                  >
                    Provisoires
                  </button>
                  <button
                    onClick={() => handleUpdateSettings({ resultsStatus: 'definitif' })}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs cursor-pointer ${
                      settings.resultsStatus === 'definitif'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[#F6F4EE] text-[#202A27]'
                    }`}
                  >
                    Définitifs
                  </button>
                  <button
                    onClick={() => handleUpdateSettings({ resultsStatus: 'en_cours' })}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs cursor-pointer ${
                      settings.resultsStatus === 'en_cours'
                        ? 'bg-blue-700 text-white'
                        : 'bg-[#F6F4EE] text-[#202A27]'
                    }`}
                  >
                    En cours
                  </button>
                  <button
                    onClick={() => handleUpdateSettings({ resultsStatus: 'non_disponible' })}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs cursor-pointer ${
                      settings.resultsStatus === 'non_disponible'
                        ? 'bg-slate-700 text-white'
                        : 'bg-[#F6F4EE] text-[#202A27]'
                    }`}
                  >
                    Non disponible
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone: Reset consultation */}
            <div className="bg-red-50/60 p-6 sm:p-8 rounded-3xl border-2 border-red-200 mt-8">
              <h3 className="text-lg font-black text-red-950 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Zone de Réinitialisation Contrôlée</span>
              </h3>
              <p className="text-xs text-red-900/80 mt-1 mb-4 font-medium max-w-xl">
                Cette action efface tous les bulletins enregistrés et remet tous les compteurs à 0. Une entrée obligatoire sera enregistrée dans le journal d'audit.
              </p>

              {resetMsg && (
                <div className="mb-4 p-3 rounded-xl bg-white border border-red-300 text-red-950 text-xs font-bold">
                  {resetMsg}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Tapez REINITIALISER"
                  value={resetPhrase}
                  onChange={(e) => setResetPhrase(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-red-300 bg-white text-sm font-semibold text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="text"
                  placeholder="Motif de la réinitialisation"
                  value={resetReason}
                  onChange={(e) => setResetReason(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-red-300 bg-white text-sm font-semibold focus:outline-none"
                />
                <button
                  onClick={handleResetElection}
                  className="px-6 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-sm cursor-pointer whitespace-nowrap shadow-xs"
                >
                  RÉINITIALISER
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SÉCURITÉ DES VOTES */}
        {activeTab === 'security' && securityData && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#202A27]">Sécurité des Votes & Filtrage IP</h2>
                <p className="text-xs text-[#202A27]/60 font-medium">
                  Protection anti-doublon par empreinte HMAC-SHA256 anonymisée
                </p>
              </div>

              <button
                onClick={() => toggleIpProtection(!securityData.ipProtectionEnabled)}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  securityData.ipProtectionEnabled
                    ? 'bg-[#174B3A] text-white'
                    : 'bg-red-700 text-white'
                }`}
              >
                {securityData.ipProtectionEnabled
                  ? 'PROTECTION IP : ACTIVÉE'
                  : 'PROTECTION IP : DÉSACTIVÉE'}
              </button>
            </div>

            {/* Warning banner */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 font-medium leading-relaxed">
              <strong>Notice d'intégrité :</strong> Une adresse IP ne correspond pas nécessairement à une seule personne physique (connexions partagées, téléphones mobiles, VPN). Cette protection vise à dissuader les doubles clics accidentels et les soumissions massives.
            </div>

            {/* Security Table */}
            <div className="bg-white rounded-2xl border border-[#E2E8E3] shadow-xs overflow-hidden">
              <div className="p-4 border-b border-[#E2E8E3] font-bold text-sm text-[#202A27]">
                Dernières empreintes IP enregistrées ({securityData.records.length})
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F6F4EE] border-b border-[#E2E8E3] text-[#202A27]/70 font-bold uppercase">
                    <tr>
                      <th className="py-3 px-4">Empreinte SHA-256 (Anonymisée)</th>
                      <th className="py-3 px-4">Premier vote</th>
                      <th className="py-3 px-4">Dernière tentative</th>
                      <th className="py-3 px-4">Tentatives</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8E3]">
                    {securityData.records.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                          Aucune empreinte IP pour le moment.
                        </td>
                      </tr>
                    ) : (
                      securityData.records.map((rec) => (
                        <tr key={rec.ipFingerprint} className="hover:bg-[#F6F4EE]/50">
                          <td className="py-3 px-4 font-mono text-[11px] text-[#174B3A]">
                            {rec.ipFingerprint.substring(0, 16)}...
                          </td>
                          <td className="py-3 px-4 text-[#202A27]/70">
                            {new Date(rec.firstSeen).toLocaleTimeString('fr-FR')}
                          </td>
                          <td className="py-3 px-4 text-[#202A27]/70">
                            {new Date(rec.lastAttempt).toLocaleTimeString('fr-FR')}
                          </td>
                          <td className="py-3 px-4 font-bold tabular-nums">
                            {rec.attemptsCount}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                rec.status === 'voted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rec.status === 'blocked'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {rec.status === 'blocked' ? (
                              <button
                                onClick={() =>
                                  setUnblockModal({
                                    isOpen: true,
                                    ipFingerprint: rec.ipFingerprint,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-[#E8F0EB] text-[#174B3A] font-bold text-[11px] hover:bg-[#174B3A] hover:text-white cursor-pointer"
                              >
                                Débloquer
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Normal</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: JOURNAL D'AUDIT */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#202A27]">Journal d'audit certifié</h2>
                <p className="text-xs text-[#202A27]/60 font-medium">
                  Traçabilité immuable de toutes les opérations administratives
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Rechercher une opération..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#E2E8E3] bg-white text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8E3] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F6F4EE] border-b border-[#E2E8E3] text-[#202A27]/70 font-bold uppercase">
                    <tr>
                      <th className="py-3 px-4">Date & Heure</th>
                      <th className="py-3 px-4">Administrateur</th>
                      <th className="py-3 px-4">Opération</th>
                      <th className="py-3 px-4">Cible</th>
                      <th className="py-3 px-4">Variation</th>
                      <th className="py-3 px-4">Motif Obligatoire</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8E3]">
                    {auditLogs
                      .filter(
                        (log) =>
                          !auditSearch ||
                          log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
                          log.entityName.toLowerCase().includes(auditSearch.toLowerCase()) ||
                          log.reason.toLowerCase().includes(auditSearch.toLowerCase())
                      )
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-[#F6F4EE]/50">
                          <td className="py-3 px-4 text-[#202A27]/70 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString('fr-FR')}
                          </td>
                          <td className="py-3 px-4 font-bold text-[#174B3A]">
                            {log.adminUsername}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] font-bold">
                            {log.action}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#202A27]">
                            {log.entityName}
                          </td>
                          <td className="py-3 px-4 font-black tabular-nums">
                            {log.adjustment !== null ? (
                              <span
                                className={log.adjustment > 0 ? 'text-emerald-700' : 'text-red-700'}
                              >
                                {log.adjustment > 0 ? `+${log.adjustment}` : log.adjustment}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-3 px-4 text-[#202A27]/80 italic">
                            « {log.reason} »
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: PARAMÈTRES GÉNÉRAUX */}
        {activeTab === 'settings' && settings && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-2xl font-black text-[#202A27]">Paramètres de la Plateforme</h2>
              <p className="text-xs text-[#202A27]/60 font-medium">
                Personnalisez la date, les noms officiels et la configuration
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E2E8E3] shadow-xs space-y-4">
              <div>
                <label className="text-xs font-bold text-[#202A27] block mb-1">
                  Nom de la commune
                </label>
                <input
                  type="text"
                  defaultValue={settings.municipality}
                  onBlur={(e) => handleUpdateSettings({ municipality: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8E3] text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#202A27] block mb-1">
                  Wilaya
                </label>
                <input
                  type="text"
                  defaultValue={settings.wilaya}
                  onBlur={(e) => handleUpdateSettings({ wilaya: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8E3] text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#202A27] block mb-1">
                  Date de la consultation (modifiable)
                </label>
                <input
                  type="date"
                  defaultValue={settings.eventDate}
                  onChange={(e) => handleUpdateSettings({ eventDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8E3] text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#202A27] block mb-1">
                  Titre d'accueil (Français)
                </label>
                <input
                  type="text"
                  defaultValue={settings.welcomeTitleFr}
                  onBlur={(e) => handleUpdateSettings({ welcomeTitleFr: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8E3] text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#202A27] block mb-1">
                  Titre d'accueil (Arabe)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  defaultValue={settings.welcomeTitleAr}
                  onBlur={(e) => handleUpdateSettings({ welcomeTitleAr: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8E3] text-sm font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADJUST VOTES WITH MANDATORY REASON */}
        {voteAdjustModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-[#E2E8E3] p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-black text-[#202A27]">
                {adjustIsAdd ? 'Ajouter des voix' : 'Retirer des voix'}
              </h3>
              <p className="text-xs font-semibold text-[#202A27]/60 mt-1 mb-4">
                Entité concernée : <strong>{voteAdjustModal.entityName}</strong> (Actuellement : {voteAdjustModal.currentVotes} voix)
              </p>

              {adjustError && (
                <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold">
                  {adjustError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#202A27] block mb-1">
                    Quantité
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8E3] font-black text-lg text-[#174B3A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#202A27] block mb-1">
                    Motif obligatoire de la modification
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ex: Rectification suite au recomptage du bureau de vote N° 04"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8E3] text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setVoteAdjustModal(null);
                      setAdjustReason('');
                      setAdjustError('');
                    }}
                    className="flex-1 py-3 rounded-xl border border-[#E2E8E3] text-xs font-bold cursor-pointer hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={submitVoteAdjustment}
                    className="flex-1 py-3 rounded-xl bg-[#174B3A] text-white font-extrabold text-xs cursor-pointer hover:bg-[#103D32]"
                  >
                    Confirmer l'opération
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: UNBLOCK IP */}
        {unblockModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-[#E2E8E3] p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-black text-[#202A27]">Débloquer l'empreinte IP</h3>
              <p className="text-xs font-mono text-[#174B3A] mt-1 mb-4 truncate">
                {unblockModal.ipFingerprint}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#202A27] block mb-1">
                    Motif obligatoire de déblocage
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Justification de partage de connexion légitime à la mairie"
                    value={unblockReason}
                    onChange={(e) => setUnblockReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8E3] text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setUnblockModal(null)}
                    className="flex-1 py-3 rounded-xl border border-[#E2E8E3] text-xs font-bold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={submitUnblock}
                    className="flex-1 py-3 rounded-xl bg-[#174B3A] text-white font-extrabold text-xs cursor-pointer hover:bg-[#103D32]"
                  >
                    Confirmer le déblocage
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
