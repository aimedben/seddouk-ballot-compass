import React from 'react';
import { Bell, Smartphone } from 'lucide-react';
import { Language, translations } from '../i18n';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate: (view: string) => void;
  currentView: string;
  onOpenNotificationSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  onNavigate,
  currentView,
  onOpenNotificationSettings,
}) => {
  const t = translations[currentLang];
  const isRtl = currentLang === 'ar';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#D0DFEE] shadow-xs">
      {/* Authentic APC Seddouk Building Top Inscription Ribbon */}
      <div className="bg-[#0060A8] text-white text-[11px] sm:text-xs py-1.5 px-4 font-bold border-b border-[#004B87]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="inline-block w-4 h-3 bg-[#008751] rounded-xs relative overflow-hidden shrink-0 border border-white/40">
              <span className="absolute inset-y-0 right-0 w-1/2 bg-white" />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] text-[#D21034] font-black leading-none">★</span>
            </span>
            <span className="tracking-wide">Commune de Seddouk</span>
            <span className="text-white/40">·</span>
            <span className="font-arabic" dir="rtl">بلدية صدوق</span>
            <span className="text-white/40">·</span>
            <span className="text-amber-200 tracking-wider">ⵜⴰⵖⵉⵡⴰⵏⵜ ⵏ ⵚⴻⴷⴷⵓⵇ</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-white/80 text-[11px] font-semibold">
            <span>Hôtel de Ville — Wilaya de Béjaïa (06)</span>
            <span className="inline-block w-4 h-3 bg-[#008751] rounded-xs relative overflow-hidden shrink-0 border border-white/40">
              <span className="absolute inset-y-0 right-0 w-1/2 bg-white" />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] text-[#D21034] font-black leading-none">★</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand Zone with APC Diamond Emblem */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left rtl:text-right group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0060A8]"
        >
          {/* APC Diamond Emblem (inspired by the blue diamond reliefs on the building facade) */}
          <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
            <div className="w-9 h-9 bg-[#0060A8] rotate-45 rounded-lg shadow-sm group-hover:bg-[#004B87] transition-colors" />
            <span className="absolute text-white font-black text-sm tracking-tighter">APC</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-[#0060A8] whitespace-nowrap">
                SEDDOUK 2026
              </span>
              <span className="text-[10px] bg-[#E0F2FE] text-[#0060A8] font-extrabold px-1.5 py-0.2 rounded-md border border-[#BAE6FD]">
                APC
              </span>
            </div>
            <span className="text-xs text-[#475569] font-semibold whitespace-nowrap">
              {t.commune} · {t.wilaya}
            </span>
          </div>
        </button>

        {/* Quick public navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-[#334155]">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors cursor-pointer hover:text-[#0060A8] py-1 ${
              currentView === 'home'
                ? 'text-[#0060A8] border-b-2 border-[#0060A8]'
                : 'text-[#475569]'
            }`}
          >
            {currentLang === 'fr' ? 'Accueil' : 'الرئيسية'}
          </button>
          <button
            onClick={() => onNavigate('lists')}
            className={`transition-colors cursor-pointer hover:text-[#0060A8] py-1 ${
              currentView === 'lists' || currentView === 'vote'
                ? 'text-[#0060A8] border-b-2 border-[#0060A8]'
                : 'text-[#475569]'
            }`}
          >
            {currentLang === 'fr' ? 'Les 4 Listes' : 'القوائم الأربعة'}
          </button>
          <button
            onClick={() => onNavigate('results')}
            className={`transition-colors cursor-pointer hover:text-[#0060A8] py-1 ${
              currentView === 'results'
                ? 'text-[#0060A8] border-b-2 border-[#0060A8]'
                : 'text-[#475569]'
            }`}
          >
            {currentLang === 'fr' ? 'Tableau d\'Affichage (Résultats)' : 'لوحة النتائج'}
          </button>
        </nav>

        {/* Action Zone: Notifications & Language */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onOpenNotificationSettings && (
            <button
              onClick={onOpenNotificationSettings}
              className="p-2.5 rounded-xl bg-[#F0F7FF] hover:bg-[#E0F2FE] text-[#0060A8] border border-[#D0DFEE] transition-colors cursor-pointer relative shadow-xs"
              title={currentLang === 'ar' ? 'إعدادات الإشعارات' : 'Paramètres des notifications en direct'}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#F59E0B] rounded-full border-2 border-white animate-pulse" />
            </button>
          )}

          {/* Bilingual Language Switcher Toggle */}
          <div className="flex items-center bg-[#F1F5F9] border border-[#D0DFEE] rounded-xl p-0.5 shadow-xs">
            <button
              onClick={() => onLanguageChange('fr')}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                currentLang === 'fr'
                  ? 'bg-[#0060A8] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
              title="Passer en Français"
            >
              🇫🇷 FR
            </button>
            <button
              onClick={() => onLanguageChange('ar')}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                currentLang === 'ar'
                  ? 'bg-[#0060A8] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
              title="التحويل إلى العربية"
            >
              🇩🇿 العربية
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
