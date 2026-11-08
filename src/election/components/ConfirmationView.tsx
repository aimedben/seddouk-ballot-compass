import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Party, Candidate } from '../types';
import { Language, translations } from '../i18n';

interface ConfirmationViewProps {
  party: Party;
  selectedCandidates: Candidate[];
  currentLang: Language;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({
  party,
  selectedCandidates,
  currentLang,
  onConfirm,
  onBack,
  isSubmitting,
  errorMessage,
}) => {
  const t = translations[currentLang];
  const isAr = currentLang === 'ar';
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Title & Step Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-black uppercase tracking-wider text-[#0060A8] block mb-1">
          {t.step3}
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A]">
          {t.confirmTitle}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#475569] font-medium">
          {t.confirmSubtitle}
        </p>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 font-bold text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Review Card in APC theme */}
      <div className="bg-white rounded-3xl border-2 border-[#D0DFEE] shadow-md p-6 sm:p-8 mb-8">
        {/* Party Summary */}
        <div className="flex items-center gap-5 pb-6 border-b border-[#D0DFEE]">
          <div className="w-20 h-20 rounded-2xl bg-[#F8FAFC] border border-[#D0DFEE] p-2 flex items-center justify-center shrink-0 shadow-inner">
            <img
              src={party.logoUrl}
              alt={party.name}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#64748B] block">
              {t.chosenParty}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
              {party.name}
            </h3>
            <p className="text-sm font-bold text-[#475569] mt-0.5" dir="rtl">
              {party.arabicName}
            </p>
          </div>

          <div className="text-right rtl:text-left">
            <span className="text-xs font-bold text-[#64748B] block">
              {t.listNumber}
            </span>
            <span className="text-3xl sm:text-4xl font-black text-[#0060A8] tabular-nums">
              {party.listNumber}
            </span>
          </div>
        </div>

        {/* Selected Candidates Count & Thumbnails */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm sm:text-base font-black text-[#0F172A]">
              {t.selectedCandidatesList}
            </span>
            <span className="px-3.5 py-1 rounded-full bg-[#E0F2FE] text-[#0060A8] font-black text-xs border border-[#BAE6FD]">
              {selectedCandidates.length} candidat{selectedCandidates.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
            {selectedCandidates.map((cand) => (
              <div
                key={cand.id}
                className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#D0DFEE] flex items-center gap-3"
              >
                <div className="w-12 h-14 rounded-xl overflow-hidden border border-[#D0DFEE] bg-white shrink-0 shadow-2xs">
                  <img
                    src={cand.photoUrl}
                    alt={cand.lastName}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#0060A8] shrink-0">
                      N° {cand.listPosition}
                    </span>
                    <span className="text-sm font-black text-[#0F172A] truncate">
                      {cand.firstName} {cand.lastName}
                    </span>
                  </div>
                  {cand.profession && (
                    <p className="text-[11px] font-semibold text-[#64748B] truncate mt-0.5">
                      {cand.profession}
                    </p>
                  )}
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#0060A8] shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-1/3 py-4 rounded-2xl border-2 border-[#D0DFEE] hover:bg-white text-[#0F172A] font-black text-base flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <BackIcon className="w-5 h-5" />
          <span>{t.modifyChoiceBtn}</span>
        </button>

        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="w-full sm:w-2/3 py-4 rounded-2xl bg-[#0060A8] hover:bg-[#004B87] text-white font-black text-lg sm:text-xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-50 active:scale-98"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t.submittingVote}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-6 h-6 text-[#FCD34D]" />
              <span>{t.confirmVoteBtn}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
