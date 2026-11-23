import React, { useState, useEffect } from 'react';
import { Compass, Layers, Flame, Users, History, HelpCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import ProfileModal from './components/ProfileModal';
import HistoryDrawer from './components/HistoryDrawer';
import InstallPrompt from './components/InstallPrompt';
import QimenTab from './components/QimenTab';
import ZiweiTab from './components/ZiweiTab';
import BaziTab from './components/BaziTab';
import { ELEMENT_THEMES } from './utils/theme';
import {
  fetchProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  fetchHistory,
  deleteHistory,
} from './utils/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('bazi'); // Mặc định mở Bát Tự theo ngữ cảnh người dùng
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentTheme, setCurrentTheme] = useState('Mộc'); // Default Mộc matching Giáp Mộc của user

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
    loadHistory();
    const savedTheme = localStorage.getItem('numerology_theme');
    if (savedTheme && ELEMENT_THEMES[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const handleChangeTheme = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('numerology_theme', themeId);
  };

  const loadProfiles = async () => {
    try {
      const list = await fetchProfiles();
      setProfiles(list);
      if (list.length > 0) {
        const savedId = localStorage.getItem('numerology_active_profile_id');
        const found = list.find((p) => p.id === savedId) || list[0];
        setActiveProfile(found);
      } else {
        const defaultProfile = await createProfile({
          name: 'Tôi (Mặc định)',
          gender: '男',
          calendar_type: 'solar',
          birth_time: '1995-10-10 14:30',
          is_leap_month: false,
          city: 'Ho Chi Minh City',
          timezone: 'Asia/Ho_Chi_Minh',
          late_zi_rule: 'same_day',
          leap_month_rule: 'split_15',
          notes: 'Hồ sơ cá nhân ban đầu',
        });
        setProfiles([defaultProfile]);
        setActiveProfile(defaultProfile);
      }
    } catch (err) {
      console.error('Failed to load profiles:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const list = await fetchHistory();
      setHistory(list);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleSelectProfile = (p) => {
    setActiveProfile(p);
    localStorage.setItem('numerology_active_profile_id', p.id);
  };

  const handleSaveProfile = async (formData, editingId) => {
    try {
      if (editingId) {
        const updated = await updateProfile(editingId, formData);
        setProfiles((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        if (activeProfile?.id === editingId) setActiveProfile(updated);
      } else {
        const created = await createProfile(formData);
        setProfiles((prev) => [created, ...prev]);
        setActiveProfile(created);
        localStorage.setItem('numerology_active_profile_id', created.id);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProfile = async (id) => {
    try {
      await deleteProfile(id);
      const remaining = profiles.filter((p) => p.id !== id);
      setProfiles(remaining);
      if (activeProfile?.id === id) {
        setActiveProfile(remaining[0] || null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await deleteHistory(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSelectHistoryItem = (item) => {
    if (item.system === 'qimen') setActiveTab('qimen');
    else if (item.system === 'ziwei') setActiveTab('ziwei');
    else if (item.system === 'bazi') setActiveTab('bazi');
  };

  const activeThemeObj = ELEMENT_THEMES[currentTheme] || ELEMENT_THEMES['Mộc'];

  return (
    <div className={`min-h-screen bg-gradient-to-b ${activeThemeObj.bgGradient} bg-cloud-pattern text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200 transition-colors duration-500`}>
      {/* Top Navbar */}
      <Navbar
        activeProfile={activeProfile}
        currentTheme={currentTheme}
        onChangeTheme={handleChangeTheme}
        onOpenProfiles={() => setIsProfileModalOpen(true)}
        onOpenHistory={() => {
          loadHistory();
          setIsHistoryDrawerOpen(true);
        }}
        onOpenInstall={() => setShowInstallGuide(true)}
      />

      {/* PWA Install Banner & Modal */}
      <InstallPrompt forceShowModal={showInstallGuide} onCloseModal={() => setShowInstallGuide(false)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-5">
        {activeTab === 'qimen' && <QimenTab activeProfile={activeProfile} />}
        {activeTab === 'ziwei' && <ZiweiTab activeProfile={activeProfile} />}
        {activeTab === 'bazi' && <BaziTab activeProfile={activeProfile} />}
      </main>

      {/* Mobile-first Bottom Navigation Bar phong cách Đông Phương */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-amber-500/20 px-2 py-1.5">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-1">
          {/* Tab 1: Qimen */}
          <button
            onClick={() => setActiveTab('qimen')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition ${
              activeTab === 'qimen'
                ? 'text-emerald-400 bg-emerald-950/40 font-bold border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className={`w-5 h-5 mb-0.5 ${activeTab === 'qimen' ? 'text-emerald-400' : ''}`} />
            <span className="text-[11px] tracking-tight">Kỳ Môn Hôm Nay</span>
          </button>

          {/* Tab 2: Ziwei */}
          <button
            onClick={() => setActiveTab('ziwei')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition ${
              activeTab === 'ziwei'
                ? 'text-purple-400 bg-purple-950/40 font-bold border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className={`w-5 h-5 mb-0.5 ${activeTab === 'ziwei' ? 'text-purple-400' : ''}`} />
            <span className="text-[11px] tracking-tight">Tử Vi Đẩu Số</span>
          </button>

          {/* Tab 3: Bazi */}
          <button
            onClick={() => setActiveTab('bazi')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition ${
              activeTab === 'bazi'
                ? 'text-amber-400 bg-amber-950/40 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className={`w-5 h-5 mb-0.5 ${activeTab === 'bazi' ? 'text-amber-400' : ''}`} />
            <span className="text-[11px] tracking-tight">Bát Tự (Tứ Trụ)</span>
          </button>
        </div>
      </nav>

      {/* Profile Management Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profiles={profiles}
        activeProfile={activeProfile}
        onSelectProfile={handleSelectProfile}
        onSaveProfile={handleSaveProfile}
        onDeleteProfile={handleDeleteProfile}
      />

      {/* Reading History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={history}
        onSelectHistory={handleSelectHistoryItem}
        onDeleteHistory={handleDeleteHistory}
      />
    </div>
  );
}
