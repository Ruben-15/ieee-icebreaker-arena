// ============================================================
// IEEE Icebreaker Arena — Revised Mock Database (LocalStorage)
// ============================================================
import { Participant, Entry, AppSettings } from '@/types';

const DEFAULT_PARTICIPANTS: Participant[] = [
  { uid: 'part_1', name: 'Rohan Sharma', department: 'CSE', joinedAt: Date.now() - 3600000, meetingCount: 5 },
  { uid: 'part_2', name: 'Arjun Verma', department: 'ECE', joinedAt: Date.now() - 3000000, meetingCount: 4 },
  { uid: 'part_3', name: 'Priya Patel', department: 'EEE', joinedAt: Date.now() - 2400000, meetingCount: 3 },
  { uid: 'part_4', name: 'Aisha Khan', department: 'IT', joinedAt: Date.now() - 1800000, meetingCount: 2 },
  { uid: 'part_5', name: 'Kabir Singh', department: 'Mech', joinedAt: Date.now() - 1200000, meetingCount: 0 },
];

const DEFAULT_ENTRIES: Entry[] = [
  { id: 'e_1', participantId: 'part_1', personName: 'Vikram', personDepartment: 'CSE', place: 'Seminar Hall', favoriteColor: 'Red', hobby: 'Coding', createdAt: Date.now() - 3500000 },
  { id: 'e_2', participantId: 'part_1', personName: 'Nisha', personDepartment: 'ECE', place: 'Library', favoriteColor: 'Blue', hobby: 'Music', createdAt: Date.now() - 3400000 },
  { id: 'e_3', participantId: 'part_2', personName: 'Rahul', personDepartment: 'EEE', place: 'Cafeteria', favoriteColor: 'Green', hobby: 'Sports', createdAt: Date.now() - 2900000 },
];

const DEFAULT_SETTINGS: AppSettings = {
  activityRunning: true,
  activityStatus: 'active',
  timer: 600,
  timerRemaining: 600,
  eventName: 'IEEE Orientation 2026',
  projectorEnabled: true,
  themeColor: '#7c3aed',
  logoURL: '',
  projectorBackground: 'aurora',
  maxParticipants: 100,
};

const isClient = typeof window !== 'undefined';

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isClient) return defaultValue;
  const val = localStorage.getItem(`ieee_ice_v2_${key}`);
  return val ? JSON.parse(val) : defaultValue;
}

function setStorageItem<T>(key: string, value: T): void {
  if (!isClient) return;
  localStorage.setItem(`ieee_ice_v2_${key}`, JSON.stringify(value));
}

if (isClient && !localStorage.getItem('ieee_ice_v2_initialized')) {
  setStorageItem('participants', DEFAULT_PARTICIPANTS);
  setStorageItem('entries', DEFAULT_ENTRIES);
  setStorageItem('settings', DEFAULT_SETTINGS);
  localStorage.setItem('ieee_ice_v2_initialized', 'true');
}

export const mockDb = {
  getParticipants: () => getStorageItem<Participant[]>('participants', DEFAULT_PARTICIPANTS),
  setParticipants: (p: Participant[]) => {
    setStorageItem('participants', p);
    triggerMockUpdate('participants', p);
  },

  getEntries: () => getStorageItem<Entry[]>('entries', DEFAULT_ENTRIES),
  setEntries: (e: Entry[]) => {
    setStorageItem('entries', e);
    triggerMockUpdate('entries', e);
  },

  getSettings: () => getStorageItem<AppSettings>('settings', DEFAULT_SETTINGS),
  setSettings: (s: AppSettings) => {
    setStorageItem('settings', s);
    triggerMockUpdate('settings', s);
  },

  getParticipantSession: () => {
    if (!isClient) return null;
    const uid = localStorage.getItem('ieee_ice_v2_session_uid');
    if (!uid) return null;
    return getStorageItem<Participant[]>('participants', DEFAULT_PARTICIPANTS).find(p => p.uid === uid) ?? null;
  },
  setParticipantSession: (uid: string | null) => {
    if (!isClient) return;
    if (uid) localStorage.setItem('ieee_ice_v2_session_uid', uid);
    else localStorage.removeItem('ieee_ice_v2_session_uid');
    triggerMockUpdate('session', uid);
  },

  getAdminSession: () => {
    if (!isClient) return false;
    return localStorage.getItem('ieee_ice_v2_admin_logged') === 'true';
  },
  setAdminSession: (logged: boolean) => {
    if (!isClient) return;
    if (logged) localStorage.setItem('ieee_ice_v2_admin_logged', 'true');
    else localStorage.removeItem('ieee_ice_v2_admin_logged');
    triggerMockUpdate('adminSession', logged);
  }
};

const listeners: Record<string, Set<(data: any) => void>> = {};

export function triggerMockUpdate(key: string, data: any) {
  if (listeners[key]) {
    listeners[key].forEach(cb => cb(data));
  }
}

export function registerMockListener(key: string, callback: (data: any) => void) {
  if (!listeners[key]) listeners[key] = new Set();
  listeners[key].add(callback);
  return () => {
    listeners[key].delete(callback);
  };
}
