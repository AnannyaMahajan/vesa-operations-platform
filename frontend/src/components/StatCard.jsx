import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const colorMap = {
    primary: { bg: '#eff6ff', color: '#2563eb' },
    blue: { bg: '#eff6ff', color: '#2563eb' },
    amber: { bg: '#fffbeb', color: '#d97706' },
    emerald: { bg: '#ecfdf5', color: '#059669' },
    rose: { bg: '#fff1f2', color: '#e11d48' },
    purple: { bg: '#f3e8ff', color: '#7e22ce' }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px' }}>
      {Icon && (
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '8px',
          backgroundColor: scheme.bg,
          color: scheme.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Icon size={20} />
        </div>
      )}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginTop: '1px' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
