import React, { useState, useEffect } from 'react';
import { CheckCircle2, Bell, X } from 'lucide-react';
import { subscribeToInAppNotifications } from '../../services/notificationService';
import { VoteNotificationEvent } from '../../types/notifications';
import { Language } from '../../i18n';

interface VoteToastNotificationProps {
  currentLang: Language;
}

export const VoteToastNotification: React.FC<VoteToastNotificationProps> = ({ currentLang }) => {
  const [currentEvent, setCurrentEvent] = useState<VoteNotificationEvent | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToInAppNotifications((event) => {
      setCurrentEvent(event);
      const timer = setTimeout(() => {
        setCurrentEvent(null);
      }, 5000);
      return () => clearTimeout(timer);
    });

    return unsubscribe;
  }, []);

  if (!currentEvent) return null;

  const isAr = currentLang === 'ar';

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-bounce-in">
      <div className="bg-[#174B3A] text-white p-4 rounded-2xl border-2 border-emerald-400 shadow-2xl flex items-start gap-3 backdrop-blur-md">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
          <Bell className="w-5 h-5 text-amber-300 animate-wiggle" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
              {isAr ? '🗳️ صوت جديد مسجل !' : '🗳️ Nouveau vote enregistré !'}
            </span>
            <button
              onClick={() => setCurrentEvent(null)}
              className="p-1 text-white/60 hover:text-white rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h4 className="text-sm font-black text-white truncate mt-0.5">
            {currentEvent.partyName}
          </h4>

          <div className="flex items-center gap-2 mt-1 text-xs text-white/80 font-medium">
            <span>Liste N° {currentEvent.listNumber}</span>
            <span>·</span>
            <span className="text-amber-200 font-extrabold">
              Total : {currentEvent.totalBallots} votes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
