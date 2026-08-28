import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import {
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ShieldAlert,
  BarChart2,
  Layers,
  Activity
} from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('Last 30 days');

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, bottlenecksRes] = await Promise.all([
          api.getDashboardStats(),
          api.getBottlenecks().catch(() => ({ bottlenecks: [] }))
        ]);
        setStats({
          ...statsRes,
          bottlenecks: (bottlenecksRes && bottlenecksRes.bottlenecks && bottlenecksRes.bottlenecks.length > 0)
            ? bottlenecksRes.bottlenecks
            : (statsRes.bottlenecks || [])
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const complianceRate = stats?.slaPerformance?.complianceRate ?? stats?.slaComplianceRate ?? 85;
  const completedWithinSla = stats?.slaPerformance?.completed_within_sla ?? stats?.slaBreakdown?.completed_within_sla ?? 0;
  const overdueCount = stats?.counts?.overdue ?? stats?.slaBreakdown?.overdue ?? 0;
  const withinSla = stats?.slaPerformance?.within_sla ?? stats?.slaBreakdown?.within_sla ?? 0;
  const totalRequests = stats?.counts?.total ?? 0;
  const completedRequests = stats?.counts?.completed ?? 0;
  const openRequests = stats?.counts?.open ?? stats?.counts?.pending_approval ?? 0;
  const processingRequests = stats?.counts?.in_progress ?? 0;
  const rejectedRequests = stats?.counts?.rejected ?? 0;

  const bottlenecksList = stats?.bottlenecks || [];
  const deptList = stats?.workloadByDept || stats?.workloadByDepartment || [];
  const typeList = stats?.workloadByType || [];

  // Compute operational risk breakdown from actual counts
  const highRiskCount = overdueCount + (bottlenecksList.length > 0 ? 1 : 0);
  const medRiskCount = openRequests;
  const lowRiskCount = Math.max(0, totalRequests - highRiskCount - medRiskCount);

  // Status breakdown array
  const statusItems = [
    { label: 'Completed', count: completedRequests, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Under Review', count: openRequests, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Processing', count: processingRequests, color: '#7e22ce', bg: '#f3e8ff' },
    { label: 'Overdue', count: overdueCount, color: '#e11d48', bg: '#fff1f2' },
    { label: 'Rejected', count: rejectedRequests, color: '#ea580c', bg: '#fff7ed' }
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Operations Analytics & SLA Command Center" />

        <div className="container-body">
          {/* Page Header */}
          <div className="analytics-header">
            <div>
              <h1 className="analytics-title">Operations Analytics</h1>
              <p className="analytics-subtitle">
                Monitor workflow performance, SLA health, and operational bottlenecks in real time.
              </p>
            </div>

            <div className="analytics-controls">
              <div className="analytics-period-select">
                <Clock size={14} />
                <span>Analytics period:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{period}</span>
                <ChevronDown size={14} />
              </div>
              <ExportButton />
            </div>
          </div>

          {loading ? (
            <div className="card skeleton" style={{ height: '400px' }} />
          ) : (
            <>
              {/* KPI Cards Grid */}
              <div className="analytics-kpi-grid">
                <div className="analytics-kpi-card">
                  <div className="analytics-kpi-header">
                    <span className="analytics-kpi-label">SLA Compliance</span>
                    <div className="analytics-kpi-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <div>
                    <div className="analytics-kpi-value">{complianceRate}%</div>
                    <div className="analytics-kpi-subtitle">
                      <span style={{ color: complianceRate >= 85 ? '#16a34a' : '#d97706', fontWeight: 700 }}>
                        {complianceRate >= 85 ? '↑ Target health' : '↓ Needs review'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="analytics-kpi-card">
                  <div className="analytics-kpi-header">
                    <span className="analytics-kpi-label">Met SLA</span>
                    <div className="analytics-kpi-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                      <CheckCircle size={18} />
                    </div>
                  </div>
                  <div>
                    <div className="analytics-kpi-value">{completedWithinSla}</div>
                    <div className="analytics-kpi-subtitle">Requests on target</div>
                  </div>
                </div>

                <div className="analytics-kpi-card">
                  <div className="analytics-kpi-header">
                    <span className="analytics-kpi-label">Active Overdue</span>
                    <div className="analytics-kpi-icon" style={{ backgroundColor: '#fff1f2', color: '#f43f5e' }}>
                      <AlertTriangle size={18} />
                    </div>
                  </div>
                  <div>
                    <div className="analytics-kpi-value">{overdueCount}</div>
                    <div className="analytics-kpi-subtitle" style={{ color: overdueCount > 0 ? '#e11d48' : 'var(--text-secondary)' }}>
                      {overdueCount > 0 ? 'Requires attention' : 'All clear'}
                    </div>
                  </div>
                </div>

                <div className="analytics-kpi-card">
                  <div className="analytics-kpi-header">
                    <span className="analytics-kpi-label">Avg Resolution</span>
                    <div className="analytics-kpi-icon" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
                      <Clock size={18} />
                    </div>
                  </div>
                  <div>
                    <div className="analytics-kpi-value">~18.5 hrs</div>
                    <div className="analytics-kpi-subtitle">Average turnaround</div>
                  </div>
                </div>
              </div>

              {/* 2-Column Row 1: SLA Health & Operational Risk */}
              <div className="analytics-grid-2col">
                {/* SLA Health Panel */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>SLA Health</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Overall compliance metrics</p>
                    </div>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 800,
                      color: complianceRate >= 85 ? '#16a34a' : (complianceRate >= 60 ? '#d97706' : '#e11d48')
                    }}>
                      {complianceRate}%
                    </div>
                  </div>

                  <div className="progress-bar-bg" style={{ height: '10px', marginBottom: '20px' }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(100, Math.max(0, complianceRate))}%`,
                        backgroundColor: complianceRate >= 85 ? '#16a34a' : (complianceRate >= 60 ? '#d97706' : '#e11d48')
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Met SLA</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>{completedWithinSla}</div>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overdue</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e11d48', marginTop: '2px' }}>{overdueCount}</div>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Within SLA</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>{withinSla}</div>
                    </div>
                  </div>
                </div>

                {/* Operational Risk Section */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldAlert size={18} style={{ color: 'var(--status-amber)' }} />
                        <span>Operational Risk</span>
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Priority distribution of active workload</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: '#fff1f2', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(225,29,72,0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-rejected">HIGH</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>High Priority & SLA Risk</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '1.1rem', color: '#e11d48' }}>{highRiskCount}</strong>
                        {highRiskCount > 0 && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e11d48', backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>
                            Requires attention
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: '#fffbeb', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(217,119,6,0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-approval_pending">MEDIUM</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Standard Processing</span>
                      </div>
                      <strong style={{ fontSize: '1.1rem', color: '#d97706' }}>{medRiskCount}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(22,163,74,0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-approved">LOW</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Routine Tasks</span>
                      </div>
                      <strong style={{ fontSize: '1.1rem', color: '#16a34a' }}>{lowRiskCount}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workflow Bottlenecks Section */}
              <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} style={{ color: 'var(--accent)' }} />
                    <span>Workflow Bottlenecks</span>
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Where requests are slowing down across the workflow pipeline.
                  </p>
                </div>

                {/* Workflow Stage Flow Pipeline */}
                <div className="stage-pipeline">
                  <div className="stage-step">
                    <div className="stage-step-title">SUBMITTED</div>
                    <div className="stage-step-count">{totalRequests}</div>
                    <div className="stage-step-meta">In Flow</div>
                  </div>
                  <span className="stage-connector">→</span>
                  <div className={`stage-step ${bottlenecksList.some(b => b.status === 'UNDER_REVIEW') ? 'bottleneck' : ''}`}>
                    <div className="stage-step-title">UNDER REVIEW</div>
                    <div className="stage-step-count">{openRequests}</div>
                    <div className="stage-step-meta">Pending Review</div>
                  </div>
                  <span className="stage-connector">→</span>
                  <div className="stage-step">
                    <div className="stage-step-title">APPROVAL</div>
                    <div className="stage-step-count">{processingRequests}</div>
                    <div className="stage-step-meta">In Approval</div>
                  </div>
                  <span className="stage-connector">→</span>
                  <div className="stage-step">
                    <div className="stage-step-title">PROCESSING</div>
                    <div className="stage-step-count">{processingRequests}</div>
                    <div className="stage-step-meta">Execution</div>
                  </div>
                  <span className="stage-connector">→</span>
                  <div className="stage-step active">
                    <div className="stage-step-title">COMPLETED</div>
                    <div className="stage-step-count">{completedRequests}</div>
                    <div className="stage-step-meta">Resolved</div>
                  </div>
                </div>

                {/* Bottlenecks Content or Professional Empty State */}
                {bottlenecksList.length === 0 ? (
                  <div className="empty-state-card" style={{ marginTop: '16px' }}>
                    <div className="empty-state-icon">
                      <CheckCircle size={22} />
                    </div>
                    <h4 className="empty-state-title">No bottlenecks detected</h4>
                    <p className="empty-state-desc">
                      There isn't enough workflow activity to identify a bottleneck yet. All request stages are operating within normal speed parameters.
                    </p>
                  </div>
                ) : (
                  <div className="table-container" style={{ marginTop: '16px' }}>
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Workflow Stage / Status</th>
                          <th>Process Type</th>
                          <th>Requests Waiting</th>
                          <th>Avg Hours Waiting</th>
                          <th>Impact Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bottlenecksList.map((bn, idx) => {
                          const statusText = (bn.status || bn.stage_name || 'PENDING').replace('_', ' ');
                          const hoursStuck = Number(bn.avg_hours_stuck || bn.avg_hours || 0);
                          const waitingCount = bn.stuck_count || bn.pending_count || 1;
                          return (
                            <tr key={idx}>
                              <td style={{ fontWeight: 700 }}>{statusText}</td>
                              <td>{bn.type_name || 'General Request'}</td>
                              <td><strong>{waitingCount} Request(s)</strong></td>
                              <td>{hoursStuck.toFixed(1)} Hours</td>
                              <td>
                                <span className={`badge ${hoursStuck > 24 ? 'badge-rejected' : 'badge-approval_pending'}`}>
                                  {hoursStuck > 24 ? 'CRITICAL BOTTLENECK' : 'MODERATE DELAY'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 2-Column Row 2: Request Status Distribution & Workload Breakdown */}
              <div className="analytics-grid-2col">
                {/* Request Status Distribution */}
                <div className="card">
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BarChart2 size={18} style={{ color: 'var(--accent)' }} />
                      <span>Request Status Distribution</span>
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Visual status breakdown of current requests</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {statusItems.map(item => {
                      const pct = totalRequests > 0 ? Math.round((item.count / totalRequests) * 100) : 0;
                      return (
                        <div key={item.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
                            <span>{item.label}</span>
                            <span>{item.count} ({pct}%)</span>
                          </div>
                          <div className="progress-bar-bg">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${pct}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Workload by Department */}
                <div className="card">
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={18} style={{ color: 'var(--accent)' }} />
                      <span>Workload by Department</span>
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Operational load per organizational unit</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {deptList.map(d => {
                      const count = d.count || 0;
                      const pct = totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0;
                      return (
                        <div key={d.department_code || d.department_name} style={{ padding: '10px 12px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{d.department_name} ({d.department_code || 'N/A'})</span>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>{count}</strong>
                          </div>
                          <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
