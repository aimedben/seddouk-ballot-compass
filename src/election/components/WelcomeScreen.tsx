import React from 'react';
import { MousePointerClick, Calendar, ShieldCheck, Vote, Building2 } from 'lucide-react';
import { Language, translations } from '../i18n';
import { AheddadEmblem } from './AheddadEmblem';
import { ElectionSettings } from '../types';

interface WelcomeScreenProps {
  currentLang: Language;
  settings: ElectionSettings | null;
  onStart: () => void;
  hasVoted: boolean;
  onViewResults: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  currentLang,
  settings,
  onStart,
  hasVoted,
  onViewResults,
}) => {
  const t = translations[currentLang];
  const isAr = currentLang === 'ar';

  // Election settings are read from the cloud database; show a neutral
  // placeholder until that request lands instead of any bundled defaults.
  if (!settings) {
    return (
      <div className="min-h-[calc(100vh-6.5rem)] flex flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-[#E0F2FE] border-t-[#0060A8]" />
        <p className="text-xs font-bold text-[#64748B]">
          {t.commune} · {t.wilaya}
        </p>
      </div>
    );
  }

  // Format event date
  const formattedDate = settings.eventDate
    ? new Date(settings.eventDate + 'T00:00:00').toLocaleDateString(
        currentLang === 'ar' ? 'ar-DZ' : 'fr-FR',
        { day: 'numeric', month: 'long', year: 'numeric' }
      ).toUpperCase()
    : '28 NOVEMBRE 2026';

  return (
    <div className="min-h-[calc(100vh-6.5rem)] flex flex-col justify-between py-8 sm:py-12 px-4 max-w-4xl mx-auto">
      {/* Top Banner / Civic Notice in APC Seddouk Blue */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E0F2FE] text-[#0060A8] text-xs sm:text-sm font-black border border-[#BAE6FD] shadow-xs">
          <Calendar className="w-4 h-4 text-[#0060A8]" />
          <span>{isAr ? settings.welcomeSubtitleAr : settings.welcomeSubtitleFr}</span>
        </div>
      </div>

      {/* Main Center Content */}
      <div className="my-auto text-center flex flex-col items-center">
        {/* Symbolic Emblem of Cheikh Aheddad with APC Seddouk diamond frame */}
        <div className="mb-6 relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#0060A8]/20 to-[#0284C7]/20 rounded-3xl blur-md" />
          <div className="relative">
            <AheddadEmblem size={110} />
          </div>
        </div>

        {/* Main Display Title in APC Seddouk Blue */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0060A8] leading-tight sm:leading-none max-w-3xl">
          {isAr ? settings.welcomeTitleAr : settings.welcomeTitleFr}
        </h1>

        {/* Subtitle Date & Commune */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xl sm:text-2xl font-black text-[#D21034]">
          <span>{formattedDate}</span>
        </div>

        {/* Short welcoming explanation */}
        <p className="mt-4 text-base sm:text-lg text-[#334155] max-w-xl font-semibold leading-relaxed">
          {t.welcomeSubtitle}
        </p>

        {/* Status notice if already participated */}
        {hasVoted && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 max-w-md text-sm font-bold shadow-xs">
            {t.alreadyVotedMessage}
          </div>
        )}
      </div>

      {/* Bottom Giant CTA Button */}
      <div className="pt-6 sm:pt-8 flex flex-col items-center gap-4">
        {!hasVoted ? (
          <button
            onClick={onStart}
            className="w-full sm:w-auto sm:min-w-[340px] px-8 py-5 sm:py-6 rounded-2xl bg-[#0060A8] hover:bg-[#004B87] text-white font-black text-xl sm:text-2xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer group focus-visible:outline-4 focus-visible:outline-[#0060A8]/50"
          >
            <MousePointerClick className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform text-[#FCD34D]" />
            <span>{t.startBtn}</span>
          </button>
        ) : (
          <button
            onClick={onViewResults}
            className="w-full sm:w-auto sm:min-w-[340px] px-8 py-5 sm:py-6 rounded-2xl bg-[#0060A8] hover:bg-[#004B87] text-white font-black text-xl sm:text-2xl shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Vote className="w-7 h-7 text-[#FCD34D]" />
            <span>{t.viewResultsBtn}</span>
          </button>
        )}

        <div className="flex items-center gap-3 text-xs text-[#64748B] font-bold">
          <span>{t.commune}</span>
          <span>·</span>
          <span>{t.wilaya}</span>
          <span>·</span>
          <span>Consultation citoyenne</span>
        </div>
      </div>
    </div>
  );
};
