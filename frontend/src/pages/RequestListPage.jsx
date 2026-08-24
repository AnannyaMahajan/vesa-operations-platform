import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import SlaBadge from '../components/SlaBadge';
import { Search, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export default function RequestListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [requestTypeId, setRequestTypeId] = useState(searchParams.get('request_type_id') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [slaStatus, setSlaStatus] = useState(searchParams.get('sla_status') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (requestTypeId) params.request_type_id = requestTypeId;
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (slaStatus) params.sla_status = slaStatus;

      const res = await api.getRequests(params);
      setRequests(res.data || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  }, [search, requestTypeId, status, priority, slaStatus, page]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleFilterReset = () => {
    setSearch('');
    setRequestTypeId('');
    setStatus('');
    setPriority('');
    setSlaStatus('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Requests" />

        <div className="page-container">
          {/* Header Description */}
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Requests
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Track and manage your enterprise workflow requests.
            </p>
          </div>

          {/* Search & Filter Control Bar */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
            gap: '8px',
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search by request ID, title, requester..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '30px' }}
              />
            </div>

            <select value={requestTypeId} onChange={(e) => setRequestTypeId(e.target.value)} className="form-select">
              <option value="">All Process Types</option>
              <option value="1">Software Access</option>
              <option value="2">Expense Reimbursement</option>
              <option value="3">Document Approval</option>
              <option value="4">Equipment Request</option>
            </select>

            <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select">
              <option value="">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="APPROVAL_PENDING">APPROVAL PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CHANGES_REQUESTED">CHANGES REQUESTED</option>
            </select>

            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="form-select">
              <option value="">All Priorities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>

            <button onClick={handleFilterReset} className="btn btn-secondary" style={{ padding: '7px 12px' }}>
              Reset Filters
            </button>
          </div>

          {/* Work Management Table */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                WORKFLOW REQUESTS ({pagination.total})
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Loading enterprise workflow requests...
              </div>
            ) : requests.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Filter size={24} style={{ margin: '0 auto 6px auto', opacity: 0.4 }} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>No requests yet</h4>
                <p style={{ fontSize: '0.8rem', marginTop: '2px' }}>No requests match your filter selection right now.</p>
                <button onClick={handleFilterReset} className="btn btn-secondary" style={{ marginTop: '10px', fontSize: '0.75rem' }}>
                  Clear Filters
                </button>
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
                      <th>Priority</th>
                      <th>Status</th>
                      <th>SLA Target</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)' }}>{r.request_number}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{r.requester_name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.department_code}</div>
                        </td>
                        <td><span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{r.type_name}</span></td>
                        <td style={{ maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</td>
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
                          <Link to={`/requests/${r.id}`} className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem', height: '24px' }}>
                            <Eye size={12} />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Showing {requests.length} of {pagination.total} entries
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
                    disabled={page >= pagination.totalPages} 
                    onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
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
