import React from 'react';
import {
  Menu,
  Flame,
  Clock,
  Play,
  Plus,
  Sparkles,
} from 'lucide-react';
import { StudyDebtLogo } from '../brand/StudyDebtLogo';
import { Button } from '../ui/Button';
import type { NavigationTab } from './Sidebar';

interface NavbarProps {
  activeTab: NavigationTab;
  onOpenMobileMenu?: () => void;
  onStartQuickStudy: () => void;
  onOpenAddTopic: () => void;
  streakDays?: number;
  remainingMinutes?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onOpenMobileMenu,
  onStartQuickStudy,
  onOpenAddTopic,
  streakDays = 0,
  remainingMinutes = 0,
}) => {
  const getTabTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard';
      case 'screenshots':
        return 'My Screenshots';
      case 'backlog':
        return 'Backlog Manager';
      case 'planner':
        return 'Weekly Planner';
      case 'revision':
        return 'Revision Queue';
      case 'progress':
        return 'Backlog Progress';
      case 'settings':
        return 'Settings & Privacy';
      default:
        return 'StudyDebt';
    }
  };

  const remainingHours = (remainingMinutes / 60).toFixed(1);

  return (
    <header
      style={{
        height: '70px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(8, 11, 24, 0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Mobile menu button */}
        <button
          onClick={onOpenMobileMenu}
          className="btn btn-ghost btn-sm mobile-menu-toggle"
          aria-label="Toggle navigation menu"
          style={{ display: 'none', padding: '0.4rem' }}
        >
          <Menu size={20} />
        </button>

        {/* Brand logo visible on mobile */}
        <div className="mobile-brand" style={{ display: 'none' }}>
          <StudyDebtLogo size="sm" />
        </div>

        {/* Route title on desktop */}
        <div className="desktop-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            {getTabTitle(activeTab)}
          </h2>
        </div>
      </div>

      {/* Right controls: stats pills + action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Streak Pill */}
        <div
          title="Consecutive study streak"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#FDE68A',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        >
          <Flame size={15} color="#FBBF24" />
          <span>{streakDays}d Streak</span>
        </div>

        {/* Backlog Debt Pill */}
        <div
          title="Estimated remaining study time in your backlog"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(103, 232, 249, 0.1)',
            border: '1px solid rgba(103, 232, 249, 0.25)',
            color: '#A5F3FC',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        >
          <Clock size={15} color="#67E8F9" />
          <span>{remainingHours}h Backlog</span>
        </div>

        {/* Add Topic quick button */}
        <Button
          variant="glass"
          size="sm"
          onClick={onOpenAddTopic}
          icon={<Plus size={15} />}
        >
          Add Topic
        </Button>

        {/* Start a Quick Study Primary CTA */}
        <Button
          variant="primary"
          size="sm"
          onClick={onStartQuickStudy}
          icon={<Play size={14} fill="#080B18" />}
        >
          Quick Study
        </Button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-toggle { display: inline-flex !important; }
          .mobile-brand { display: block !important; }
          .desktop-title { display: none !important; }
        }
      `}</style>
    </header>
  );
};
