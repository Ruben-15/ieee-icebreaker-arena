'use client';
// ============================================================
// IEEE Icebreaker Arena — Protect Admin Layout with Sidebar Navigation
// ============================================================
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Users, Monitor, Settings,
  Download, LogOut, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/participants', icon: Users, label: 'Participants' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { adminLogged, logout, loading } = useAuth();

  // Route Guard check
  useEffect(() => {
    if (!loading && !adminLogged) {
      router.replace('/login');
    }
  }, [adminLogged, loading, router]);

  if (loading || !adminLogged) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white">
        <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0a0f1e] text-white">
      {/* Background aurora */}
      <div className="aurora-bg opacity-35">
        <div className="aurora-blob" />
        <div className="aurora-blob" />
      </div>

      {/* Sidebar navigation */}
      <aside className="relative z-10 w-60 min-h-screen flex flex-col glass border-r border-white/5 p-4 bg-black/10">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006EB8] to-[#7c3aed] flex items-center justify-center font-black text-xs">
            IEEE
          </div>
          <div>
            <p className="font-bold text-sm leading-none">Icebreaker</p>
            <p className="text-[10px] text-white/40 mt-1">Admin Console</p>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${pathname === href ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          {/* Projector link (opens separate fullscreen tab) */}
          <Link
            href="/projector"
            target="_blank"
            className="nav-item text-purple-300 hover:text-purple-200"
          >
            <Monitor className="w-4 h-4" />
            Projector Mode
          </Link>
        </nav>

        {/* Footer controls */}
        <div className="space-y-2 border-t border-white/5 pt-4">
          <button onClick={logout} className="nav-item text-red-400 w-full">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Admin Panel Body */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
