import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import SlaBadge from '../components/SlaBadge';
import { CheckSquare, Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PendingWorkPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const getActionableStatusesForRole = (role) => {
    switch (role) {
      case 'Reporting Manager':
        return ['APPROVAL_PENDING', 'UNDER_REVIEW', 'SUBMITTED'];
      case 'Department Staff':
        return ['APPROVED', 'PROCESSING', 'APPROVAL_PENDING'];
      case 'Department Head / Director':
        return ['APPROVAL_PENDING', 'UNDER_REVIEW'];
      case 'Operations Manager':
      case 'System Administrator':
        return ['APPROVAL_PENDING', 'UNDER_REVIEW', 'PROCESSING', 'SUBMITTED'];
      case 'Employee':
        return ['CHANGES_REQUESTED'];
      default:
        return ['APPROVAL_PENDING', 'UNDER_REVIEW'];
    }
  };

  const loadPendingWork = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch requests requiring pending action for the user
      const res = await api.getRequests({ limit: 100, pending_action: true });
      const allAuthorized = res.data || res.requests || [];
      const actionableStatuses = getActionableStatusesForRole(user?.role);

      // Role-aware actionable filtering
      const filtered = allAuthorized.filter(r => {
        // Exclude terminal completed/rejected/cancelled states
        if (['COMPLETED', 'REJECTED', 'CANCELLED'].includes(r.status)) {
          return false;
        }

        // Prevent self-approval violation from showing up in manager actionable queue
        if (['Reporting Manager', 'Department Head / Director'].includes(user?.role) && r.requester_id === user?.id) {
          return false;
        }

        // Must match role actionable statuses
        return actionableStatuses.includes(r.status);
      });

      setRequests(filtered);
    } catch (err) {
      console.error('Failed to load pending work:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPendingWork();
  }, [loadPendingWork]);

  // Client-side search filtering
  const displayedRequests = requests.filter(r => {
    if (!search) return true;
    const queryStr = search.toLowerCase();
    return (
      r.request_number.toLowerCase().includes(queryStr) ||
      r.title.toLowerCase().includes(queryStr) ||
      r.requester_name.toLowerCase().includes(queryStr)
    );
  });

  const totalPages = Math.ceil(displayedRequests.length / limit) || 1;
  const paginatedRequests = displayedRequests.slice((page - 1) * limit, page * limit);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Pending Work" />

        <div className="page-container">
          {/* Header Description */}
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Pending Work
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Actionable workflow requests currently requiring review, approval, or processing from your role.
            </p>
          </div>

          {/* Search Bar */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search pending work by request ID, title, or requester..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="form-input"
                style={{ paddingLeft: '30px' }}
              />
            </div>
          </div>

          {/* Pending Work Table */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ACTIONABLE REQUESTS ({displayedRequests.length})
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Page {page} of {totalPages}
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Loading actionable requests...
              </div>
            ) : displayedRequests.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckSquare size={28} style={{ margin: '0 auto 8px auto', opacity: 0.5, color: 'var(--status-emerald)' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>No pending work</h4>
                <p style={{ fontSize: '0.82rem', marginTop: '2px' }}>You're all caught up. There are no requests waiting for your action right now.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Requester</th>
                      <th>Process Type</th>
                      <th>Title</th>
                      <th>Action Needed</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>SLA Target</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRequests.map(r => {
                      let actionCallout = 'Review Required';
                      let badgeBg = '#eff6ff';
                      let badgeColor = '#1d4ed8';

                      if (['SUBMITTED', 'UNDER_REVIEW', 'APPROVAL_PENDING'].includes(r.status)) {
                        actionCallout = 'Approval Required';
                        badgeBg = '#fef3c7';
                        badgeColor = '#b45309';
                      } else if (['APPROVED', 'PROCESSING'].includes(r.status)) {
                        actionCallout = 'Fulfillment Action';
                        badgeBg = '#e0e7ff';
                        badgeColor = '#4338ca';
                      } else if (r.status === 'CHANGES_REQUESTED') {
                        actionCallout = 'Update & Resubmit';
                        badgeBg = '#fee2e2';
                        badgeColor = '#b91c1c';
                      }

                      return (
                        <tr key={r.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)' }}>{r.request_number}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{r.requester_name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.department_code}</div>
                          </td>
                          <td><span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{r.type_name}</span></td>
                          <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</td>
                          <td>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '12px',
                              backgroundColor: badgeBg,
                              color: badgeColor,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              ● {actionCallout}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: r.priority === 'URGENT' ? '#ffe4e6' : (r.priority === 'HIGH' ? '#fef3c7' : '#f5f5f4'),
                              color: r.priority === 'URGENT' ? '#e11d48' : (r.priority === 'HIGH' ? '#d97706' : '#57534e')
                            }}>
                              {r.priority}
                            </span>
                          </td>
                          <td><StatusBadge status={r.status} /></td>
                          <td><SlaBadge slaStatus={r.sla_status} /></td>
                          <td style={{ textAlign: 'right' }}>
                            <Link to={`/requests/${r.id}`} className="btn btn-primary" style={{ padding: '3px 8px', fontSize: '0.72rem', height: '24px' }}>
                              <Eye size={12} />
                              <span>Action</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Showing {paginatedRequests.length} of {displayedRequests.length} pending items
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    disabled={page <= 1} 
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    className="btn btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                  >
                    <ChevronLeft size={13} /> Previous
                  </button>
                  <button 
                    disabled={page >= totalPages} 
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    className="btn btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                  >
                    Next <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
