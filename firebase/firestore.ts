// ============================================================
// Firestore Helper Functions tailored for Orientation Specs
// ============================================================
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db, isMock } from './config';
import { Participant, Entry, AppSettings } from '@/types';
import { mockDb, registerMockListener } from './mockDb';

function createConverter<T extends DocumentData>(): FirestoreDataConverter<T> {
  return {
    toFirestore: (data: T) => data,
    fromFirestore: (snap: QueryDocumentSnapshot): T => {
      const data = snap.data();
      return { ...data, id: snap.id } as unknown as T;
    },
  };
}

// Public refs
export const participantsCol = isMock ? null as any : collection(db, 'participants').withConverter(createConverter<Participant>());
export const entriesCol = isMock ? null as any : collection(db, 'entries').withConverter(createConverter<Entry>());

// -------------------------------------------------------------------
// Settings / Global Config Controls
// -------------------------------------------------------------------
export async function getSettings(): Promise<AppSettings | null> {
  if (isMock) return mockDb.getSettings();
  const snap = await getDoc(doc(db, 'settings', 'global'));
  return snap.exists() ? (snap.data() as AppSettings) : null;
}

export async function updateSettings(data: Partial<AppSettings>): Promise<void> {
  if (isMock) {
    mockDb.setSettings({ ...mockDb.getSettings(), ...data });
    return;
  }
  await setDoc(doc(db, 'settings', 'global'), data, { merge: true });
}

export function subscribeSettings(callback: (settings: AppSettings | null) => void) {
  if (isMock) {
    setTimeout(() => callback(mockDb.getSettings()), 50);
    return registerMockListener('settings', callback);
  }
  return onSnapshot(doc(db, 'settings', 'global'), (snap: any) => {
    callback(snap.exists() ? (snap.data() as AppSettings) : null);
  });
}

// -------------------------------------------------------------------
// Participant CRUD operations
// -------------------------------------------------------------------
// Helper to wrap promises with a timeout to prevent hanging UI
function withTimeout<T>(
  promise: Promise<T>, 
  ms = 6000, 
  errorMsg = 'Connection timed out. Please check if you created a "Firestore Database" in your Firebase console and enabled reads/writes in test mode.'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
  ]);
}

export async function createParticipant(name: string, department: string): Promise<Participant> {
  const cleanName = name.trim();

  if (isMock) {
    const list = mockDb.getParticipants();
    const existing = list.find(p => p.name.trim().toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      existing.department = department;
      mockDb.setParticipants(list);
      return existing;
    }

    const uid = `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const participant: Participant = {
      uid,
      name: cleanName,
      department,
      joinedAt: Date.now(),
      meetingCount: 0,
    };
    list.push(participant);
    mockDb.setParticipants(list);
    return participant;
  }

  // Check if a participant with this name already exists in Firestore
  const q = query(participantsCol, where('name', '==', cleanName));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const docData = snap.docs[0].data() as Participant;
    // Update their department choice if it changed
    await updateDoc(doc(db, 'participants', docData.uid), { department });
    return { ...docData, department };
  }

  // Create a new participant if none exists
  const uid = `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const participant: Participant = {
    uid,
    name: cleanName,
    department,
    joinedAt: Date.now(),
    meetingCount: 0,
  };

  await withTimeout(setDoc(doc(db, 'participants', uid), participant));
  return participant;
}

export async function getParticipant(uid: string): Promise<Participant | null> {
  if (isMock) {
    return mockDb.getParticipants().find(p => p.uid === uid) ?? null;
  }
  const snap = await getDoc(doc(db, 'participants', uid));
  return snap.exists() ? snap.data() as Participant : null;
}

export async function updateParticipant(uid: string, data: Partial<Participant>): Promise<void> {
  if (isMock) {
    const list = mockDb.getParticipants();
    const idx = list.findIndex(p => p.uid === uid);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      mockDb.setParticipants(list);
    }
    return;
  }
  await updateDoc(doc(db, 'participants', uid), data as DocumentData);
}

export async function getAllParticipants(): Promise<Participant[]> {
  if (isMock) return mockDb.getParticipants();
  const snap = await getDocs(participantsCol);
  return snap.docs.map(d => d.data()) as Participant[];
}

export function subscribeParticipants(callback: (list: Participant[]) => void) {
  if (isMock) {
    setTimeout(() => callback(mockDb.getParticipants()), 50);
    return registerMockListener('participants', callback);
  }
  return onSnapshot(participantsCol, (snap: any) => {
    callback(snap.docs.map((d: any) => d.data()) as Participant[]);
  });
}

export async function deleteParticipant(uid: string): Promise<void> {
  if (isMock) {
    mockDb.setParticipants(mockDb.getParticipants().filter(p => p.uid !== uid));
    mockDb.setEntries(mockDb.getEntries().filter(e => e.participantId !== uid));
    return;
  }
  await deleteDoc(doc(db, 'participants', uid));
  // remove entries
  const snap = await getDocs(query(entriesCol, where('participantId', '==', uid)));
  for (const doc of snap.docs) {
    await deleteDoc(doc.ref);
  }
}

export async function resetParticipantCount(uid: string): Promise<void> {
  if (isMock) {
    const list = mockDb.getParticipants();
    const found = list.find(p => p.uid === uid);
    if (found) found.meetingCount = 0;
    mockDb.setParticipants(list);
    mockDb.setEntries(mockDb.getEntries().filter(e => e.participantId !== uid));
    return;
  }
  await updateDoc(doc(db, 'participants', uid), { meetingCount: 0 });
  const snap = await getDocs(query(entriesCol, where('participantId', '==', uid)));
  for (const doc of snap.docs) {
    await deleteDoc(doc.ref);
  }
}

// -------------------------------------------------------------------
// Entries CRUD operations
// -------------------------------------------------------------------
export async function createEntry(data: Omit<Entry, 'id' | 'createdAt'>): Promise<void> {
  const settings = await getSettings();
  if (settings && settings.activityStatus !== 'active') {
    throw new Error('Activity is not active. Submissions are frozen.');
  }

  const createdAt = Date.now();
  const id = `e_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const entry: Entry = {
    ...data,
    id,
    createdAt,
  };

  if (isMock) {
    // Add entry
    const entries = mockDb.getEntries();
    entries.push(entry);
    mockDb.setEntries(entries);

    // Update meeting count
    const parts = mockDb.getParticipants();
    const p = parts.find(x => x.uid === data.participantId);
    if (p) p.meetingCount = (p.meetingCount ?? 0) + 1;
    mockDb.setParticipants(parts);
    return;
  }

  await setDoc(doc(db, 'entries', id), entry);
  // increment participant count
  const partSnap = await getDoc(doc(db, 'participants', data.participantId));
  if (partSnap.exists()) {
    const count = (partSnap.data() as Participant).meetingCount ?? 0;
    await updateDoc(doc(db, 'participants', data.participantId), { meetingCount: count + 1 });
  }
}

export async function updateEntry(id: string, data: Partial<Entry>): Promise<void> {
  if (isMock) {
    const entries = mockDb.getEntries();
    const idx = entries.findIndex(e => e.id === id);
    if (idx !== -1) {
      entries[idx] = { ...entries[idx], ...data };
      mockDb.setEntries(entries);
    }
    return;
  }
  await updateDoc(doc(db, 'entries', id), data as DocumentData);
}

export async function getParticipantEntries(participantId: string): Promise<Entry[]> {
  if (isMock) {
    return mockDb.getEntries().filter(e => e.participantId === participantId).sort((a, b) => b.createdAt - a.createdAt);
  }
  const q = query(entriesCol, where('participantId', '==', participantId));
  const snap = await getDocs(q);
  return (snap.docs.map(d => d.data()) as Entry[]).sort((a, b) => b.createdAt - a.createdAt);
}

export function subscribeEntries(callback: (list: Entry[]) => void) {
  if (isMock) {
    setTimeout(() => callback(mockDb.getEntries()), 50);
    return registerMockListener('entries', callback);
  }
  return onSnapshot(entriesCol, (snap: any) => {
    callback(snap.docs.map((d: any) => d.data()) as Entry[]);
  });
}

// -------------------------------------------------------------------
// Reset / Delete All Global controls
// -------------------------------------------------------------------
export async function resetAllActivityData(): Promise<void> {
  if (isMock) {
    const parts = mockDb.getParticipants();
    parts.forEach(p => p.meetingCount = 0);
    mockDb.setParticipants(parts);
    mockDb.setEntries([]);
    return;
  }
  // Clear entries
  const entriesSnap = await getDocs(entriesCol);
  for (const doc of entriesSnap.docs) {
    await deleteDoc(doc.ref);
  }
  // Reset meetingCounts
  const partsSnap = await getDocs(participantsCol);
  for (const doc of partsSnap.docs) {
    await updateDoc(doc.ref, { meetingCount: 0 });
  }
}

export async function deleteAllActivityData(): Promise<void> {
  if (isMock) {
    mockDb.setParticipants([]);
    mockDb.setEntries([]);
    return;
  }
  // Clear entries
  const entriesSnap = await getDocs(entriesCol);
  for (const doc of entriesSnap.docs) {
    await deleteDoc(doc.ref);
  }
  // Clear participants
  const partsSnap = await getDocs(participantsCol);
  for (const doc of partsSnap.docs) {
    await deleteDoc(doc.ref);
  }
}
