import React, { useState } from 'react';
import { Check, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Vote } from 'lucide-react';
import { Party, Candidate } from '../types';
import { Language, translations } from '../i18n';

interface CandidateVotingViewProps {
  party: Party;
  candidates: Candidate[];
  currentLang: Language;
  onBack: () => void;
  onProceedToConfirm: (selectedCandidateIds: string[]) => void;
}

export const CandidateVotingView: React.FC<CandidateVotingViewProps> = ({
  party,
  candidates,
  currentLang,
  onBack,
  onProceedToConfirm,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showMaxAlert, setShowMaxAlert] = useState(false);
  const t = translations[currentLang];
  const isAr = currentLang === 'ar';
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  const toggleCandidate = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
      setShowMaxAlert(false);
    } else {
      if (selectedIds.length >= 10) {
        setShowMaxAlert(true);
        setTimeout(() => setShowMaxAlert(false), 3500);
        return;
      }
      setSelectedIds([...selectedIds, id]);
      setShowMaxAlert(false);
    }
  };

  const handleValidate = () => {
    if (selectedIds.length === 0) return;
    onProceedToConfirm(selectedIds);
  };

  return (
    <div className="pb-32 max-w-6xl mx-auto px-4 sm:px-6 pt-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#D0DFEE] hover:bg-[#E0F2FE] text-[#0060A8] font-bold text-sm cursor-pointer transition-colors shadow-xs"
        >
          <BackIcon className="w-4 h-4" />
          <span>{isAr ? 'الرجوع للقوائم' : 'Changer de liste'}</span>
        </button>

        {/* Current list indicator */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-[#D0DFEE] shadow-xs">
          <img
            src={party.logoUrl}
            alt={party.name}
            className="w-8 h-8 object-contain rounded-lg"
          />
          <div className="flex items-baseline gap-2">
            <span className="font-black text-[#0F172A] text-base">{party.name}</span>
            <span className="text-xs font-bold text-[#0060A8]">(Liste {party.listNumber})</span>
          </div>
        </div>
      </div>

      {/* Hero Guidance in APC Theme */}
      <div className="bg-white rounded-3xl border border-[#D0DFEE] p-5 sm:p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-[#0060A8] uppercase tracking-wider block mb-1">
            {t.step2}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
            {t.selectCandidatesTitle}
          </h2>
          <p className="text-sm text-[#475569] font-medium mt-1">
            {t.selectCandidatesDesc}
          </p>
        </div>

        {/* Dynamic Selection Counter Box */}
        <div className="bg-[#E0F2FE] border-2 border-[#0060A8]/30 rounded-2xl p-4 sm:px-6 text-center shrink-0">
          <span className="text-[11px] font-black text-[#0060A8] uppercase tracking-wider block">
            {t.selectedCounter}
          </span>
          <div className="text-3xl sm:text-4xl font-black text-[#0060A8] tabular-nums mt-0.5">
            {selectedIds.length} <span className="text-xl sm:text-2xl text-[#64748B] font-normal">/ 10</span>
          </div>
        </div>
      </div>

      {/* Alert when 10 limit is reached */}
      {showMaxAlert && (
        <div className="p-4 rounded-2xl bg-amber-100 border-2 border-amber-400 text-amber-950 font-bold text-sm mb-6 flex items-center gap-3 animate-bounce">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
          <span>{t.maxCandidatesAlert}</span>
        </div>
      )}

      {/* Candidates Responsive Grid: 4 cols desktop, 3 cols tablet, 2 cols mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {candidates.map((cand) => {
          const isSelected = selectedIds.includes(cand.id);

          return (
            <div
              key={cand.id}
              onClick={() => toggleCandidate(cand.id)}
              className={`relative rounded-3xl bg-white border-3 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between group select-none shadow-xs ${
                isSelected
                  ? 'border-[#0060A8] ring-4 ring-[#0060A8]/20 transform scale-[1.01]'
                  : 'border-[#D0DFEE] hover:border-[#0060A8]/60 hover:shadow-md'
              }`}
            >
              {/* Top Banner inside card: Position number + Selection checkbox */}
              <div className="p-3 pb-2 flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-[#F8FAFC] border border-[#D0DFEE] flex items-center justify-center text-xs font-black text-[#0060A8] tabular-nums">
                  #{cand.listPosition}
                </span>

                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#0060A8] border-[#0060A8] text-white scale-110 shadow-xs'
                      : 'border-slate-300 bg-white group-hover:border-[#0060A8]'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>

              {/* Large Candidate Portrait */}
              <div className="px-3 sm:px-4">
                <div className="w-full aspect-4/5 rounded-2xl overflow-hidden bg-slate-100 border border-[#D0DFEE] relative shadow-inner">
                  <img
                    src={cand.photoUrl}
                    alt={`${cand.firstName} ${cand.lastName}`}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#0060A8]/15 border-2 border-[#0060A8] rounded-2xl pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Candidate Names & Details */}
              <div className="p-3 sm:p-4 pt-2.5 text-center">
                <h4 className="text-sm sm:text-base font-black text-[#0F172A] line-clamp-1 group-hover:text-[#0060A8] transition-colors">
                  {cand.firstName} {cand.lastName}
                </h4>
                {cand.arabicName && (
                  <p className="text-xs sm:text-sm font-bold text-[#475569] line-clamp-1 mt-0.5" dir="rtl">
                    {cand.arabicName}
                  </p>
                )}

                {cand.profession && (
                  <p className="text-[11px] font-semibold text-[#64748B] line-clamp-1 mt-1">
                    {cand.profession}
                  </p>
                )}
                {cand.age && (
                  <span className="text-[10px] text-[#94A3B8] block font-bold">
                    {cand.age} ans
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t-2 border-[#D0DFEE] p-4 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] text-[#0060A8] font-black text-lg flex items-center justify-center shrink-0 tabular-nums border border-[#BAE6FD]">
              {selectedIds.length}
            </div>
            <div>
              <span className="text-xs text-[#64748B] font-bold block">
                {t.selectedCounter}
              </span>
              <span className="text-sm sm:text-base font-black text-[#0F172A]">
                {selectedIds.length === 0
                  ? t.mustSelectAtLeastOne
                  : `${selectedIds.length} candidat${selectedIds.length > 1 ? 's' : ''} choisi${selectedIds.length > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          <button
            onClick={handleValidate}
            disabled={selectedIds.length === 0}
            className={`px-7 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg flex items-center gap-2 cursor-pointer transition-all shadow-md ${
              selectedIds.length > 0
                ? 'bg-[#0060A8] hover:bg-[#004B87] text-white hover:shadow-lg active:scale-98'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Vote className="w-5 h-5 text-[#FCD34D]" />
            <span>{t.voteBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
