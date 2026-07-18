'use client';
// ============================================================
// IEEE Icebreaker Arena — Admin Settings & Exports Page
// ============================================================
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSettings, updateSettings, getAllParticipants, getParticipantEntries } from '@/firebase/firestore';
import { AppSettings, Participant } from '@/types';
import { Settings, Check, Download, Loader2, Save, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    activityRunning: false,
    activityStatus: 'idle',
    timer: 600,
    timerRemaining: 600,
    eventName: 'IEEE Orientation 2026',
    projectorEnabled: true,
    themeColor: '#7c3aed',
    logoURL: '',
    projectorBackground: 'aurora',
    maxParticipants: 100,
  });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function load() {
      const s = await getSettings();
      if (s) setSettings(s);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await updateSettings(settings);
      toast.success('Settings updated!');
    } catch {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  }

  // Export CSV of participants rankings
  async function exportCSV() {
    setExporting(true);
    try {
      const list = await getAllParticipants();
      const sorted = [...list].sort((a, b) => b.meetingCount - a.meetingCount);
      let csvContent = 'Rank,Name,Department,Connections logged,Joined At\n';
      sorted.forEach((p, idx) => {
        csvContent += `${idx + 1},"${p.name}","${p.department}",${p.meetingCount},"${new Date(p.joinedAt).toLocaleString()}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'IEEE_Icebreaker_Participants.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV Exported!');
    } catch {
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  }

  // Export Excel of all connection entries
  async function exportExcel() {
    setExporting(true);
    try {
      const list = await getAllParticipants();
      const entriesMap = await Promise.all(list.map(p => getParticipantEntries(p.uid)));
      const allEntries: any[] = [];
      list.forEach((p, i) => {
        const pEntries = entriesMap[i];
        pEntries.forEach(e => {
          allEntries.push({
            'Participant Name': p.name,
            'Participant Department': p.department,
            'Person Met': e.personName,
            'Person Department': e.personDepartment,
            'Place Met': e.place,
            'Favourite Colour': e.favoriteColor || '—',
            'Hobby': e.hobby || '—',
            'Logged At': new Date(e.createdAt).toLocaleString(),
          });
        });
      });

      const { utils, writeFile } = await import('xlsx');
      const ws = utils.json_to_sheet(allEntries);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Connections Logged');
      writeFile(wb, 'IEEE_Icebreaker_Connections.xlsx');
      toast.success('Excel Exported! 📊');
    } catch {
      toast.error('Failed to export Excel');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1 flex items-center gap-2">
          <Settings className="w-8 h-8 text-purple-400" /> Settings & Export
        </h1>
        <p className="text-white/40">Event branding, default timers, and report generation</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Settings Card */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="font-bold text-lg mb-5">Event Customization</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wider">Event Name</label>
              <input
                type="text"
                value={settings.eventName || ''}
                onChange={e => setSettings(s => ({ ...s, eventName: e.target.value }))}
                className="input-glass"
              />
            </div>
            
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wider">Default Timer (Minutes)</label>
              <input
                type="number"
                value={settings.timer ? settings.timer / 60 : 10}
                onChange={e => {
                  const val = Number(e.target.value) * 60;
                  setSettings(s => ({ ...s, timer: val, timerRemaining: val }));
                }}
                className="input-glass"
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wider">Theme Accent Color</label>
              <select
                value={settings.themeColor || '#7c3aed'}
                onChange={e => setSettings(s => ({ ...s, themeColor: e.target.value }))}
                className="input-glass"
              >
                <option value="#7c3aed">Purple Accent</option>
                <option value="#006EB8">IEEE Blue Accent</option>
                <option value="#10b981">Green Accent</option>
                <option value="#f59e0b">Amber Accent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wider">Projector Background style</label>
              <select
                value={settings.projectorBackground || 'aurora'}
                onChange={e => setSettings(s => ({ ...s, projectorBackground: e.target.value }))}
                className="input-glass"
              >
                <option value="aurora">Aurora Gradient</option>
                <option value="stars">Dark Minimal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wider">Max Participants</label>
              <input
                type="number"
                value={settings.maxParticipants || 100}
                onChange={e => setSettings(s => ({ ...s, maxParticipants: Number(e.target.value) }))}
                className="input-glass"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary mt-6 flex items-center gap-2 px-6 py-3 rounded-xl"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Settings
          </button>
        </motion.div>

        {/* Exports Card */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-bold text-lg mb-2">Data Reports</h2>
          <p className="text-xs text-white/40 mb-6">Generate excel or csv sheets containing participants, ranks, and logged meets.</p>
          
          <div className="flex gap-4">
            <button
              onClick={exportCSV}
              disabled={exporting}
              className="btn-glass flex-1 py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm"
            >
              <Download className="w-4 h-4 text-blue-400" /> Export Participants Ranks (CSV)
            </button>
            <button
              onClick={exportExcel}
              disabled={exporting}
              className="btn-glass flex-1 py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-400" /> Export Connection Logs (Excel)
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
