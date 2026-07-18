'use client';
// ============================================================
// IEEE Icebreaker Arena — Participant Activity Logging Page
// ============================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useActivity } from '@/context/ActivityContext';
import { createEntry, updateEntry, getParticipantEntries, getParticipant, updateParticipant } from '@/firebase/firestore';
import { Entry, Participant } from '@/types';
import { Zap, Clock, Users, LogOut, Loader2, Edit3, Save, X, PlusCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ActivityPage() {
  const router = useRouter();
  const { participant, logout, loading } = useAuth();
  const { settings, timerDisplay, isActive, isEnded } = useActivity();

  // Participant local state
  const [localParticipant, setLocalParticipant] = useState<Participant | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  // Form State
  const [personName, setPersonName] = useState('');
  const [personDepartment, setPersonDepartment] = useState('');
  const [place, setPlace] = useState('');
  const [favoriteColor, setFavoriteColor] = useState('');
  const [hobby, setHobby] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit State
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editPlace, setEditPlace] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editHobby, setEditHobby] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Profile Edit State
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileDept, setProfileDept] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !participant) {
      router.replace('/');
    }
  }, [participant, loading, router]);

  // Load participant's entries & local stats
  useEffect(() => {
    if (!participant) return;
    async function loadData() {
      try {
        const list = await getParticipantEntries(participant!.uid);
        setEntries(list);
        const p = await getParticipant(participant!.uid);
        if (p) {
          setLocalParticipant(p);
          setProfileName(p.name);
          setProfileDept(p.department);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingEntries(false);
      }
    }
    loadData();
  }, [participant]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEnded) {
      toast.error('Time has ended! Submissions are frozen.');
      return;
    }
    if (!isActive) {
      toast.error('Activity is paused or has not started yet.');
      return;
    }
    if (!personName.trim() || !personDepartment.trim() || !place.trim() || !favoriteColor.trim() || !hobby.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await createEntry({
        participantId: participant!.uid,
        personName: personName.trim(),
        personDepartment: personDepartment.trim(),
        place: place.trim(),
        favoriteColor: favoriteColor.trim(),
        hobby: hobby.trim(),
        notes: notes.trim(),
      });

      toast.success(`Logged connection with ${personName}! 🤝`);

      // Reset form
      setPersonName('');
      setPersonDepartment('');
      setPlace('');
      setFavoriteColor('');
      setHobby('');
      setNotes('');

      // Refresh list
      const list = await getParticipantEntries(participant!.uid);
      setEntries(list);
      const p = await getParticipant(participant!.uid);
      if (p) setLocalParticipant(p);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit entry');
    } finally {
      setSubmitting(false);
    }
  }

  function handleEditClick(entry: Entry) {
    // Always open the modal — modal shows read-only view when paused/ended
    setEditingEntry(entry);
    setEditName(entry.personName);
    setEditDept(entry.personDepartment);
    setEditPlace(entry.place);
    setEditColor(entry.favoriteColor);
    setEditHobby(entry.hobby);
    setEditNotes(entry.notes || '');
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEntry) return;
    if (isEnded || !isActive) {
      toast.error('Cannot save edits when activity is paused or ended');
      return;
    }
    setSavingEdit(true);
    try {
      await updateEntry(editingEntry.id, {
        personName: editName.trim(),
        personDepartment: editDept.trim(),
        place: editPlace.trim(),
        favoriteColor: editColor.trim(),
        hobby: editHobby.trim(),
        notes: editNotes.trim(),
      });
      toast.success('Connection details updated!');
      setEditingEntry(null);
      // Refresh list
      const list = await getParticipantEntries(participant!.uid);
      setEntries(list);
    } catch {
      toast.error('Failed to update details');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profileName.trim() || !profileDept.trim()) {
      toast.error('Name and department cannot be empty');
      return;
    }
    setSavingProfile(true);
    try {
      await updateParticipant(participant!.uid, {
        name: profileName.trim(),
        department: profileDept.trim(),
      });
      toast.success('Profile updated!');
      const p = await getParticipant(participant!.uid);
      if (p) setLocalParticipant(p);
      setShowProfileEdit(false);
    } catch {
      toast.error('Failed to update profile details');
    } finally {
      setSavingProfile(false);
    }
  }

  function handleLogout() {
    logout();
    router.replace('/');
  }

  if (loading || !participant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0f1e] text-white" style={{WebkitOverflowScrolling: 'touch'}}>
      {/* Background blobs */}
      <div className="aurora-bg opacity-40">
        <div className="aurora-blob" />
        <div className="aurora-blob" />
      </div>

      {/* Top Header */}
      <nav className="relative z-10 flex items-center justify-between px-3 sm:px-6 py-3.5 border-b border-white/5 bg-black/10 backdrop-blur-md">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#006EB8] to-[#7c3aed] flex items-center justify-center font-black text-xs flex-shrink-0">
            IEEE
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h1 className="font-bold text-xs sm:text-sm leading-none truncate max-w-[100px] sm:max-w-none">{localParticipant?.name || participant.name}</h1>
              <button
                onClick={() => setShowProfileEdit(true)}
                className="p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors flex-shrink-0"
                title="Edit name or department"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[9px] sm:text-[10px] text-white/40 mt-0.5 truncate max-w-[110px] sm:max-w-none">{localParticipant?.department || participant.department}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Status Display */}
          {isEnded ? (
            <div className="glass px-2.5 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold text-red-400 border border-red-500/20">
              🔴 Ended
            </div>
          ) : isActive ? (
            <div className="flex items-center gap-1.5 glass px-2.5 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold text-green-400 border border-green-500/10">
              <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 animate-pulse" /> {timerDisplay}
            </div>
          ) : (
            <div className="glass px-2.5 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold text-yellow-400 border border-yellow-500/20">
              ⏸️ Paused
            </div>
          )}

          <button onClick={handleLogout} className="p-1.5 sm:p-2 glass rounded-xl hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors">
            <LogOut className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>
        </div>
      </nav>

      {/* Body Grid */}
      <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">

        {/* Left Form: Add Connection */}
        <div className="md:col-span-7 space-y-4 sm:space-y-6">
          <div className="glass-card p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-black mb-1 flex items-center gap-2">
              <PlusCircle className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" /> Log Someone New
            </h2>
            <p className="text-[11px] sm:text-xs text-white/40 mb-4 sm:mb-6">Ask them these questions and write their answers here!</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] text-white/50 mb-1.5 font-medium uppercase tracking-wider">Person Name *</label>
                <input
                  type="text"
                  required
                  value={personName}
                  onChange={e => setPersonName(e.target.value)}
                  placeholder="Their name"
                  className="input-glass"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-white/50 mb-1.5 font-medium uppercase tracking-wider">Department *</label>
                  <input
                    type="text"
                    required
                    value={personDepartment}
                    onChange={e => setPersonDepartment(e.target.value)}
                    placeholder="e.g. CSE, ECE"
                    className="input-glass"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/50 mb-1.5 font-medium uppercase tracking-wider">Place Met *</label>
                  <input
                    type="text"
                    required
                    value={place}
                    onChange={e => setPlace(e.target.value)}
                    placeholder="e.g. Auditorium"
                    className="input-glass"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-white/50 mb-1.5 font-medium uppercase tracking-wider">Favourite Colour *</label>
                  <input
                    type="text"
                    required
                    value={favoriteColor}
                    onChange={e => setFavoriteColor(e.target.value)}
                    placeholder="e.g. Red"
                    className="input-glass"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/50 mb-1.5 font-medium uppercase tracking-wider">Hobby *</label>
                  <input
                    type="text"
                    required
                    value={hobby}
                    onChange={e => setHobby(e.target.value)}
                    placeholder="e.g. Football"
                    className="input-glass"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-white/50 mb-1.5 font-medium uppercase tracking-wider">More Details / Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Met during welcome tea, wants to join robotics committee"
                  className="input-glass"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || isEnded || !isActive}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isEnded ? (
                  'Submissions Frozen (Ended)'
                ) : !isActive ? (
                  'Activity Paused'
                ) : (
                  'Log Connection 🤝'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Stats: Connections Made */}
        <div className="md:col-span-5 space-y-4 sm:space-y-6">
          {/* Connection counter */}
          <div className="glass-card p-4 sm:p-6 text-center">
            <Users className="w-7 sm:w-8 h-7 sm:h-8 text-blue-400 mx-auto mb-2 animate-float" />
            <div className="text-4xl sm:text-5xl font-black gradient-text mb-1">
              {localParticipant?.meetingCount ?? 0}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white/80">People Met</p>
            <p className="text-[10px] sm:text-xs text-white/30 mt-1">Keep adding connections to climb ranks!</p>
          </div>

          {/* Recent list */}
          <div className="glass-card p-4 sm:p-5">
            <h3 className="font-bold text-xs sm:text-sm mb-3 sm:mb-4">Recent Connections</h3>
            {loadingEntries ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <p className="text-center text-white/30 text-xs py-6">No connections logged yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 smooth-scroll">
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => handleEditClick(entry)}
                    className="w-full flex items-center justify-between p-3 glass rounded-xl text-xs hover:bg-white/8 transition-all duration-200 text-left group"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-white/90 truncate">{entry.personName}</p>
                      <p className="text-[10px] text-white/40 truncate">{entry.personDepartment} · 📍 {entry.place}</p>
                    </div>
                    <div className="flex-shrink-0 ml-2 p-1.5 rounded-lg text-white/20 group-hover:text-white/60 transition-colors">
                      {isActive && !isEnded ? (
                        <Edit3 className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connection Detail / Edit Modal */}
      <AnimatePresence>
        {editingEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingEntry(null)}
            />

            <motion.div
              className="relative z-10 w-full max-w-sm glass-card p-6 border border-white/10"
              initial={{ scale: 0.95, opacity: 0, y: 35 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 35 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black flex items-center gap-2">
                  {isActive && !isEnded ? (
                    <><Edit3 className="w-5 h-5 text-purple-400" /> Edit Connection</>
                  ) : (
                    <><Eye className="w-5 h-5 text-blue-400" /> Connection Details</>
                  )}
                </h3>
                <button onClick={() => setEditingEntry(null)} className="p-1 text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* READ-ONLY VIEW when paused/ended */}
              {(!isActive || isEnded) ? (
                <div className="space-y-3 text-sm">
                  {[['Name', editingEntry.personName], ['Department', editingEntry.personDepartment], ['Place Met', editingEntry.place], ['Favourite Colour', editingEntry.favoriteColor], ['Hobby', editingEntry.hobby], ['Notes', editingEntry.notes]].map(([label, val]) =>
                    val ? (
                      <div key={label} className="glass rounded-xl px-4 py-3">
                        <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-0.5">{label}</p>
                        <p className="font-semibold text-white/90">{val}</p>
                      </div>
                    ) : null
                  )}
                  <div className="pt-2">
                    <button
                      onClick={() => setEditingEntry(null)}
                      className="btn-glass w-full py-2.5 rounded-xl text-xs font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* EDIT FORM when activity is active */
                <form onSubmit={handleSaveEdit} className="space-y-3 text-sm">
                  <div>
                    <label className="block text-[10px] text-white/50 mb-1.5 uppercase font-medium">Name</label>
                    <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} className="input-glass" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/50 mb-1.5 uppercase font-medium">Department</label>
                    <input type="text" required value={editDept} onChange={e => setEditDept(e.target.value)} className="input-glass" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/50 mb-1.5 uppercase font-medium">Place Met</label>
                    <input type="text" required value={editPlace} onChange={e => setEditPlace(e.target.value)} className="input-glass" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-white/50 mb-1.5 uppercase font-medium">Fav Colour</label>
                      <input type="text" value={editColor} onChange={e => setEditColor(e.target.value)} className="input-glass" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 mb-1.5 uppercase font-medium">Hobby</label>
                      <input type="text" value={editHobby} onChange={e => setEditHobby(e.target.value)} className="input-glass" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/50 mb-1.5 uppercase font-medium">Notes</label>
                    <input type="text" value={editNotes} onChange={e => setEditNotes(e.target.value)} className="input-glass" />
                  </div>
                  <div className="flex gap-2 pt-3">
                    <button type="button" onClick={() => setEditingEntry(null)} className="btn-glass flex-1 py-2.5 rounded-lg text-xs">Cancel</button>
                    <button type="submit" disabled={savingEdit} className="btn-primary flex-1 py-2.5 rounded-lg text-xs flex items-center justify-center gap-1 font-bold">
                      {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Save</>}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showProfileEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileEdit(false)}
            />

            <motion.div
              className="relative z-10 w-full max-w-sm glass-card p-6 border border-white/10"
              initial={{ scale: 0.95, opacity: 0, y: 35 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 35 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-purple-400" /> Edit Profile
                </h3>
                <button onClick={() => setShowProfileEdit(false)} className="p-1 text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
                <div>
                  <label className="block text-[10px] text-white/50 mb-1.5 uppercase font-medium">Your Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/50 mb-1.5 uppercase font-medium">Your Department</label>
                  <select
                    value={profileDept}
                    onChange={e => setProfileDept(e.target.value)}
                    className="input-glass"
                  >
                    {['CSE', 'AI', 'MECH', 'ECE', 'CIVIL', 'EEE'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowProfileEdit(false)}
                    className="btn-glass flex-1 py-2.5 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn-primary flex-1 py-2.5 rounded-lg text-xs flex items-center justify-center gap-1 font-bold"
                  >
                    {savingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><Save className="w-3.5 h-3.5" /> Save</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
