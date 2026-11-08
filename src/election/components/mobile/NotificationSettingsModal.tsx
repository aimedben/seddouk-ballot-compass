import React, { useState, useEffect } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Smartphone,
  Check,
  X,
  Play,
  Sliders,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import type { NotificationSettings } from '../../types/notifications';
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  playBallotChime,
  dispatchVoteNotification,
} from '../../services/notificationService';
import { Language } from '../../i18n';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  currentLang,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getNotificationSettings());
      if ('Notification' in window) {
        setPermissionStatus(Notification.permission);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    saveNotificationSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleRequestPush = async () => {
    const perm = await requestNotificationPermission();
    setPermissionStatus(perm);
    if (perm === 'granted') {
      setSettings((prev) => ({ ...prev, browserPushEnabled: true }));
    }
  };

  const handleTestNotification = () => {
    // Test with sample vote
    dispatchVoteNotification({
      id: `test-${Date.now()}`,
      partyId: settings.partyFilter === 'all' ? 'ffs' : settings.partyFilter,
      partyName:
        settings.partyFilter === 'fln'
          ? 'FLN (Front de Libération Nationale)'
          : settings.partyFilter === 'rcd'
          ? 'RCD (Rassemblement pour la Culture et la Démocratie)'
          : settings.partyFilter === 'amaynut'
          ? 'AMAYNUT (Liste Indépendante)'
          : 'FFS (Front des Forces Socialistes)',
      listNumber: settings.partyFilter === 'fln' ? 1 : settings.partyFilter === 'rcd' ? 9 : settings.partyFilter === 'amaynut' ? 101 : 7,
      candidateCount: 5,
      timestamp: new Date().toISOString(),
      totalBallots: 42,
    });
  };

  const isAr = currentLang === 'ar';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border-2 border-[#E2E8E3] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F0EB] text-[#174B3A] flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#202A27]">
              {isAr ? 'إعدادات الإشعارات والتنبيهات' : 'Personnaliser les Notifications'}
            </h3>
            <p className="text-xs font-semibold text-[#202A27]/60">
              {isAr
                ? 'تخصيص الإشعارات عند كل تصويت جديد في تطبيق أندرويد'
                : 'Alertes en direct à chaque vote enregistré sur l\'application'}
            </p>
          </div>
        </div>

        {/* Settings Body */}
        <div className="space-y-5 text-sm">
          {/* Master Toggle */}
          <div className="p-4 rounded-2xl bg-[#F6F4EE] border border-[#E2E8E3] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  settings.enabled ? 'bg-[#174B3A] text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-[#202A27] block">
                  {isAr ? 'تفعيل الإشعارات العامة' : 'Activer les notifications de vote'}
                </span>
                <span className="text-[11px] font-medium text-[#202A27]/60">
                  {isAr
                    ? 'تلقي إشعار عند تسجيل صوت جديد في بلدية صدوق'
                    : 'Recevoir une alerte quand un citoyen vote'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('enabled')}
              className={`w-13 h-7 rounded-full transition-colors relative p-1 cursor-pointer ${
                settings.enabled ? 'bg-[#174B3A]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {settings.enabled && (
            <>
              {/* Alert Frequency Mode */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#202A27]/70 block">
                  {isAr ? 'وتيرة الإشعارات' : 'Fréquence des alertes'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, mode: 'every_vote' }))}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      settings.mode === 'every_vote'
                        ? 'border-[#174B3A] bg-[#E8F0EB] text-[#174B3A] font-bold shadow-xs'
                        : 'border-[#E2E8E3] bg-white text-[#202A27]/80 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="text-xs font-extrabold block">
                      {isAr ? 'كل صوت في الحين' : 'Chaque vote direct'}
                    </span>
                    <span className="text-[10px] text-[#202A27]/60 block mt-0.5">
                      {isAr ? 'إشعار فوري مع كل صوت' : 'Temps réel instantané'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, mode: 'threshold' }))}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      settings.mode === 'threshold'
                        ? 'border-[#174B3A] bg-[#E8F0EB] text-[#174B3A] font-bold shadow-xs'
                        : 'border-[#E2E8E3] bg-white text-[#202A27]/80 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="text-xs font-extrabold block">
                      {isAr ? 'عتبات 5 أصوات' : 'Paliers (tous les 5 votes)'}
                    </span>
                    <span className="text-[10px] text-[#202A27]/60 block mt-0.5">
                      {isAr ? 'تجميع الإشعارات لتفادي الإزعاج' : 'Alertes groupées condensées'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Filter by Party */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#202A27]/70 block">
                  {isAr ? 'تصفية حسب القائمة الانتخابية' : 'Cibler une liste spécifique'}
                </label>
                <select
                  value={settings.partyFilter}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      partyFilter: e.target.value as any,
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8E3] bg-white text-xs font-bold text-[#202A27] focus:border-[#174B3A] focus:outline-none"
                >
                  <option value="all">
                    {isAr ? '🔔 جميع القوائم (FLN, FFS, RCD, AMAYNUT)' : '🔔 Toutes les listes (FLN, FFS, RCD, AMAYNUT)'}
                  </option>
                  <option value="fln">FLN - جبهة التحرير الوطني (Liste 1)</option>
                  <option value="ffs">FFS - جبهة القوى الاشتراكية (Liste 7)</option>
                  <option value="rcd">RCD - التجمع من أجل الثقافة والديمقراطية (Liste 9)</option>
                  <option value="amaynut">AMAYNUT - القائمة الحرة أماينوث (Liste 101)</option>
                </select>
              </div>

              {/* Sound & Vibrate Options */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => handleToggle('soundEnabled')}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    settings.soundEnabled
                      ? 'border-[#174B3A] bg-[#E8F0EB]/60 text-[#174B3A]'
                      : 'border-[#E2E8E3] bg-white text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {settings.soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-[#174B3A]" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                    <span className="text-xs font-bold">
                      {isAr ? 'صوت التنبيه' : 'Son carillon'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={() => {}}
                    className="w-4 h-4 accent-[#174B3A]"
                  />
                </div>

                <div
                  onClick={() => handleToggle('vibrateEnabled')}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    settings.vibrateEnabled
                      ? 'border-[#174B3A] bg-[#E8F0EB]/60 text-[#174B3A]'
                      : 'border-[#E2E8E3] bg-white text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#174B3A]" />
                    <span className="text-xs font-bold">
                      {isAr ? 'اهتزاز الهاتف' : 'Vibration'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.vibrateEnabled}
                    onChange={() => {}}
                    className="w-4 h-4 accent-[#174B3A]"
                  />
                </div>
              </div>

              {/* Browser Push Permission Status */}
              <div className="p-3.5 rounded-xl border border-[#E2E8E3] bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#202A27] block">
                    {isAr ? 'إشعارات نظام أندرويد (Système)' : 'Notifications système Android'}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 block">
                    Statut :{' '}
                    <strong
                      className={
                        permissionStatus === 'granted'
                          ? 'text-emerald-700'
                          : permissionStatus === 'denied'
                          ? 'text-red-700'
                          : 'text-amber-700'
                      }
                    >
                      {permissionStatus === 'granted'
                        ? 'Autorisé ✓'
                        : permissionStatus === 'denied'
                        ? 'Bloqué dans le navigateur'
                        : 'En attente d\'autorisation'}
                    </strong>
                  </span>
                </div>

                {permissionStatus !== 'granted' && (
                  <button
                    type="button"
                    onClick={handleRequestPush}
                    className="py-1.5 px-3 rounded-lg bg-[#174B3A] text-white text-xs font-bold hover:bg-[#103D32] transition-colors cursor-pointer"
                  >
                    {isAr ? 'السماح بالإشعارات' : 'Autoriser'}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Test Notification Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestNotification}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#174B3A] text-[#174B3A] hover:bg-[#E8F0EB] text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isAr ? 'تجربة إشعار تجريبي الآن' : 'Tester la notification (Son & Alerte)'}</span>
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-8 pt-4 border-t border-[#E2E8E3] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl text-xs font-bold text-[#202A27]/70 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {isAr ? 'إلغاء' : 'Annuler'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="py-2.5 px-6 rounded-xl bg-[#174B3A] hover:bg-[#103D32] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>{isAr ? 'تم الحفظ!' : 'Enregistré !'}</span>
              </>
            ) : (
              <span>{isAr ? 'حفظ التفضيلات' : 'Enregistrer les paramètres'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
