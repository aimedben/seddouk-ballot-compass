import React from 'react';
import { Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { Party } from '../types';
import { Language, translations } from '../i18n';

interface PartyCardProps {
  party: Party;
  currentLang: Language;
  onSelect: (partyId: string) => void;
  candidateCount?: number;
}

export const PartyCard: React.FC<PartyCardProps> = ({
  party,
  currentLang,
  onSelect,
  candidateCount = 26,
}) => {
  const t = translations[currentLang];
  const isAr = currentLang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="bg-white rounded-3xl border-2 border-[#D0DFEE] hover:border-[#0060A8] shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      {/* Top Banner with List Number */}
      <div className="p-5 sm:p-6 pb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* Official Party Logo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#F8FAFC] border border-[#D0DFEE] p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
            <img
              src={party.logoUrl}
              alt={party.name}
              className="w-full h-full object-contain rounded-xl"
              loading="lazy"
            />
          </div>

          {/* List Number in Large Distinct Font */}
          <div className="flex flex-col items-end rtl:items-start text-right rtl:text-left">
            <span className="text-xs font-black uppercase tracking-wider text-[#64748B]">
              {t.listNumber}
            </span>
            <span
              className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight"
              style={{ color: party.themeColor || '#0060A8' }}
            >
              {party.listNumber}
            </span>
          </div>
        </div>

        {/* Party Names */}
        <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] group-hover:text-[#0060A8] transition-colors leading-snug">
          {party.name}
        </h3>
        <p className="text-sm font-bold text-[#475569] mt-1 line-clamp-2" dir="rtl">
          {party.arabicName}
        </p>

        {/* Candidates Count */}
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#0060A8] bg-[#E0F2FE] px-3 py-1.5 rounded-xl w-fit border border-[#BAE6FD]">
          <Users className="w-3.5 h-3.5 text-[#0060A8]" />
          <span>{candidateCount} {t.candidatesCount}</span>
        </div>
      </div>

      {/* Bottom CTA Button in APC Seddouk Blue */}
      <div className="p-5 sm:p-6 pt-0">
        <button
          onClick={() => onSelect(party.id)}
          className="w-full py-4 px-4 rounded-2xl bg-[#0060A8] hover:bg-[#004B87] text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md group-hover:shadow-lg active:scale-98"
        >
          <span>{t.chooseList}</span>
          <ArrowIcon className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
