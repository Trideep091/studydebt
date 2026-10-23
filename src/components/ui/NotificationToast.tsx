import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        zIndex: 9999,
        maxWidth: '380px',
        width: 'calc(100% - 3rem)',
      }}
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        const borderColor = isSuccess
          ? 'rgba(134, 239, 172, 0.4)'
          : isError
          ? 'rgba(248, 113, 113, 0.4)'
          : 'rgba(167, 139, 250, 0.4)';

        const glowColor = isSuccess
          ? 'var(--accent-mint-glow)'
          : isError
          ? 'rgba(248, 113, 113, 0.2)'
          : 'var(--accent-lavender-glow)';

        const Icon = isSuccess ? CheckCircle2 : isError ? AlertCircle : Info;
        const iconColor = isSuccess ? '#86EFAC' : isError ? '#F87171' : '#A78BFA';

        return (
          <div
            key={toast.id}
            style={{
              background: 'rgba(14, 21, 40, 0.95)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${borderColor}`,
              boxShadow: `0 12px 30px -8px rgba(0, 0, 0, 0.7), 0 0 20px -5px ${glowColor}`,
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 1.1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
              animation: 'scaleUp 0.2s var(--ease-smooth)',
            }}
          >
            <Icon size={20} color={iconColor} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {toast.title && (
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.15rem' }}>
                  {toast.title}
                </div>
              )}
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
