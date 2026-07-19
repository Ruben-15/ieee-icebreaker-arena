// ============================================================
// IEEE Icebreaker Arena — Revised Shared TypeScript Types
// ============================================================

export type ActivityStatus = 'idle' | 'active' | 'paused' | 'ended';

// -------------------------------------------------------------------
// Participant — stored in /participants/{participantId}
// -------------------------------------------------------------------
export interface Participant {
  uid: string; // matches document ID (participantId)
  name: string;
  department: string;
  joinedAt: number; // Unix ms
  meetingCount: number;
}

// -------------------------------------------------------------------
// Entry — stored in /entries/{entryId}
// -------------------------------------------------------------------
export interface Entry {
  id: string; // matches document ID (entryId)
  participantId: string;
  personName: string;
  personDepartment: string;
  place: string;
  favoriteColor: string;
  hobby: string;
  notes?: string;
  selfieUrl?: string;  // base64 data URL from camera capture
  createdAt: number; // Unix ms
}

// -------------------------------------------------------------------
// App Settings — stored in /settings/global
// -------------------------------------------------------------------
export interface AppSettings {
  activityRunning: boolean;
  activityStatus: ActivityStatus;
  timer: number; // initial duration in seconds
  timerRemaining: number; // remaining seconds
  pausedAt?: number;
  eventName: string;
  projectorEnabled: boolean;
  themeColor: string; // hex color
  logoURL?: string;
  projectorBackground?: string; // e.g. "aurora", "stars", "nebula"
  maxParticipants?: number;
}

// -------------------------------------------------------------------
// Leaderboard Entry for Grid display
// -------------------------------------------------------------------
export interface LeaderboardEntry {
  uid: string;
  name: string;
  department: string;
  meetingCount: number;
  rank: number;
}
