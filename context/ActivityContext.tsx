'use client';
// ============================================================
// ActivityContext — Real-time event state sync from Settings/Global document
// ============================================================
import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { subscribeSettings, updateSettings } from '@/firebase/firestore';
import { AppSettings, ActivityStatus } from '@/types';

interface ActivityContextType {
  settings: AppSettings | null;
  status: ActivityStatus;
  timerRemaining: number;
  timerDisplay: string;
  isActive: boolean;
  isPaused: boolean;
  isEnded: boolean;
}

const ActivityContext = createContext<ActivityContextType>({
  settings: null,
  status: 'idle',
  timerRemaining: 0,
  timerDisplay: '00:00',
  isActive: false,
  isPaused: false,
  isEnded: false,
});

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to settings/global from Firestore in real-time
  useEffect(() => {
    const unsubscribe = subscribeSettings((s) => {
      setSettings(s);
      if (s) {
        setTimerRemaining(s.timerRemaining ?? 0);
      }
    });
    return unsubscribe;
  }, []);

  // Sync remaining countdown locally
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (settings?.activityStatus === 'active') {
      intervalRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            // Autopause / end session when timer drops to zero
            updateSettings({ activityStatus: 'ended', activityRunning: false, timerRemaining: 0 }).catch(() => {});
            return 0;
          }
          // Periodically update firestore to keep dashboards in sync (every 5 seconds)
          const nextVal = prev - 1;
          if (nextVal % 5 === 0) {
            updateSettings({ timerRemaining: nextVal }).catch(() => {});
          }
          return nextVal;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [settings?.activityStatus]);

  function formatTime(secs: number): string {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  const status: ActivityStatus = settings?.activityStatus ?? 'idle';

  return (
    <ActivityContext.Provider
      value={{
        settings,
        status,
        timerRemaining,
        timerDisplay: formatTime(timerRemaining),
        isActive: status === 'active',
        isPaused: status === 'paused',
        isEnded: status === 'ended',
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  return useContext(ActivityContext);
}
