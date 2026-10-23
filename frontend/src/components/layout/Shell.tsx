import React, { useState } from 'react';
import { Sidebar, type NavigationTab } from './Sidebar';
import { Navbar } from './Navbar';
import { X } from 'lucide-react';

interface ShellProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onStartQuickStudy: () => void;
  onOpenAddTopic: () => void;
  unreadScreenshotsCount?: number;
  pendingTopicsCount?: number;
  dueSoonCount?: number;
  streakDays?: number;
  remainingMinutes?: number;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({
  activeTab,
  onSelectTab,
  onStartQuickStudy,
  onOpenAddTopic,
  unreadScreenshotsCount = 0,
  pendingTopicsCount = 0,
  dueSoonCount = 0,
  streakDays = 0,
  remainingMinutes = 0,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: NavigationTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <div className="desktop-sidebar-container">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          unreadScreenshotsCount={unreadScreenshotsCount}
          pendingTopicsCount={pendingTopicsCount}
          dueSoonCount={dueSoonCount}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="modal-overlay"
          onClick={() => setMobileMenuOpen(false)}
          style={{ zIndex: 120, justifyContent: 'flex-start' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '280px',
              height: '100%',
              background: 'rgba(8, 11, 24, 0.95)',
              backdropFilter: 'blur(30px)',
              borderRight: '1px solid var(--glass-border-hover)',
              padding: '1.5rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              animation: 'scaleUp 0.2s var(--ease-smooth)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-ghost btn-sm"
              >
                <X size={18} />
              </button>
            </div>
            <Sidebar
              activeTab={activeTab}
              onSelectTab={handleTabChange}
              unreadScreenshotsCount={unreadScreenshotsCount}
              pendingTopicsCount={pendingTopicsCount}
              dueSoonCount={dueSoonCount}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          activeTab={activeTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onStartQuickStudy={onStartQuickStudy}
          onOpenAddTopic={onOpenAddTopic}
          streakDays={streakDays}
          remainingMinutes={remainingMinutes}
        />

        <main className="page-wrapper">{children}</main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar-container { display: none; }
        }
      `}</style>
    </div>
  );
};
