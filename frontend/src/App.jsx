import React, { useState, useEffect } from 'react';
import { Compass, Layers, Flame, Users, History, HelpCircle, Bell } from 'lucide-react';
import Navbar from './components/Navbar';
import ProfileModal from './components/ProfileModal';
import HistoryDrawer from './components/HistoryDrawer';
import InstallPrompt from './components/InstallPrompt';
import NotificationModal from './components/NotificationModal';
import OrientalHeroBanner from './components/OrientalHeroBanner';
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
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
    loadHistory();
    const savedTheme = localStorage.getItem('numerology_theme');
    if (savedTheme && ELEMENT_THEMES[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Update dynamic CSS custom properties whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    const themeObj = ELEMENT_THEMES[currentTheme] || ELEMENT_THEMES['Mộc'];
    root.setAttribute('data-theme', currentTheme);
    root.style.setProperty('--corner-color', themeObj.cornerColor);
    root.style.setProperty('--theme-card-border', themeObj.cornerColor + '40');
  }, [currentTheme]);

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
    <div
      style={{ color: activeThemeObj.bgPatternColor }}
      className={`min-h-screen bg-gradient-to-b ${activeThemeObj.bgGradient} bg-cloud-pattern text-slate-800 flex flex-col selection:bg-amber-200 selection:text-amber-900 transition-colors duration-500`}
    >
      {/* Top Navbar */}
      <Navbar
        activeProfile={activeProfile}
        currentTheme={currentTheme}
        theme={activeThemeObj}
        onChangeTheme={handleChangeTheme}
        onOpenProfiles={() => setIsProfileModalOpen(true)}
        onOpenHistory={() => {
          loadHistory();
          setIsHistoryDrawerOpen(true);
        }}
        onOpenInstall={() => setShowInstallGuide(true)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
      />

      {/* PWA Install Banner & Modal */}
      <InstallPrompt forceShowModal={showInstallGuide} onCloseModal={() => setShowInstallGuide(false)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3.5 sm:p-5">
        {/* Oriental Hero Banner (Inspired by 5ptiengtrung.vn) */}
        <OrientalHeroBanner
          activeProfile={activeProfile}
          theme={activeThemeObj}
          currentTheme={currentTheme}
          activeTab={activeTab}
          onSwitchTab={(t) => setActiveTab(t)}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
          onOpenProfiles={() => setIsProfileModalOpen(true)}
        />

        {activeTab === 'qimen' && <QimenTab activeProfile={activeProfile} theme={activeThemeObj} />}
        {activeTab === 'ziwei' && <ZiweiTab activeProfile={activeProfile} theme={activeThemeObj} />}
        {activeTab === 'bazi' && <BaziTab activeProfile={activeProfile} theme={activeThemeObj} />}
      </main>

      {/* Mobile-first Bottom Navigation Bar phong cách Đông Phương Cổ Kính (like 5ptiengtrung.vn) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-amber-900/20 shadow-[0_-4px_25px_rgba(40,25,15,0.12)] px-2.5 py-1.5">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 sm:gap-2">
          {/* Tab 1: Sơn Môn (Kỳ Môn) */}
          <button
            onClick={() => setActiveTab('qimen')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
              activeTab === 'qimen'
                ? 'bg-gradient-to-b from-amber-600 to-amber-700 text-white font-bold shadow-md'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
            }`}
          >
            <Compass className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] tracking-tight">Sơn Môn</span>
          </button>

          {/* Tab 2: Bảo Tháp (Tử Vi) */}
          <button
            onClick={() => setActiveTab('ziwei')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
              activeTab === 'ziwei'
                ? 'bg-gradient-to-b from-indigo-700 to-indigo-800 text-white font-bold shadow-md'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] tracking-tight">Bảo Tháp</span>
          </button>

          {/* Tab 3: Chân Mệnh (Bát Tự) */}
          <button
            onClick={() => setActiveTab('bazi')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
              activeTab === 'bazi'
                ? 'bg-gradient-to-b from-emerald-700 to-emerald-800 text-white font-bold shadow-md'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
            }`}
          >
            <Flame className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] tracking-tight">Chân Mệnh</span>
          </button>

          {/* Tab 4: Điểm Chuông 8h */}
          <button
            onClick={() => setIsNotificationModalOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100/60 transition"
          >
            <Bell className="w-4 h-4 mb-0.5 text-amber-700" />
            <span className="text-[10px] tracking-tight">Chuông 8h</span>
          </button>
        </div>
      </nav>

      {/* 8:00 AM Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        activeProfile={activeProfile}
        theme={activeThemeObj}
      />

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
