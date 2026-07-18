'use client';
// ============================================================
// IEEE Icebreaker Arena — Admin Participant Connection Details
// ============================================================
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { getParticipant, getParticipantEntries } from '@/firebase/firestore';
import { Participant, Entry } from '@/types';
import { getInitials, stringToGradient } from '@/utils/helpers';
import { ArrowLeft, Clock, Users, Tag, Heart } from 'lucide-react';

export default function ParticipantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;
  const [user, setUser] = useState<Participant | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const u = await getParticipant(uid);
      const e = await getParticipantEntries(uid);
      setUser(u);
      setEntries(e);
      setLoading(false);
    }
    if (uid) load();
  }, [uid]);

  if (loading) {
    return (
      <div className="p-8 text-center bg-[#0a0f1e] min-h-screen text-white flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-white/40 bg-[#0a0f1e] min-h-screen flex items-center justify-center flex-col">
        <p>Participant details not found.</p>
        <button onClick={() => router.back()} className="btn-glass mt-4 text-xs py-2 px-4 rounded-xl">Go Back</button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl text-white">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to list
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Stats Block */}
        <div className="md:col-span-1 space-y-6">
          <motion.div className="glass-card p-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-4 animate-float"
              style={{ background: stringToGradient(user.name) }}
            >
              {getInitials(user.name)}
            </div>
            <h1 className="text-xl font-black">{user.name}</h1>
            <p className="text-sm text-purple-400 font-semibold uppercase mt-0.5">{user.department}</p>
            <p className="text-xs text-white/30 mt-1">Joined: {new Date(user.joinedAt).toLocaleTimeString()}</p>

            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/5">
              <div>
                <div className="text-2xl font-black text-blue-400">{user.meetingCount}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Connections</div>
              </div>
              <div>
                <div className="text-2xl font-black text-green-400">#{user.meetingCount > 0 ? 'Ranked' : '—'}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Leaderboard</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Logs Block */}
        <div className="md:col-span-2 space-y-6">
          <motion.div className="glass-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" /> Logged Connection Forms
            </h2>

            {entries.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-12">No connection forms logged yet.</p>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="p-4 glass rounded-xl border border-white/5 flex flex-col gap-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-base text-white/90">{entry.personName}</h3>
                        <p className="text-xs text-purple-300 font-semibold uppercase mt-0.5">{entry.personDepartment} · 📍 {entry.place}</p>
                      </div>
                      <span className="text-[10px] text-white/30 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {new Date(entry.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5 text-xs text-white/60">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        <span>Color: <strong className="text-white">{entry.favoriteColor || '—'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span>Hobby: <strong className="text-white">{entry.hobby || '—'}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
