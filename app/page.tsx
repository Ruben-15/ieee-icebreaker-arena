'use client';
// ============================================================
// IEEE Icebreaker Arena — Premium Landing Page
// ============================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useActivity } from '@/context/ActivityContext';
import { Zap, Award, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();
  const { participant, loginParticipant, loginAdmin, loading } = useAuth();
  const { settings, timerDisplay, isActive } = useActivity();

  // Participant Form Modal toggle
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [mounted, setMounted] = useState(false);

  // Redirect to activity if already joined
  useEffect(() => {
    setMounted(true);
    if (!loading && participant) {
      router.replace('/activity');
    }
  }, [participant, loading, router]);

  async function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Check if admin login entered in name input
    if (name.trim() === 'admin@7382' || name.trim() === 'admin123') {
      setSubmitting(true);
      try {
        const success = await loginAdmin('admin123', 'admin@7382');
        if (success) {
          toast.success('Admin authorized! 🔐');
          router.replace('/admin');
          return;
        }
      } catch {
        toast.error('Admin authorization failed');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!department.trim()) {
      toast.error('Please select your department');
      return;
    }

    setSubmitting(true);
    try {
      await loginParticipant(name, department);
      toast.success('Joined activity successfully! 🚀');
      router.replace('/activity');
    } catch {
      toast.error('Failed to join activity. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const DEPARTMENTS = ['CSE', 'AI', 'MECH', 'ECE', 'CIVIL', 'EEE'];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0f1e] text-white">
      {/* Aurora Background */}
      <div className="aurora-bg">
        <div className="aurora-blob" />
        <div className="aurora-blob" />
        <div className="aurora-blob" />
        <div className="aurora-blob" />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {mounted && Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.5, 1] }}
            transition={{
              duration: 4 + Math.random() * 4,
              delay: Math.random() * 5,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Main Hero Container */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl">

        {/* IEEE branding */}
        <motion.div
          className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#006EB8] to-[#7c3aed] flex items-center justify-center font-black text-xl mb-6 shadow-lg shadow-purple-500/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
        >
          IEEE
        </motion.div>

        {/* Big Premium Header */}
        <motion.h1
          className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="gradient-text">ICEBREAKER</span>
          <br />
          <span className="text-white">ARENA</span>
        </motion.h1>

        <motion.p
          className="text-white/60 text-base md:text-lg mb-10 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Welcome to the Orientation Challenge. Meet new students, log your connections, and top the leaderboard!
        </motion.p>

        <motion.div
          className="flex justify-center w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4 glow-purple font-bold rounded-2xl w-full sm:w-auto"
          >
            <Zap className="w-5 h-5 text-yellow-300" /> Join Activity
          </button>
        </motion.div>
      </main>

      {/* Participant Join Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowJoinModal(false)}
            />

            {/* Modal Body */}
            <motion.div
              className="relative z-10 w-full max-w-sm glass-card p-6 border border-white/10"
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-black">Welcome to Orientation! 🤝</h3>
                <p className="text-xs text-white/40 mt-1">Enter your details to join the challenge</p>
              </div>

              <form onSubmit={handleJoinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="input-glass"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wider">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="input-glass"
                  >
                    <option value="" disabled>Select Department</option>
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2 rounded-xl font-bold"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Let\'s Start! 🚀'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
