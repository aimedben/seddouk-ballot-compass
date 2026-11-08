import React, { useState } from 'react';
import { Trophy, Award, BarChart3, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { ResultsData, PartyResult, CandidateResult } from '../types';
import { Language, translations } from '../i18n';

interface ResultsSectionProps {
  results: ResultsData | null;
  currentLang: Language;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ results, currentLang }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const t = translations[currentLang];
  const isAr = currentLang === 'ar';

  if (!results) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-[#E2E8E3] my-8">
        <div className="w-8 h-8 border-3 border-[#174B3A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-[#202A27]/70">Chargement des résultats...</p>
      </div>
    );
  }

  // If public results are disabled
  if (!results.publicResultsEnabled) {
    return (
      <section className="mt-12 bg-white rounded-3xl border border-[#E2E8E3] p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-xs">
        <div className="w-16 h-16 rounded-full bg-[#E8F0EB] text-[#174B3A] flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#174B3A] mb-2">{t.resultsTitle}</h2>
        <p className="text-base font-medium text-[#202A27]/70 max-w-lg mx-auto">
          {t.resultsDisabledMessage}
        </p>
      </section>
    );
  }

  const { parties, candidatesByParty, totalBallots, resultsStatus } = results;

  const getStatusBadge = () => {
    switch (resultsStatus) {
      case 'definitif':
        return {
          label: t.statusDefinitive,
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        };
      case 'en_cours':
        return {
          label: t.statusInProgress,
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
        };
      case 'provisoire':
      default:
        return {
          label: t.statusProvisional,
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <section className="mt-16 sm:mt-24 pt-10 border-t-2 border-[#D0DFEE]">
      {/* Section Header with Authentic APC Tableau d'Affichage Badge */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        {/* Authentic APC Seddouk Blue Display Notice Plate */}
        <div className="inline-block bg-[#0060A8] text-white px-5 py-1.5 rounded-xl font-black text-xs tracking-widest uppercase shadow-sm mb-3 border-2 border-[#004B87]">
          TABLEAU D'AFFICHAGE · بلدية صدوق
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <span className={`px-3 py-0.5 rounded-full text-xs font-black border ${statusBadge.bg}`}>
            {statusBadge.label}
          </span>
          <span className="text-[#64748B]">·</span>
          <span className="text-xs font-black text-[#0060A8]">{totalBallots} {t.votesCount}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0060A8]">
          {t.resultsTitle}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#475569] font-medium">
          {t.resultsSubtitle}
        </p>
      </div>

      {/* Global Information Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mb-8">
        <div className="bg-white p-4 rounded-2xl border border-[#D0DFEE] text-center shadow-xs">
          <span className="text-xs font-bold text-[#64748B] block">{t.totalValidBallots}</span>
          <span className="text-2xl sm:text-3xl font-black text-[#0060A8] tabular-nums">{totalBallots}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#D0DFEE] text-center shadow-xs">
          <span className="text-xs font-bold text-[#64748B] block">{t.totalLists}</span>
          <span className="text-2xl sm:text-3xl font-black text-[#0F172A] tabular-nums">{parties.length}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#D0DFEE] text-center shadow-xs">
          <span className="text-xs font-bold text-[#64748B] block">Commune</span>
          <span className="text-lg sm:text-xl font-black text-[#0F172A] mt-1 block">Seddouk</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#D0DFEE] text-center shadow-xs">
          <span className="text-xs font-bold text-[#64748B] block">Certification</span>
          <span className="text-xs sm:text-sm font-black text-[#0060A8] mt-1.5 block">Dépouillement direct</span>
        </div>
      </div>

      {/* Filter Tabs: TOUTES LES LISTES / FFS / AMAYNUT / FLN / RCD */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto py-2 px-2 mb-8 no-scrollbar">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            selectedFilter === 'all'
              ? 'bg-[#0060A8] text-white shadow-md'
              : 'bg-white text-[#334155] hover:bg-[#E0F2FE] border border-[#D0DFEE]'
          }`}
        >
          {t.tabAll}
        </button>
        {parties.map((party) => (
          <button
            key={party.id}
            onClick={() => setSelectedFilter(party.id)}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 ${
              selectedFilter === party.id
                ? 'bg-[#174B3A] text-white shadow-sm'
                : 'bg-white text-[#202A27]/80 hover:bg-[#E8F0EB] border border-[#E2E8E3]'
            }`}
          >
            <span>{party.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/10 tabular-nums">
              N° {party.listNumber}
            </span>
          </button>
        ))}
      </div>

      {/* FILTER VIEW: ALL LISTS RANKING */}
      {selectedFilter === 'all' && (
        <div className="max-w-4xl mx-auto space-y-4">
          {parties.length > 0 && (
            <>
              {/* 1st Place Highlighted Big Card */}
              {(() => {
                const first = parties[0];
                return (
                  <div
                    key={first.id}
                    className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-amber-50/80 via-white to-amber-50/40 border-2 border-amber-300 shadow-md relative overflow-hidden"
                  >
                    {/* Gold Ribbon / Badge */}
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-900 border border-amber-300 font-extrabold text-xs sm:text-sm">
                        <Trophy className="w-4 h-4 text-amber-600 fill-amber-500" />
                        <span>{t.firstPlaceBadge} (1er)</span>
                      </div>
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                        {t.listNumber} {first.listNumber}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-2 border-amber-300 p-2 shrink-0 shadow-xs flex items-center justify-center overflow-hidden">
                        <img
                          src={first.logoUrl}
                          alt={first.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 text-center sm:text-left rtl:sm:text-right w-full">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h3 className="text-2xl sm:text-3xl font-black text-[#202A27]">
                            {first.name}
                          </h3>
                          <div className="text-right rtl:text-left">
                            <span className="text-3xl sm:text-4xl font-black text-[#174B3A] tabular-nums">
                              {first.ballotCount}
                            </span>
                            <span className="text-xs text-[#202A27]/60 block font-semibold">
                              {first.percentage}% {t.percentValid}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm font-semibold text-[#202A27]/70 mt-1" dir="rtl">
                          {first.arabicName}
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-4 w-full bg-amber-200/50 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(5, first.percentage)}%` }}
                          />
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[#202A27]/70 pt-2 border-t border-amber-200/60">
                          <span>{first.candidateCount} candidats</span>
                          <button
                            onClick={() => setSelectedFilter(first.id)}
                            className="text-[#174B3A] hover:underline font-bold cursor-pointer"
                          >
                            Voir les voix des candidats →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 2nd, 3rd, 4th Places Compact Cards */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                {parties.slice(1).map((party) => {
                  const rankBadge =
                    party.rank === 2
                      ? { label: '2e', color: 'bg-slate-200 text-slate-800 border-slate-300' }
                      : party.rank === 3
                      ? { label: '3e', color: 'bg-amber-700/10 text-amber-800 border-amber-700/30' }
                      : { label: `${party.rank}e`, color: 'bg-slate-100 text-slate-700 border-slate-200' };

                  return (
                    <div
                      key={party.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8E3] hover:border-[#174B3A]/40 shadow-xs transition-all flex flex-col sm:flex-row items-center gap-4"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center font-extrabold text-base shrink-0 ${rankBadge.color}`}
                        >
                          {rankBadge.label}
                        </div>

                        <div className="w-14 h-14 rounded-xl bg-[#F6F4EE] border border-[#E2E8E3] p-1 shrink-0 flex items-center justify-center overflow-hidden">
                          <img
                            src={party.logoUrl}
                            alt={party.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="sm:hidden flex-1 text-right rtl:text-left">
                          <span className="text-xl font-black text-[#174B3A] tabular-nums">
                            {party.ballotCount}
                          </span>
                          <span className="text-xs text-[#202A27]/60 block font-semibold">
                            {party.percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 w-full">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-base sm:text-lg font-extrabold text-[#202A27]">
                              {party.name}
                            </span>
                            <span className="text-xs text-[#202A27]/60 ml-2 rtl:mr-2">
                              (Liste N° {party.listNumber})
                            </span>
                          </div>

                          <div className="hidden sm:block text-right rtl:text-left">
                            <span className="text-xl font-black text-[#174B3A] tabular-nums">
                              {party.ballotCount}
                            </span>
                            <span className="text-xs text-[#202A27]/60 block font-semibold">
                              {party.percentage}%
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-2 w-full bg-[#E2E8E3] rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-[#174B3A] h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(2, party.percentage)}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedFilter(party.id)}
                        className="text-xs font-bold text-[#174B3A] hover:bg-[#E8F0EB] px-3 py-1.5 rounded-lg border border-[#E2E8E3] shrink-0 cursor-pointer w-full sm:w-auto"
                      >
                        Détail candidats
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* FILTER VIEW: SPECIFIC PARTY CANDIDATES RANKING */}
      {selectedFilter !== 'all' && (
        <div className="max-w-4xl mx-auto">
          {(() => {
            const currentParty = parties.find((p) => p.id === selectedFilter);
            const candidates = candidatesByParty[selectedFilter] || [];
            const partyTotalVotes = currentParty?.ballotCount || 0;

            if (!currentParty) return null;

            return (
              <div>
                {/* Party Heading Banner */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8E3] mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-center sm:text-left rtl:sm:text-right">
                    <div className="w-16 h-16 rounded-xl bg-[#F6F4EE] border border-[#E2E8E3] p-1.5 flex items-center justify-center shrink-0">
                      <img
                        src={currentParty.logoUrl}
                        alt={currentParty.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#202A27]">
                        {currentParty.name} · {t.candidateRanking}
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-[#202A27]/70" dir="rtl">
                        {currentParty.arabicName}
                      </p>
                    </div>
                  </div>

                  <div className="text-center sm:text-right rtl:sm:text-left bg-[#F6F4EE] px-4 py-2 rounded-xl">
                    <span className="text-xs font-semibold text-[#202A27]/70 block">
                      Total bulletins de la liste
                    </span>
                    <span className="text-2xl font-black text-[#174B3A] tabular-nums">
                      {partyTotalVotes}
                    </span>
                  </div>
                </div>

                {/* 1st Candidate Highlight Card */}
                {candidates.length > 0 && (
                  <div className="p-6 rounded-2xl bg-amber-50/70 border-2 border-amber-300 mb-4 flex flex-col sm:flex-row items-center gap-6 shadow-xs">
                    <div className="relative">
                      <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-amber-400 bg-white shadow-xs">
                        <img
                          src={candidates[0].photoUrl}
                          alt={candidates[0].lastName}
                          className="w-full h-full object-cover object-top"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute -top-2.5 -left-2.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-xs shadow-xs">
                        1er
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left rtl:sm:text-right w-full">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                            Candidat N° {candidates[0].listPosition} sur l'affiche
                          </span>
                          <h4 className="text-xl sm:text-2xl font-extrabold text-[#202A27]">
                            {candidates[0].firstName} {candidates[0].lastName}
                          </h4>
                          {candidates[0].arabicName && (
                            <p className="text-sm font-bold text-[#202A27]/70" dir="rtl">
                              {candidates[0].arabicName}
                            </p>
                          )}
                        </div>

                        <div className="text-right rtl:text-left">
                          <span className="text-2xl sm:text-3xl font-black text-[#174B3A] tabular-nums">
                            {candidates[0].voteCount}
                          </span>
                          <span className="text-xs text-[#202A27]/60 block font-semibold">
                            {candidates[0].percentage}% {t.ballotsWithCandidate}
                          </span>
                        </div>
                      </div>

                      {candidates[0].profession && (
                        <p className="text-xs text-[#202A27]/70 mt-1 font-medium">
                          {candidates[0].profession} {candidates[0].age ? `(${candidates[0].age} ans)` : ''}
                        </p>
                      )}

                      <div className="mt-3 w-full bg-amber-200/60 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(3, candidates[0].percentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Remaining Candidates List */}
                <div className="space-y-2.5">
                  {candidates.slice(1).map((cand) => (
                    <div
                      key={cand.id}
                      className="p-3.5 sm:p-4 rounded-xl bg-white border border-[#E2E8E3] hover:border-[#174B3A]/40 shadow-2xs transition-all flex items-center gap-4"
                    >
                      <div className="w-8 text-center font-extrabold text-sm text-[#202A27]/60 tabular-nums">
                        #{cand.rank}
                      </div>

                      <div className="w-12 h-14 rounded-lg overflow-hidden border border-[#E2E8E3] bg-[#F6F4EE] shrink-0">
                        <img
                          src={cand.photoUrl}
                          alt={cand.lastName}
                          className="w-full h-full object-cover object-top"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="truncate">
                            <span className="text-xs font-bold text-[#202A27]/60 mr-2 rtl:ml-2">
                              [N° {cand.listPosition}]
                            </span>
                            <span className="text-sm sm:text-base font-bold text-[#202A27] truncate">
                              {cand.firstName} {cand.lastName}
                            </span>
                          </div>

                          <div className="text-right rtl:text-left shrink-0 ml-3 rtl:mr-3">
                            <span className="text-base font-extrabold text-[#174B3A] tabular-nums">
                              {cand.voteCount}
                            </span>
                            <span className="text-[11px] text-[#202A27]/60 ml-1.5 tabular-nums">
                              ({cand.percentage}%)
                            </span>
                          </div>
                        </div>

                        {cand.profession && (
                          <p className="text-[11px] text-[#202A27]/60 truncate mt-0.5">
                            {cand.profession}
                          </p>
                        )}

                        <div className="mt-1.5 w-full bg-[#E2E8E3] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#174B3A] h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(2, cand.percentage)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </section>
  );
};
