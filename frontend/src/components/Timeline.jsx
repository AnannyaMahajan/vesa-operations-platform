import React from 'react';
import { Clock, User, CheckCircle2, XCircle, AlertCircle, FilePlus, ArrowRight } from 'lucide-react';

export default function Timeline({ auditLogs = [], approvals = [] }) {
  if (auditLogs.length === 0 && approvals.length === 0) {
    return (
      <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center' }}>
        No activity history recorded yet.
      </div>
    );
  }

  const getActionIcon = (action) => {
    if (action.includes('SUBMITTED')) return <FilePlus size={13} style={{ color: '#2563eb' }} />;
    if (action.includes('APPROVED') || action.includes('COMPLETED')) return <CheckCircle2 size={13} style={{ color: '#059669' }} />;
    if (action.includes('REJECTED')) return <XCircle size={13} style={{ color: '#e11d48' }} />;
    if (action.includes('CHANGES_REQUESTED')) return <AlertCircle size={13} style={{ color: '#ea580c' }} />;
    return <Clock size={13} style={{ color: '#64748b' }} />;
  };

  return (
    <div className="timeline" style={{ paddingLeft: '20px' }}>
      {auditLogs.map((log) => (
        <div key={log.id} className="timeline-item" style={{ marginBottom: '14px' }}>
          <div className="timeline-dot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getActionIcon(log.action)}
          </div>
          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                {log.action.replace('WORKFLOW_', '').replace('_', ' ')}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <User size={11} />
              <span style={{ fontWeight: 600 }}>{log.actor_name || 'System Auto-Engine'}</span>
              {log.actor_role && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>({log.actor_role})</span>}
            </div>

            {log.previous_state && log.new_state && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', marginTop: '4px', color: 'var(--accent)', fontWeight: 600 }}>
                <span>{log.previous_state}</span>
                <ArrowRight size={11} />
                <span>{log.new_state}</span>
              </div>
            )}

            {log.details && log.details.comment && (
              <div style={{ marginTop: '6px', fontSize: '0.78rem', fontStyle: 'italic', backgroundColor: '#ffffff', padding: '6px 8px', borderRadius: '4px', borderLeft: '3px solid var(--accent)' }}>
                "{log.details.comment}"
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
