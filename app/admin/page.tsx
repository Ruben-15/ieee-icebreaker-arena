'use client';
// ============================================================
// IEEE Icebreaker Arena — Admin Dashboard Panel
// ============================================================
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { subscribeParticipants, subscribeEntries, updateSettings, getSettings, resetAllActivityData, deleteAllActivityData } from '@/firebase/firestore';
import { useActivity } from '@/context/ActivityContext';
import { Participant, Entry } from '@/types';
import { Users, Zap, Trophy, Clock, Play, Pause, Square, Trash2, RotateCcw, AlertTriangle, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-3xl font-black gradient-text mb-1">{value}</div>
      <p className="text-sm font-semibold text-white/80">{label}</p>
      {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { timerDisplay, status, timerRemaining, settings } = useActivity();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time stats
  useEffect(() => {
    const unsubParts = subscribeParticipants(setParticipants);
    const unsubEntries = subscribeEntries(setEntries);
    setLoading(false);
    return () => {
      unsubParts();
      unsubEntries();
    };
  }, []);

  // Controls
  async function handleStart() {
    try {
      await updateSettings({ activityStatus: 'active', activityRunning: true });
      toast.success('Activity Started! 🚀');
    } catch {
      toast.error('Failed to start activity');
    }
  }

  async function handlePause() {
    try {
      await updateSettings({ activityStatus: 'paused', activityRunning: false });
      toast('Activity Paused ⏸️', { icon: '⏱️' });
    } catch {
      toast.error('Failed to pause activity');
    }
  }

  async function handleResume() {
    try {
      await updateSettings({ activityStatus: 'active', activityRunning: true });
      toast.success('Activity Resumed! ▶️');
    } catch {
      toast.error('Failed to resume activity');
    }
  }

  async function handleStop() {
    if (!confirm('Are you sure you want to stop the activity? Submissions will freeze.')) return;
    try {
      await updateSettings({ activityStatus: 'ended', activityRunning: false });
      toast('Activity Stopped 🏁', { icon: '🏁' });
    } catch {
      toast.error('Failed to stop activity');
    }
  }

  async function handleResetCounts() {
    if (!confirm('Reset counts for all participants? All entries will be deleted!')) return;
    try {
      await resetAllActivityData();
      toast.success('All scores and connections reset successfully!');
    } catch {
      toast.error('Failed to reset activity data');
    }
  }

  async function handleDeleteAll() {
    if (!confirm('Permanently delete all participants and entries? This is irreversible!')) return;
    try {
      await deleteAllActivityData();
      toast.success('All participants and entries deleted successfully!');
    } catch {
      toast.error('Failed to delete data');
    }
  }

  async function adjustTimer(delta: number) {
    if (!settings) return;
    const newTime = Math.max(0, timerRemaining + delta);
    await updateSettings({ timerRemaining: newTime });
    toast(`Timer adjusted ${delta > 0 ? '+' : ''}${delta / 60}m`);
  }

  // Derived metrics
  const totalParticipants = participants.length;
  const totalEntries = entries.length;
  const avgConnections = totalParticipants > 0 ? Math.round((totalEntries / totalParticipants) * 10) / 10 : 0;
  
  // Current Leader
  const sorted = [...participants].sort((a, b) => b.meetingCount - a.meetingCount);
  const currentLeader = sorted[0]?.name ?? '—';
  const leaderConnections = sorted[0]?.meetingCount ?? 0;

  // Active / Logged connections in the last 5 minutes
  const activeTime = Date.now() - 300000;
  const liveParticipants = participants.filter(p => p.joinedAt > activeTime).length;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Admin Dashboard</h1>
        <p className="text-white/40">Real-Time Event Control & Live Metrics</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total Participants"
          value={totalParticipants}
          sub="Registered orientation students"
          color="from-blue-600 to-blue-800"
          delay={0}
        />
        <StatCard
          icon={Zap}
          label="Total Connections"
          value={totalEntries}
          sub="Total meets entered in form"
          color="from-purple-600 to-purple-800"
          delay={0.05}
        />
        <StatCard
          icon={Trophy}
          label="Current Leader"
          value={currentLeader}
          sub={leaderConnections > 0 ? `${leaderConnections} connections` : 'No connections yet'}
          color="from-yellow-500 to-amber-600"
          delay={0.1}
        />
        <StatCard
          icon={Clock}
          label="Timer remaining"
          value={timerDisplay}
          sub={status === 'active' ? '🟢 Active' : status === 'paused' ? '🟡 Paused' : status === 'ended' ? '🔴 Ended' : '⚪ Idle'}
          color="from-indigo-600 to-violet-800"
          delay={0.15}
        />
        <StatCard
          icon={Users}
          label="Live Participants"
          value={liveParticipants}
          sub="Students joined last 5 mins"
          color="from-green-600 to-emerald-800"
          delay={0.2}
        />
        <StatCard
          icon={Zap}
          label="Average Connections"
          value={avgConnections}
          sub="Meets per student"
          color="from-orange-600 to-amber-800"
          delay={0.25}
        />
      </div>

      {/* Controls Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Timer Control Card */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> Timer Management
          </h2>

          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              {[-300, -60, 60, 300].map(delta => (
                <button
                  key={delta}
                  onClick={() => adjustTimer(delta)}
                  disabled={status === 'idle'}
                  className="btn-glass text-xs py-2 px-3 flex-1 disabled:opacity-40"
                >
                  {delta > 0 ? '+' : ''}{delta / 60}m
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-2">
              {status === 'idle' && (
                <button onClick={handleStart} className="btn-primary flex items-center justify-center gap-2 py-3 flex-1">
                  <Play className="w-4 h-4" /> Start Activity
                </button>
              )}
              {status === 'active' && (
                <>
                  <button onClick={handlePause} className="btn-glass flex items-center justify-center gap-2 py-3 flex-1 border border-yellow-500/20 text-yellow-400">
                    <Pause className="w-4 h-4" /> Pause
                  </button>
                  <button onClick={handleStop} className="btn-glass flex items-center justify-center gap-2 py-3 flex-1 border border-red-500/20 text-red-400">
                    <Square className="w-4 h-4" /> End Activity
                  </button>
                </>
              )}
              {status === 'paused' && (
                <>
                  <button onClick={handleResume} className="btn-primary flex items-center justify-center gap-2 py-3 flex-1">
                    <Play className="w-4 h-4" /> Resume
                  </button>
                  <button onClick={handleStop} className="btn-glass flex items-center justify-center gap-2 py-3 flex-1 border border-red-500/20 text-red-400">
                    <Square className="w-4 h-4" /> End Activity
                  </button>
                </>
              )}
              {status === 'ended' && (
                <button
                  onClick={async () => {
                    await updateSettings({ activityStatus: 'idle', timerRemaining: settings?.timer ?? 600 });
                    toast.success('Session reset to setup mode!');
                  }}
                  className="btn-glass flex items-center justify-center gap-2 py-3 flex-1"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Timer Setup
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Danger zone controls */}
        <div className="glass-card p-6 border border-red-500/20">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" /> Danger Zone
          </h2>
          <p className="text-xs text-white/50 mb-6">These operations will immediately clear orientation statistics and data.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleResetCounts}
              className="btn-glass text-xs py-3 w-full border border-orange-500/20 text-orange-400 hover:bg-orange-500/10 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Reset All Connections & Count (Delete Entries)
            </button>
            <button
              onClick={handleDeleteAll}
              className="btn-glass text-xs py-3 w-full border border-red-500/20 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete All Participants & Data
            </button>
          </div>
        </div>
      </div>

      {/* Projector preview card */}
      <div className="glass-card p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm">Real-Time Projector Screen</h3>
          <p className="text-xs text-white/40 mt-1">Open the live projector screen designed for orientation hall displays.</p>
        </div>
        <Link
          href="/projector"
          target="_blank"
          className="btn-primary text-xs py-3 px-6 rounded-xl flex items-center gap-2"
        >
          <Monitor className="w-4 h-4" /> Launch Projector View
        </Link>
      </div>
    </div>
  );
}
