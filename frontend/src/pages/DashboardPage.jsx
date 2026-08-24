import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import SlaBadge from '../components/SlaBadge';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  PlusCircle, 
  ArrowRight,
  Eye,
  Activity,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, requestsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getRequests({ limit: 5 })
      ]);
      setStats(statsRes);
      setRecentRequests(requestsRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Navbar title="Dashboard" />
          <div className="page-container">
            <div className="card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Loading your workspace...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'User';
  const complianceRate = stats?.slaComplianceRate ?? stats?.slaPerformance?.complianceRate ?? 100;
  const slaBreakdown = stats?.slaBreakdown || stats?.slaPerformance || {};
  const pendingCount = stats?.counts?.pending_approval || stats?.counts?.open || 0;
  const totalCount = stats?.counts?.total || 0;
  const completedCount = stats?.counts?.completed || 0;
  const overdueCount = stats?.counts?.overdue || 0;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Dashboard" />

        <div className="page-container">
          {/* Human Greeting Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {getGreeting()}, {firstName}
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.85rem' }}>
                Here’s what needs your attention today • <span style={{ color: 'var(--text-muted)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              </p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/requests/create')}
              style={{ height: '36px', padding: '0 14px' }}
            >
              <PlusCircle size={15} />
              <span>New Request</span>
            </button>
          </div>

          {/* Compact Summary Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '24px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={16} style={{ color: 'var(--accent)' }} />
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{totalCount}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Total requests</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }}>
              <Clock size={16} style={{ color: 'var(--status-amber)' }} />
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{pendingCount}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Needing attention</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }}>
              <CheckCircle size={16} style={{ color: 'var(--status-emerald)' }} />
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{completedCount}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Completed recently</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }}>
              <TrendingUp size={16} style={{ color: 'var(--status-emerald)' }} />
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{complianceRate}%</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>SLA target health</div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Workspace Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '20px' }}>
            {/* Left Main Content: YOUR REQUESTS */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  YOUR REQUESTS
                </h3>
                <button 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.75rem', padding: '3px 8px', height: '26px' }}
                  onClick={() => navigate('/requests')}
                >
                  View all requests <ArrowRight size={12} style={{ marginLeft: '2px' }} />
                </button>
              </div>

              {recentRequests.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  No active requests found. Create a new request to get started.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentRequests.map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => navigate(`/requests/${r.id}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#fafafa',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1, paddingRight: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.78rem', color: 'var(--accent)' }}>
                            {r.request_number}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {r.title}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {r.type_name} • Requester: {r.requester_name}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <StatusBadge status={r.status} />
                        <SlaBadge slaStatus={r.sla_status} />
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '3px 8px', fontSize: '0.72rem', height: '24px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/requests/${r.id}`);
                          }}
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Secondary Column: Needs Attention & SLA Health */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Needs Attention Block */}
              <div className="card">
                <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} style={{ color: 'var(--status-amber)' }} />
                  <span>NEEDS YOUR ATTENTION</span>
                </h3>

                {pendingCount > 0 ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', backgroundColor: 'var(--status-amber-bg)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(217,119,6,0.2)' }}>
                    <strong>{pendingCount} request(s)</strong> awaiting review or approval in your workflow pipeline.
                  </div>
                ) : (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    You're all caught up. No pending actions required.
                  </div>
                )}
              </div>

              {/* SLA Health Block */}
              <div className="card">
                <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={14} style={{ color: 'var(--status-emerald)' }} />
                  <span>SLA HEALTH</span>
                </h3>

                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {complianceRate}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>
                    SLA Compliance Target
                  </div>

                  <div style={{ width: '100%', height: '6px', backgroundColor: '#e7e5e4', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${complianceRate}%`, height: '100%', backgroundColor: 'var(--status-emerald)', borderRadius: '3px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Completed within SLA:</span>
                    <strong style={{ color: 'var(--status-emerald)' }}>{slaBreakdown.completed_within_sla ?? 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Completed after SLA:</span>
                    <strong style={{ color: 'var(--status-rose)' }}>{slaBreakdown.completed_after_sla ?? 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Active within SLA:</span>
                    <strong>{slaBreakdown.within_sla ?? 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Active overdue:</span>
                    <strong style={{ color: 'var(--status-rose)' }}>{slaBreakdown.overdue ?? 0}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
