export type ResultsStatus = 'non_disponible' | 'en_cours' | 'provisoire' | 'definitif';

export interface Party {
  id: string;
  name: string;
  arabicName: string;
  listNumber: number;
  logoUrl: string;
  themeColor: string; // party color for card branding
  accentColor: string;
  isPublic: boolean;
  displayOrder: number;
  manualVoteAdjustment: number;
  ballotCount: number; // calculated or adjusted
}

export interface Candidate {
  id: string;
  partyId: string;
  listPosition: number;
  firstName: string;
  lastName: string;
  arabicName: string;
  photoUrl: string;
  profession?: string;
  age?: number;
  isActive: boolean;
  manualVoteAdjustment: number;
  voteCount: number; // calculated or adjusted
}

export interface ElectionSettings {
  id: string;
  name: string;
  municipality: string;
  wilaya: string;
  eventDate: string;
  welcomeTitleFr: string;
  welcomeTitleAr: string;
  welcomeSubtitleFr: string;
  welcomeSubtitleAr: string;
  publicResultsEnabled: boolean;
  resultsStatus: ResultsStatus;
  ipProtectionEnabled: boolean;
  minCandidates: number;
  maxCandidates: number;
}

export interface Ballot {
  id: string;
  partyId: string;
  candidateIds: string[];
  ipFingerprint: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminUsername: string;
  action: string;
  entityType: 'party' | 'candidate' | 'settings' | 'security' | 'database';
  entityId: string;
  entityName: string;
  oldValue: any;
  adjustment: number | null;
  newValue: any;
  reason: string;
  createdAt: string;
}

export interface SecurityRecord {
  ipFingerprint: string;
  firstSeen: string;
  lastAttempt: string;
  attemptsCount: number;
  status: 'voted' | 'blocked' | 'unblocked';
  reason?: string;
}

export interface ElectionStatusResponse {
  settings: ElectionSettings;
  hasVoted: boolean;
  totalValidBallots: number;
  totalParties: number;
  totalCandidates: number;
}

export interface PartyResult {
  id: string;
  name: string;
  arabicName: string;
  listNumber: number;
  logoUrl: string;
  themeColor: string;
  accentColor: string;
  ballotCount: number;
  percentage: number;
  rank: number;
  candidateCount: number;
}

export interface CandidateResult {
  id: string;
  partyId: string;
  listPosition: number;
  firstName: string;
  lastName: string;
  arabicName: string;
  photoUrl: string;
  profession?: string;
  age?: number;
  voteCount: number;
  percentage: number; // % of party ballots that selected this candidate
  rank: number;
}

export interface ResultsData {
  publicResultsEnabled: boolean;
  resultsStatus: ResultsStatus;
  totalBallots: number;
  parties: PartyResult[];
  candidatesByParty: Record<string, CandidateResult[]>;
  lastUpdated: string;
}
