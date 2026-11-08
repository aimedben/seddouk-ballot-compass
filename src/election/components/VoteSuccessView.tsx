import React from 'react';
import { CheckCircle2, Vote, ArrowRight, ArrowLeft } from 'lucide-react';
import { Language, translations } from '../i18n';

interface VoteSuccessViewProps {
  currentLang: Language;
  onViewResults: () => void;
  onBackHome: () => void;
}

export const VoteSuccessView: React.FC<VoteSuccessViewProps> = ({
  currentLang,
  onViewResults,
  onBackHome,
}) => {
  const t = translations[currentLang];
  const isAr = currentLang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12 max-w-2xl mx-auto">
      {/* Big APC Blue Checkmark & Ballot Box Medallion */}
      <div className="relative mb-6">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#E0F2FE] border-4 border-[#0060A8] flex items-center justify-center text-[#0060A8] shadow-2xl">
          <Vote className="w-14 h-14 sm:w-16 sm:h-16 stroke-[1.8]" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#0060A8] text-white flex items-center justify-center shadow-lg border-2 border-white">
          <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
        </div>
      </div>

      {/* Main Success Headlines */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0060A8] tracking-tight">
        {t.successTitle}
      </h2>
      <p className="mt-3 text-lg sm:text-xl font-black text-[#D21034] tracking-wide">
        {t.successSubtitle}
      </p>

      {/* Civil confirmation notice */}
      <p className="mt-4 text-sm sm:text-base text-[#475569] font-medium max-w-md leading-relaxed">
        {t.successNotice}
      </p>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <button
          onClick={onViewResults}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0060A8] hover:bg-[#004B87] text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-xl transition-all active:scale-98"
        >
          <span>{t.viewResultsBtn}</span>
          <ArrowIcon className="w-5 h-5 text-[#FCD34D]" />
        </button>

        <button
          onClick={onBackHome}
          className="w-full sm:w-auto px-6 py-4 rounded-2xl border-2 border-[#D0DFEE] hover:bg-white text-[#0F172A] font-bold text-base transition-colors cursor-pointer"
        >
          <span>{t.backHome}</span>
        </button>
      </div>
    </div>
  );
};
