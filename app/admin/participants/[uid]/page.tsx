'use client';
// ============================================================
// IEEE Icebreaker Arena — Admin Participant Connection Details
// ============================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { getParticipant, getParticipantEntries } from '@/firebase/firestore';
import { Participant, Entry } from '@/types';
import { getInitials, stringToGradient } from '@/utils/helpers';
import { ArrowLeft, Clock, Users, Tag, Heart, Download, X } from 'lucide-react';

export default function ParticipantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;
  const [user, setUser] = useState<Participant | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

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
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl text-white pb-24 md:pb-8">
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
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 smooth-scroll">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="p-3 sm:p-4 glass rounded-xl border border-white/5 flex gap-3 sm:gap-4 relative overflow-hidden cursor-pointer hover:bg-white/8 hover:border-white/10 transition-all duration-200"
                  >
                    {entry.selfieUrl && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImage({ url: entry.selfieUrl!, name: entry.personName });
                        }}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 cursor-zoom-in hover:opacity-90 transition-opacity"
                        title="Click to zoom / download"
                      >
                        <img src={entry.selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col gap-2 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h3 className="font-black text-base text-white/90 truncate">{entry.personName}</h3>
                          <p className="text-xs text-purple-300 font-semibold uppercase mt-0.5">{entry.personDepartment} · 📍 {entry.place}</p>
                        </div>
                        <span className="text-[10px] text-white/30 flex items-center gap-1 flex-shrink-0">
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

                      {entry.notes && (
                        <div className="mt-2 pt-2 border-t border-white/5 text-xs text-white/50 truncate">
                          Notes: <span className="text-white/80 font-medium">{entry.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImage(null)}
            />

            <motion.div
              className="relative z-10 max-w-lg w-full flex flex-col items-center gap-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl">
                <img src={lightboxImage.url} alt="Enlarged Selfie" className="w-full h-auto max-h-[70vh] object-contain mx-auto" />
              </div>

              <a
                href={lightboxImage.url}
                download={`selfie-${lightboxImage.name.replace(/\s+/g, '-').toLowerCase()}.jpg`}
                className="btn-primary py-3 px-6 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20"
              >
                <Download className="w-4 h-4" /> Download Photo
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Entry Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-sm text-white">
            <motion.div
              className="absolute inset-0 bg-black/75"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setSelectedEntry(null)}
            />

            <motion.div
              className="relative z-10 w-full max-w-sm bg-[#111625] p-6 rounded-2xl border border-white/10 shadow-2xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18, ease: [0.215, 0.610, 0.355, 1.000] }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" /> Connection Details
                </h3>
                <button onClick={() => setSelectedEntry(null)} className="p-1 text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm max-h-[70vh] overflow-y-auto smooth-scroll pr-1">
                {selectedEntry.selfieUrl && (
                  <div
                    onClick={() => setLightboxImage({ url: selectedEntry.selfieUrl!, name: selectedEntry.personName })}
                    className="rounded-xl overflow-hidden border border-white/10 cursor-zoom-in hover:opacity-90 transition-opacity"
                    title="Click to enlarge"
                  >
                    <img src={selectedEntry.selfieUrl} alt="Selfie" className="w-full h-40 object-cover" />
                  </div>
                )}
                {[
                  ['Name', selectedEntry.personName],
                  ['Department', selectedEntry.personDepartment],
                  ['Place Met', selectedEntry.place],
                  ['Favourite Colour', selectedEntry.favoriteColor],
                  ['Hobby', selectedEntry.hobby],
                  ['Notes', selectedEntry.notes],
                  ['Logged At', new Date(selectedEntry.createdAt).toLocaleString()]
                ].map(([label, val]) =>
                  val ? (
                    <div key={label} className="glass rounded-xl px-4 py-3">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-0.5">{label}</p>
                      <p className="font-semibold text-white/90">{val}</p>
                    </div>
                  ) : null
                )}
                <div className="flex gap-2 pt-2">
                  {selectedEntry.selfieUrl && (
                    <a
                      href={selectedEntry.selfieUrl}
                      download={`selfie-${selectedEntry.personName.replace(/\s+/g, '-').toLowerCase()}.jpg`}
                      className="btn-primary flex-1 py-2.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="btn-glass flex-1 py-2.5 rounded-xl text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
