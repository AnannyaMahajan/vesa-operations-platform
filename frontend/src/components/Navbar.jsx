import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Bell, Clock } from 'lucide-react';

export default function Navbar({ title = 'Dashboard', description }) {
  const { user } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotification();
  const [showNotifs, setShowNotifs] = useState(false);

  if (!user) return null;

  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {title}
        </h1>
        {description && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {description}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Notification Bell Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className="btn btn-secondary"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Notifications"
          >
            <Bell size={17} style={{ color: 'var(--text-secondary)' }} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: '0.62rem',
                fontWeight: 800,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '46px',
              width: '340px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 100,
              padding: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    You're all caught up! No unread notifications.
                  </div>
                ) : (
                  notifications.slice(0, 8).map(n => (
                    <div 
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: n.is_read ? 'transparent' : 'var(--accent-bg)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{n.title}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Clock size={10} /> {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.8rem'
          }}>
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {user.full_name}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600 }}>
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
