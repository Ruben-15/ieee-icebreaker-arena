'use client';
// ============================================================
// IEEE Icebreaker Arena — Admin Login Page
// ============================================================
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { adminLogged, loginAdmin, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  // Redirect if admin already logged in
  useEffect(() => {
    if (!loading && adminLogged) {
      router.replace('/admin');
    }
  }, [adminLogged, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !departmentCode.trim()) {
      toast.error('Please enter username and password');
      return;
    }
    setLoggingIn(true);
    try {
      const success = await loginAdmin(username, departmentCode);
      if (success) {
        toast.success('Admin authorized! 🔐');
        router.replace('/admin');
      } else {
        toast.error('Invalid admin credentials. Please try again.');
      }
    } finally {
      setLoggingIn(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#0a0f1e] text-white">
      {/* Aurora Background */}
      <div className="aurora-bg opacity-50">
        <div className="aurora-blob" />
        <div className="aurora-blob" />
        <div className="aurora-blob" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="glass-card p-6 border border-white/10">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#006EB8] to-[#7c3aed] flex items-center justify-center font-black text-sm mx-auto mb-3 shadow-lg">
              IEEE
            </div>
            <h2 className="text-xl font-black">Admin Access</h2>
            <p className="text-xs text-white/40 mt-1">Configure event orientaton dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wider">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                className="input-glass"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wider">Password / Dept Code</label>
              <div className="relative">
                <input
                  type={showCode ? 'text' : 'password'}
                  required
                  value={departmentCode}
                  onChange={e => setDepartmentCode(e.target.value)}
                  placeholder="Enter passcode"
                  className="input-glass pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold mt-2"
            >
              {loggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <><Shield className="w-5 h-5" /> Sign In</>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
