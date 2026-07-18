'use client';
// ============================================================
// AuthContext — Local Session Auth for Participants & Admin Credentials
// ============================================================
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Participant } from '@/types';
import { getParticipant, createParticipant } from '@/firebase/firestore';
import { mockDb, registerMockListener } from '@/firebase/mockDb';
import { isMock } from '@/firebase/config';

interface AuthContextType {
  participant: Participant | null;
  adminLogged: boolean;
  loading: boolean;
  loginParticipant: (name: string, department: string) => Promise<void>;
  loginAdmin: (username: string, departmentCode: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  participant: null,
  adminLogged: false,
  loading: true,
  loginParticipant: async () => {},
  loginAdmin: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [adminLogged, setAdminLogged] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize session from LocalStorage
  useEffect(() => {
    async function initSession() {
      // Check admin
      const isAdmin = localStorage.getItem('ieee_ice_admin_logged') === 'true';
      setAdminLogged(isAdmin);

      // Check participant
      const pId = localStorage.getItem('ieee_ice_participant_id');
      if (pId) {
        try {
          const p = await getParticipant(pId);
          if (p) setParticipant(p);
          else localStorage.removeItem('ieee_ice_participant_id');
        } catch {
          localStorage.removeItem('ieee_ice_participant_id');
        }
      }
      setLoading(false);
    }
    initSession();

    if (isMock) {
      const unsubSession = registerMockListener('session', async (uid: string | null) => {
        if (uid) {
          const p = await getParticipant(uid);
          setParticipant(p);
        } else {
          setParticipant(null);
        }
      });
      const unsubAdmin = registerMockListener('adminSession', (logged: boolean) => {
        setAdminLogged(logged);
      });
      return () => {
        unsubSession();
        unsubAdmin();
      };
    }
  }, []);

  async function loginParticipant(name: string, department: string) {
    setLoading(true);
    try {
      const p = await createParticipant(name, department);
      setParticipant(p);
      localStorage.setItem('ieee_ice_participant_id', p.uid);
      if (isMock) {
        mockDb.setParticipantSession(p.uid);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loginAdmin(username: string, departmentCode: string): Promise<boolean> {
    const adminUser = process.env.NEXT_PUBLIC_ADMIN_USER || 'admin123';
    const adminCode = process.env.NEXT_PUBLIC_ADMIN_CODE || 'admin@7382';

    if (username === adminUser && departmentCode === adminCode) {
      setAdminLogged(true);
      localStorage.setItem('ieee_ice_admin_logged', 'true');
      if (isMock) {
        mockDb.setAdminSession(true);
      }
      return true;
    }
    return false;
  }

  function logout() {
    setParticipant(null);
    setAdminLogged(false);
    localStorage.removeItem('ieee_ice_participant_id');
    localStorage.removeItem('ieee_ice_admin_logged');
    if (isMock) {
      mockDb.setParticipantSession(null);
      mockDb.setAdminSession(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        participant,
        adminLogged,
        loading,
        loginParticipant,
        loginAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
