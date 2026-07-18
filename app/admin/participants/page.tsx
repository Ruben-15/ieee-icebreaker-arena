'use client';
// ============================================================
// IEEE Icebreaker Arena — Admin Participants Management Page
// ============================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeParticipants, deleteParticipant, resetParticipantCount } from '@/firebase/firestore';
import { Participant } from '@/types';
import { Search, RotateCcw, Trash2, Eye, Award } from 'lucide-react';
import { stringToGradient, getInitials } from '@/utils/helpers';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeParticipants((list) => {
      const sorted = [...list].sort((a, b) => b.meetingCount - a.meetingCount);
      setParticipants(sorted);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.department.toLowerCase().includes(search.toLowerCase())
  );

  async function handleResetCount(uid: string, name: string) {
    if (!confirm(`Are you sure you want to reset all counts and entries for ${name}?`)) return;
    try {
      await resetParticipantCount(uid);
      toast.success(`Reset connection count for ${name}!`);
    } catch {
      toast.error('Failed to reset count');
    }
  }

  async function handleDelete(uid: string, name: string) {
    if (!confirm(`Are you sure you want to delete ${name} permanently?`)) return;
    try {
      await deleteParticipant(uid);
      toast.success(`Deleted ${name} from event database`);
    } catch {
      toast.error('Failed to delete participant');
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black mb-1">Participants</h1>
          <p className="text-white/40">{participants.length} registered orientation students</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name or department..."
            className="input-glass pl-9 text-sm py-2"
          />
        </div>
      </div>

      {/* Grid List */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-white/30 font-semibold uppercase tracking-wider">
                <th className="px-5 py-3">Rank</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3 text-center">People Met</th>
                <th className="px-5 py-3">Joined At</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={6} className="px-5 py-5"><div className="skeleton h-6 rounded" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white/30">No students found matching search.</td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filtered.map((p, i) => (
                    <motion.tr
                      key={p.uid}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors"
                    >
                      <td className="px-5 py-4 font-black">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </td>
                      <td className="px-5 py-4 font-semibold">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
                            style={{ background: stringToGradient(p.name) }}
                          >
                            {getInitials(p.name)}
                          </div>
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-white/60">{p.department}</td>
                      <td className="px-5 py-4 text-center text-blue-400 font-bold">{p.meetingCount}</td>
                      <td className="px-5 py-4 text-white/40 text-xs">{new Date(p.joinedAt).toLocaleTimeString()}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/participants/${p.uid}`}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                            title="View Connection logs"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleResetCount(p.uid, p.name)}
                            className="p-2 rounded-lg hover:bg-orange-500/10 text-orange-400/50 hover:text-orange-400 transition-colors"
                            title="Reset counts"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.uid, p.name)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-400/50 hover:text-red-400 transition-colors"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
