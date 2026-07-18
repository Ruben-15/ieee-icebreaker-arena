'use client';
// ============================================================
// IEEE Icebreaker Arena — Admin Layout (Mobile Responsive)
// ============================================================
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Users, Monitor, Settings,
  LogOut
} from 'lucide-react';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/admin',               icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/participants',  icon: Users,            label: 'Participants' },
  { href: '/admin/settings',      icon: Settings,         label: 'Settings' },
  { href: '/projector',           icon: Monitor,          label: 'Projector',  external: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { adminLogged, logout, loading } = useAuth();

  useEffect(() => {
    if (!loading && !adminLogged) router.replace('/login');
  }, [adminLogged, loading, router]);

  if (loading || !adminLogged) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white">
        <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col md:flex-row">

      {/* Background aurora */}
      <div className="aurora-bg opacity-35">
        <div className="aurora-blob" />
        <div className="aurora-blob" />
      </div>

      {/* ── MOBILE TOP HEADER (hidden on md+) ── */}
      <header className="relative z-20 flex md:hidden items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#006EB8] to-[#7c3aed] flex items-center justify-center font-black text-[10px]">
            IEEE
          </div>
          <div>
            <p className="font-bold text-sm leading-none">Icebreaker</p>
            <p className="text-[9px] text-white/40">Admin Console</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </header>

      {/* ── DESKTOP SIDEBAR (hidden on mobile) ── */}
      <aside className="relative z-10 hidden md:flex w-60 min-h-screen flex-col glass border-r border-white/5 p-4 bg-black/10">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006EB8] to-[#7c3aed] flex items-center justify-center font-black text-xs">
            IEEE
          </div>
          <div>
            <p className="font-bold text-sm leading-none">Icebreaker</p>
            <p className="text-[10px] text-white/40 mt-1">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label, external }) => (
            <Link
              key={href}
              href={href}
              target={external ? '_blank' : undefined}
              className={`nav-item ${!external && pathname === href ? 'active' : ''} ${external ? 'text-purple-300 hover:text-purple-200' : ''}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="space-y-2 border-t border-white/5 pt-4">
          <button onClick={logout} className="nav-item text-red-400 w-full">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* ── MOBILE BOTTOM NAV (hidden on md+) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden flex items-center bg-black/60 backdrop-blur-xl border-t border-white/8 px-2 py-1 safe-area-bottom">
        {NAV_ITEMS.map(({ href, icon: Icon, label, external }) => {
          const isActive = !external && pathname === href;
          return (
            <Link
              key={href}
              href={href}
              target={external ? '_blank' : undefined}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-purple-400'
                  : external
                  ? 'text-purple-300/70'
                  : 'text-white/40'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-purple-500/20' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
