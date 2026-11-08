import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Bell,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Language } from '../../i18n';

interface AndroidInstallBannerProps {
  currentLang: Language;
  onOpenNotificationSettings: () => void;
}

export const AndroidInstallBanner: React.FC<AndroidInstallBannerProps> = ({
  currentLang,
  onOpenNotificationSettings,
}) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('seddouk_android_banner_dismissed') === 'true';
  });
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running inside installed standalone mobile app, hide install banner
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('seddouk_android_banner_dismissed', 'true');
  };

  const isAr = currentLang === 'ar';

  return (
    <>
      {/* Top Banner on Mobile & Desktop Access — Styled with APC Seddouk Municipal Colors */}
      <div className="bg-gradient-to-r from-[#003865] via-[#0060A8] to-[#0284C7] text-white border-b border-[#004B87] shadow-md transition-all">
        <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left info badge with APC emblem */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0 shadow-inner">
              <Smartphone className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider text-amber-300 uppercase">
                  {isAr ? 'تطبيق أندرويد بلدية صدوق' : 'Application Mobile Android — APC Seddouk'}
                </span>
                <span className="text-[10px] bg-white/20 text-white border border-white/30 px-1.5 py-0.2 rounded-full font-bold">
                  2026
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white/95 truncate">
                {isAr
                  ? 'ثبّت التطبيق لمتابعة النتائج وتلقي إشعارات فورية عند كل تصويت'
                  : 'Installez l\'application pour voter et recevoir des notifications à chaque vote'}
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onOpenNotificationSettings}
              title={isAr ? 'إعدادات الإشعارات' : 'Personnaliser les notifications'}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4 text-amber-300" />
              <span className="hidden md:inline">
                {isAr ? 'الإشعارات' : 'Notifications'}
              </span>
            </button>

            <button
              onClick={handleInstallClick}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>
                {isAr ? 'تثبيت تطبيق أندرويد' : 'Installer sur Android'}
              </span>
            </button>

            <button
              onClick={handleDismiss}
              aria-label="Fermer"
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Guide Modal when direct beforeinstallprompt is blocked or user asks */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-[#D0DFEE] max-w-md w-full p-6 sm:p-7 shadow-2xl relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              {/* APC Diamond emblem */}
              <div className="w-16 h-16 rounded-2xl bg-[#E0F2FE] text-[#0060A8] flex items-center justify-center mx-auto mb-3 shadow-inner relative">
                <Smartphone className="w-8 h-8 text-[#0060A8]" />
              </div>
              <h3 className="text-xl font-black text-[#0F172A]">
                {isAr ? 'تثبيت تطبيق أندرويد الرسمي' : 'Application Android — APC Seddouk'}
              </h3>
              <p className="text-xs font-semibold text-[#0060A8] mt-1">
                SEDDOUK ELECTIONS 2026 · HÔTEL DE VILLE
              </p>
            </div>

            <div className="space-y-4 text-xs font-medium text-[#334155]">
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#D0DFEE] flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#0060A8] text-white flex items-center justify-center text-xs font-black shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-[#0F172A] block font-extrabold text-sm mb-0.5">
                    {isAr ? 'افتح قائمة المتصفح (⋮)' : 'Ouvrez le menu Chrome / Android (⋮)'}
                  </strong>
                  <span>
                    {isAr
                      ? 'انقر على النقاط الثلاث في الزاوية العلوية لمتصفح Chrome أو Samsung Internet.'
                      : 'Cliquez sur les trois petits points verticaux en haut à droite de l\'écran.'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#D0DFEE] flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#0060A8] text-white flex items-center justify-center text-xs font-black shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-[#0F172A] block font-extrabold text-sm mb-0.5">
                    {isAr ? 'اختر "تثبيت التطبيق"' : 'Appuyez sur "Installer l\'application"'}
                  </strong>
                  <span>
                    {isAr
                      ? 'أو "إضافة إلى الشاشة الرئيسية" (Ajouter à l\'écran d\'accueil).'
                      : 'Ou cliquez sur "Ajouter à l\'écran d\'accueil". L\'application s\'ouvrira en plein écran sans barre d\'adresse.'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#E0F2FE] border border-[#0060A8]/30 flex items-start gap-3">
                <Bell className="w-5 h-5 text-[#0060A8] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0060A8] block font-extrabold text-xs">
                    {isAr ? 'إشعارات تلقائية عند كل صوت' : 'Notifications à chaque vote'}
                  </strong>
                  <span className="text-[#0060A8]/80 text-[11px]">
                    {isAr
                      ? 'بمجرد التثبيت، ستصلك تنبيهات صوتية ونظامية عند كل صوت مسجل للقوائم.'
                      : 'Recevez un carillon et une notification Android à chaque nouveau bulletin.'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#D0DFEE] flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowGuideModal(false);
                  onOpenNotificationSettings();
                }}
                className="flex-1 py-3 px-3 rounded-xl border border-[#0060A8] text-[#0060A8] font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-[#E0F2FE] transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>{isAr ? 'تخصيص الإشعارات' : 'Paramètres alertes'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0060A8] text-white font-extrabold text-xs hover:bg-[#004B87] transition-colors cursor-pointer text-center"
              >
                {isAr ? 'فهمت ذلك' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
