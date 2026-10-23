import React from 'react';
import {
  LayoutDashboard,
  Image as ImageIcon,
  CheckSquare,
  CalendarDays,
  Repeat,
  TrendingUp,
  Settings,
  Sparkles,
} from 'lucide-react';
import { StudyDebtLogo } from '../brand/StudyDebtLogo';

export type NavigationTab =
  | 'dashboard'
  | 'screenshots'
  | 'backlog'
  | 'planner'
  | 'revision'
  | 'progress'
  | 'settings';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  unreadScreenshotsCount?: number;
  pendingTopicsCount?: number;
  dueSoonCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  unreadScreenshotsCount = 0,
  pendingTopicsCount = 0,
  dueSoonCount = 0,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'screenshots' as NavigationTab,
      label: 'My Screenshots',
      icon: ImageIcon,
      badge: unreadScreenshotsCount > 0 ? unreadScreenshotsCount : null,
      badgeColor: 'cyan',
    },
    {
      id: 'backlog' as NavigationTab,
      label: 'Backlog',
      icon: CheckSquare,
      badge: pendingTopicsCount > 0 ? pendingTopicsCount : null,
      badgeColor: 'amber',
    },
    {
      id: 'planner' as NavigationTab,
      label: 'Weekly Planner',
      icon: CalendarDays,
      badge: null,
    },
    {
      id: 'revision' as NavigationTab,
      label: 'Revision',
      icon: Repeat,
      badge: dueSoonCount > 0 ? dueSoonCount : null,
      badgeColor: 'lavender',
    },
    {
      id: 'progress' as NavigationTab,
      label: 'Progress',
      icon: TrendingUp,
      badge: null,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      className="studydebt-sidebar"
      style={{
        width: '260px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(8, 11, 24, 0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid var(--glass-border)',
        padding: '1.5rem 1rem',
        zIndex: 50,
      }}
    >
      <div style={{ padding: '0 0.5rem 1.75rem 0.5rem' }}>
        <StudyDebtLogo size="md" showTagline />
      </div>

      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          flex: 1,
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className="sidebar-nav-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: isActive
                  ? '1px solid rgba(167, 139, 250, 0.35)'
                  : '1px solid transparent',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(167, 139, 250, 0.16) 0%, rgba(103, 232, 249, 0.08) 100%)'
                  : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
                boxShadow: isActive ? '0 4px 16px rgba(167, 139, 250, 0.15)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <Icon
                  size={19}
                  color={isActive ? 'var(--accent-lavender)' : 'var(--text-muted)'}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== null && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background:
                      item.badgeColor === 'cyan'
                        ? 'rgba(103, 232, 249, 0.18)'
                        : item.badgeColor === 'amber'
                        ? 'rgba(251, 191, 36, 0.18)'
                        : 'rgba(167, 139, 250, 0.18)',
                    color:
                      item.badgeColor === 'cyan'
                        ? '#67E8F9'
                        : item.badgeColor === 'amber'
                        ? '#FDE68A'
                        : '#DDD6FE',
                    border: `1px solid ${
                      item.badgeColor === 'cyan'
                        ? 'rgba(103, 232, 249, 0.3)'
                        : item.badgeColor === 'amber'
                        ? 'rgba(251, 191, 36, 0.3)'
                        : 'rgba(167, 139, 250, 0.3)'
                    }`,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Subtle Philosophy Callout Card */}
      <div
        style={{
          marginTop: 'auto',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 23, 42, 0.5)',
          border: '1px solid var(--glass-border-subtle)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)' }}>
          <Sparkles size={14} />
          <span style={{ fontWeight: 600 }}>Mindful Study</span>
        </div>
        <div>Small sessions. Steady progress. Less academic chaos.</div>
      </div>
    </aside>
  );
};
