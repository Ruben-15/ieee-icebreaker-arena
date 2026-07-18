'use client';
// ============================================================
// IEEE Icebreaker Arena — Real-Time Projector Leaderboard Page
// ============================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeParticipants, subscribeEntries } from '@/firebase/firestore';
import { useActivity } from '@/context/ActivityContext';
import { Participant, Entry } from '@/types';
import { Trophy, Clock, Users, Zap, Award } from 'lucide-react';
import { stringToGradient, getInitials } from '@/utils/helpers';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

export default function ProjectorPage() {
  const { timerDisplay, isActive, timerRemaining, settings } = useActivity();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [prevLeader, setPrevLeader] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Real-time listen to participants
  useEffect(() => {
    const unsub = subscribeParticipants((list) => {
      const sorted = [...list].sort((a, b) => b.meetingCount - a.meetingCount);
      // Confetti logic if leader changes
      const currentLeader = sorted[0]?.uid ?? null;
      if (prevLeader && currentLeader && currentLeader !== prevLeader) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      setPrevLeader(currentLeader);
      setParticipants(sorted);
    });
    return unsub;
  }, [prevLeader]);

  // Real-time listen to entries count
  useEffect(() => {
    setMounted(true);
    const unsub = subscribeEntries(setEntries);
    return unsub;
  }, []);

  const top10 = participants.slice(0, 10);
  const maxScore = participants[0]?.meetingCount || 1;
  const timerWarning = timerRemaining > 0 && timerRemaining <= 60;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060b28] flex flex-col p-8 text-white select-none">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} colors={['#006EB8', '#7c3aed', '#a855f7', '#22c55e', '#f59e0b']} />}

      {/* Aurora background */}
      <div className="aurora-bg opacity-65">
        <div className="aurora-blob" />
        <div className="aurora-blob" />
        <div className="aurora-blob" />
        <div className="aurora-blob" />
      </div>

      {/* Particle background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {mounted && Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.8, 1], y: [0, -30, 0] }}
            transition={{
              duration: 5 + Math.random() * 5,
              delay: Math.random() * 5,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Header bar */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#006EB8] to-[#7c3aed] flex items-center justify-center font-black text-xl shadow-lg">
            IEEE
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/40">Icebreaking Activity</p>
            <h1 className="text-3xl font-black gradient-text">{settings?.eventName || 'IEEE Orientation Arena'}</h1>
          </div>
        </div>

        {/* Stats & Timer summary */}
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-xs text-white/40 mb-1 flex items-center gap-1.5 justify-center"><Users className="w-3.5 h-3.5" /> Participants</p>
            <p className="text-3xl font-black text-blue-400">{participants.length}</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-xs text-white/40 mb-1 flex items-center gap-1.5 justify-center"><Clock className="w-3.5 h-3.5" /> Countdown</p>
            <p className={`text-4xl font-black font-mono tabular-nums ${
              timerWarning ? 'text-red-400 animate-pulse' : 'text-green-400'
            }`}>
              {timerDisplay}
            </p>
          </div>
        </div>
      </header>

      {/* Main Leaderboard Row */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full">
        {top10.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <Trophy className="w-20 h-20 mx-auto mb-4 opacity-25 animate-float" />
            <h2 className="text-2xl font-bold">Waiting for Activity to Start</h2>
            <p className="text-sm mt-1">Participants will appear here once they start logging connections.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {top10.map((p, i) => {
                const percentage = Math.max(8, Math.round((p.meetingCount / maxScore) * 100));
                
                // Rank styling config
                const rankConfig = [
                  {
                    borderColor: 'border-yellow-500/20',
                    borderLeft: 'border-l-4 border-l-yellow-500',
                    bgColor: 'bg-gradient-to-r from-yellow-500/8 via-white/3 to-white/1',
                    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.12)]',
                    badgeBg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
                    badgeText: 'text-slate-950 font-black',
                  },
                  {
                    borderColor: 'border-slate-300/10',
                    borderLeft: 'border-l-4 border-l-slate-300',
                    bgColor: 'bg-gradient-to-r from-slate-400/5 via-white/3 to-white/1',
                    glow: 'shadow-[0_0_20px_rgba(203,213,225,0.08)]',
                    badgeBg: 'bg-gradient-to-br from-slate-300 to-slate-500',
                    badgeText: 'text-slate-950 font-black',
                  },
                  {
                    borderColor: 'border-amber-600/20',
                    borderLeft: 'border-l-4 border-l-amber-600',
                    bgColor: 'bg-gradient-to-r from-amber-700/5 via-white/3 to-white/1',
                    glow: 'shadow-[0_0_15px_rgba(217,119,6,0.06)]',
                    badgeBg: 'bg-gradient-to-br from-amber-600 to-amber-800',
                    badgeText: 'text-white font-black',
                  }
                ][i] ?? {
                  borderColor: 'border-white/5',
                  borderLeft: 'border-l-4 border-l-purple-500/40',
                  bgColor: 'bg-white/3',
                  glow: '',
                  badgeBg: 'bg-white/5 border border-white/10',
                  badgeText: 'text-white/60 font-bold',
                };

                return (
                  <motion.div
                    key={p.uid}
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      type: 'spring', 
                      damping: 22, 
                      stiffness: 180,
                      delay: i * 0.05 
                    }}
                    className={`flex items-center gap-5 px-6 py-4 rounded-2xl ${rankConfig.bgColor} ${rankConfig.borderLeft} ${rankConfig.borderColor} ${rankConfig.glow} backdrop-blur-md relative overflow-hidden group hover:bg-white/8 transition-all duration-300`}
                  >
                    {/* Glass sheen highlight */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/2 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />

                    {/* Rank badge */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${rankConfig.badgeBg} ${rankConfig.badgeText} shadow-md`}>
                      {i === 0 ? '1' : i === 1 ? '2' : i === 2 ? '3' : i + 1}
                    </div>

                    {/* Avatar blob */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 shadow-lg ring-2 ring-white/5 ring-offset-2 ring-offset-[#060b28] transform group-hover:scale-105 transition-transform"
                      style={{ background: stringToGradient(p.name) }}
                    >
                      {getInitials(p.name)}
                    </div>

                    {/* Info */}
                    <div className="w-52 flex-shrink-0">
                      <p className="font-extrabold text-base leading-tight text-white tracking-wide group-hover:text-purple-300 transition-colors">{p.name}</p>
                      <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500/60" />
                        {p.department}
                      </p>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="flex-1 px-4 relative hidden md:block">
                      <div className="h-3 rounded-full bg-black/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] overflow-hidden relative p-[2px]">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.4)] relative"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    {/* Connection count */}
                    <div className="text-right pr-2 flex-shrink-0 pl-4">
                      <div className="text-2xl font-black text-white flex items-baseline gap-1 group-hover:scale-105 transition-transform">
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-extrabold font-mono tracking-tight drop-shadow-sm">
                          {p.meetingCount}
                        </span>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">MET</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <footer className="relative z-10 mt-6 border-t border-white/5 pt-4 text-center text-xs text-white/30">
        IEEE Orientation Icebreaker Arena • Live projector screen
      </footer>
    </div>
  );
}
