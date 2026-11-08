export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  browserPushEnabled: boolean;
  vibrateEnabled: boolean;
  mode: 'every_vote' | 'threshold' | 'rank_change';
  thresholdCount: number; // e.g., 5 or 10 votes
  partyFilter: 'all' | 'fln' | 'ffs' | 'rcd' | 'amaynut';
  notifyOnOwnVote: boolean;
}

export const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  browserPushEnabled: true,
  vibrateEnabled: true,
  mode: 'every_vote',
  thresholdCount: 5,
  partyFilter: 'all',
  notifyOnOwnVote: true,
};

export interface VoteNotificationEvent {
  id: string;
  partyId: string;
  partyName: string;
  listNumber: number;
  candidateCount: number;
  timestamp: string;
  totalBallots: number;
}
