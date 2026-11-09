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
      {selectedFilter === 'all' && parties.length > 0 && (() => {
        const rankCounts: Record<number, number> = {};
        parties.forEach((p) => { rankCounts[p.rank] = (rankCounts[p.rank] || 0) + 1; });
        const leaders = parties.filter((p) => p.rank === 1 && p.ballotCount > 0);
        const others = parties.filter((p) => !leaders.includes(p));
        const tied = leaders.length > 1;
        return (
          <div className="max-w-4xl mx-auto space-y-4">
            {leaders.length > 0 && (
              <div>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-900">
                    {tied ? `En tête · ex æquo (${leaders.length} listes)` : 'En tête du classement'}
                  </span>
                </div>
                <div className={`grid gap-3 sm:gap-4 ${tied ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                  {leaders.map((p) => (
                    <div key={p.id} className="p-5 sm:p-6 rounded-3xl bg-linear-to-br from-amber-50 via-white to-amber-50/40 border-2 border-amber-300 shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-amber-300 p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                          <img src={p.logoUrl} alt={p.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-amber-400/25 text-amber-900 border border-amber-300 font-black text-[10px] uppercase tracking-wider">
                            1er{tied ? ' ex æquo' : ''} · Liste N° {p.listNumber}
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] truncate mt-1">{p.name}</h3>
                          <p className="text-xs font-semibold text-[#475569] truncate" dir="rtl">{p.arabicName}</p>
                        </div>
                        <div className="text-right rtl:text-left shrink-0">
                          <span className="text-3xl sm:text-4xl font-black text-[#0060A8] tabular-nums leading-none">{p.ballotCount}</span>
                          <span className="text-[11px] text-[#64748B] block font-bold mt-1">voix · {p.percentage}%</span>
                        </div>
                      </div>
                      <div className="mt-4 w-full bg-amber-200/50 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${p.percentage}%` }} />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs font-semibold text-[#475569]">
                        <span>{p.candidateCount} candidats</span>
                        <button onClick={() => setSelectedFilter(p.id)} className="text-[#0060A8] hover:underline font-black cursor-pointer">
                          Voir les candidats →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2.5 pt-2">
              {others.map((party) => {
                const zero = party.ballotCount === 0;
                const shared = (rankCounts[party.rank] || 0) > 1;
                return (
                  <div
                    key={party.id}
                    className={`p-3.5 sm:p-4 rounded-2xl bg-white border border-[#D0DFEE] hover:border-[#0060A8]/40 transition-all flex items-center gap-3 sm:gap-4 ${zero ? 'opacity-70' : 'shadow-xs'}`}
                  >
                    <div className="w-10 shrink-0 text-center">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-sm ${zero ? 'bg-[#F1F5F9] text-[#94A3B8] border-[#E2E8F0]' : 'bg-[#E0F2FE] text-[#0060A8] border-[#BAE6FD]'}`}>
                        {zero ? '–' : `${party.rank}e`}
                      </div>
                      {shared && !zero && <span className="text-[9px] font-black text-[#64748B] uppercase block mt-0.5">ex æquo</span>}
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-1 shrink-0 flex items-center justify-center overflow-hidden">
                      <img src={party.logoUrl} alt={party.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="min-w-0 truncate">
                          <span className="text-base sm:text-lg font-black text-[#0F172A]">{party.name}</span>
                          <span className="text-[11px] text-[#64748B] ml-1.5 rtl:mr-1.5">N° {party.listNumber}</span>
                        </div>
                        <div className="text-right rtl:text-left shrink-0">
                          {zero ? (
                            <span className="text-xs font-bold text-[#94A3B8]">Aucune voix</span>
                          ) : (
                            <>
                              <span className="text-lg sm:text-xl font-black text-[#0060A8] tabular-nums">{party.ballotCount}</span>
                              <span className="text-[11px] text-[#64748B] font-bold ml-1">· {party.percentage}%</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-[#E2E8F0] rounded-full h-2 overflow-hidden">
                        <div className="bg-[#0060A8] h-full rounded-full transition-all duration-500" style={{ width: `${party.percentage}%` }} />
                      </div>
                      <button onClick={() => setSelectedFilter(party.id)} className="mt-1.5 text-[11px] font-black text-[#0060A8] hover:underline cursor-pointer">
                        Voir les candidats →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* FILTER VIEW: SPECIFIC PARTY CANDIDATES RANKING */}
      {selectedFilter !== 'all' && (() => {
        const currentParty = parties.find((p) => p.id === selectedFilter);
        const candidates = candidatesByParty[selectedFilter] || [];
        if (!currentParty) return null;
        const rankCounts: Record<number, number> = {};
        candidates.forEach((c) => { rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1; });
        const leaders = candidates.filter((c) => c.rank === 1 && c.voteCount > 0);
        const others = candidates.filter((c) => !leaders.includes(c));
        const tied = leaders.length > 1;
        return (
          <div className="max-w-4xl mx-auto">
            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#D0DFEE] mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-1.5 flex items-center justify-center shrink-0">
                  <img src={currentParty.logoUrl} alt={currentParty.name} className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-2xl font-black text-[#0F172A] truncate">{currentParty.name}</h3>
                  <p className="text-xs font-semibold text-[#64748B] truncate">{t.candidateRanking}</p>
                </div>
              </div>
              <div className="text-center bg-[#E0F2FE] px-3 sm:px-4 py-2 rounded-xl shrink-0">
                <span className="text-2xl font-black text-[#0060A8] tabular-nums block leading-none">{currentParty.ballotCount}</span>
                <span className="text-[10px] font-bold text-[#475569] uppercase">bulletins</span>
              </div>
            </div>

            {leaders.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-900">
                    {tied ? `En tête · ex æquo (${leaders.length} candidats)` : 'Candidat en tête'}
                  </span>
                </div>
                <div className={`grid gap-3 ${tied ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                  {leaders.map((c) => (
                    <div key={c.id} className="p-4 rounded-2xl bg-linear-to-br from-amber-50 via-white to-amber-50/40 border-2 border-amber-300 shadow-sm flex items-center gap-4">
                      <div className="w-16 h-20 rounded-xl overflow-hidden border-2 border-amber-400 bg-white shrink-0">
                        <img src={c.photoUrl} alt={c.lastName} className="w-full h-full object-cover object-top" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-amber-400/25 text-amber-900 border border-amber-300 font-black text-[10px] uppercase tracking-wider">
                          1er{tied ? ' ex æquo' : ''} · N° {c.listPosition}
                        </span>
                        <h4 className="text-base sm:text-lg font-black text-[#0F172A] truncate mt-1">{c.firstName} {c.lastName}</h4>
                        {c.arabicName && <p className="text-xs font-bold text-[#64748B] truncate" dir="rtl">{c.arabicName}</p>}
                        <div className="mt-2 w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${c.percentage}%` }} />
                        </div>
                      </div>
                      <div className="text-right rtl:text-left shrink-0">
                        <span className="text-2xl sm:text-3xl font-black text-[#0060A8] tabular-nums leading-none block">{c.voteCount}</span>
                        <span className="text-[11px] text-[#64748B] font-bold">voix · {c.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {others.map((cand) => {
                const zero = cand.voteCount === 0;
                const shared = (rankCounts[cand.rank] || 0) > 1;
                return (
                  <div key={cand.id} className={`p-3 rounded-xl bg-white border border-[#D0DFEE] flex items-center gap-3 ${zero ? 'opacity-70' : ''}`}>
                    <div className="w-9 shrink-0 text-center">
                      <span className={`text-sm font-black tabular-nums ${zero ? 'text-[#94A3B8]' : 'text-[#0060A8]'}`}>{zero ? '–' : `${cand.rank}e`}</span>
                      {shared && !zero && <span className="text-[8px] font-black text-[#64748B] uppercase block">ex æquo</span>}
                    </div>
                    <div className="w-11 h-13 rounded-lg overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
                      <img src={cand.photoUrl} alt={cand.lastName} className="w-full h-full object-cover object-top" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="min-w-0 truncate">
                          <span className="text-[11px] font-bold text-[#94A3B8] mr-1.5 rtl:ml-1.5">N° {cand.listPosition}</span>
                          <span className="text-sm sm:text-base font-bold text-[#0F172A]">{cand.firstName} {cand.lastName}</span>
                        </div>
                        <div className="shrink-0 text-right rtl:text-left">
                          {zero ? (
                            <span className="text-[11px] font-bold text-[#94A3B8]">0 voix</span>
                          ) : (
                            <>
                              <span className="text-base font-black text-[#0060A8] tabular-nums">{cand.voteCount}</span>
                              <span className="text-[11px] text-[#64748B] font-bold ml-1">· {cand.percentage}%</span>
                            </>
                          )}
                        </div>
                      </div>
                      {cand.profession && <p className="text-[11px] text-[#64748B] truncate mt-0.5">{cand.profession}</p>}
                      {!zero && (
                        <div className="mt-1.5 w-full bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#0060A8] h-full rounded-full" style={{ width: `${cand.percentage}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </section>
  );
};
