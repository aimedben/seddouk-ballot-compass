import { NotificationSettings, defaultNotificationSettings, VoteNotificationEvent } from '../types/notifications';

const SETTINGS_KEY = 'seddouk_notification_settings';

export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultNotificationSettings;
    return { ...defaultNotificationSettings, ...JSON.parse(raw) };
  } catch (e) {
    return defaultNotificationSettings;
  }
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save notification settings', e);
  }
}

// Synthesize pleasant acoustic chime with Web Audio API (ballot urn chime)
export function playBallotChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;

    // First bell tone (G5: ~784Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, now);

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Second harmonious tone (C6: ~1046.5Hz) with slight delay
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1046.5, now + 0.12);

    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.85);
  } catch (e) {
    console.warn('Audio chime playback omitted or unsupported:', e);
  }
}

// Request Browser Push Notification Permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    return 'denied';
  }
}

// Listener subscribers for in-app floating banner
type InAppNotificationListener = (event: VoteNotificationEvent) => void;
const listeners = new Set<InAppNotificationListener>();

export function subscribeToInAppNotifications(listener: InAppNotificationListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Trigger vote notification
export function dispatchVoteNotification(event: VoteNotificationEvent, isOwnVote: boolean = false) {
  const settings = getNotificationSettings();

  if (!settings.enabled) return;

  // Filter out if user doesn't want their own vote notifications
  if (isOwnVote && !settings.notifyOnOwnVote) return;

  // Filter by party if selected
  if (settings.partyFilter !== 'all' && settings.partyFilter !== event.partyId) {
    return;
  }

  // Filter by threshold mode
  if (settings.mode === 'threshold') {
    if (event.totalBallots % settings.thresholdCount !== 0) {
      return;
    }
  }

  // 1. Play Sound
  if (settings.soundEnabled) {
    playBallotChime();
  }

  // 2. Vibrate on mobile
  if (settings.vibrateEnabled && 'vibrate' in navigator) {
    try {
      navigator.vibrate([100, 50, 100]);
    } catch (e) {
      // ignore
    }
  }

  // 3. Notify in-app toast listeners
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (err) {
      console.error(err);
    }
  });

  // 4. System / Android native notification
  if (settings.browserPushEnabled && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const title = `🗳️ Nouveau vote enregistré ! (Seddouk 2026)`;
      const body = `Un citoyen vient d'exprimer son suffrage pour : ${event.partyName} (Liste N° ${event.listNumber}). Total : ${event.totalBallots} votes.`;

      // If service worker is ready, use showNotification for better Android PWA integration
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon: '/pwa-192x192.png',
            badge: '/favicon.png',
            tag: `seddouk-vote-${Date.now()}`,
            data: { url: '/' },
          });
        }).catch(() => {
          new Notification(title, { body, icon: '/pwa-192x192.png' });
        });
      } else {
        new Notification(title, { body, icon: '/pwa-192x192.png' });
      }
    } catch (err) {
      console.warn('Native notification failed:', err);
    }
  }
}
