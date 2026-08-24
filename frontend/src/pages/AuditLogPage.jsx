import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { ShieldAlert, Search } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs({ search });
      setLogs(res.auditLogs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Immutable Organization Audit Log Trail" />

        <div className="container-body">
          <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search audit trail by actor, action type, or request ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} className="text-primary" />
              <span>Security & Operational Audit History ({logs.length} Log Entries)</span>
            </h3>

            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>Loading audit logs...</div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Actor</th>
                      <th>Action</th>
                      <th>Request ID</th>
                      <th>State Transition</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(l => (
                      <tr key={l.id}>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {new Date(l.timestamp).toLocaleString()}
                        </td>
                        <td>
                          <strong>{l.actor_name || 'System Auto'}</strong>
                          {l.actor_role && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.actor_role}</div>}
                        </td>
                        <td><strong style={{ color: 'var(--primary)', fontSize: '0.82rem' }}>{l.action}</strong></td>
                        <td>{l.request_number || 'N/A'}</td>
                        <td>
                          {l.previous_state || l.new_state ? (
                            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                              {l.previous_state || 'START'} → {l.new_state || 'END'}
                            </span>
                          ) : '-'}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{l.ip_address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
