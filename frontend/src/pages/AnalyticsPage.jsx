import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import { BarChart3, AlertTriangle, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const complianceRate = stats?.slaPerformance?.complianceRate ?? stats?.slaComplianceRate ?? 100;
  const completedWithinSla = stats?.slaPerformance?.completed_within_sla ?? stats?.slaBreakdown?.completed_within_sla ?? 0;
  const overdueCount = stats?.counts?.overdue ?? stats?.slaBreakdown?.overdue ?? 0;
  const bottlenecksList = stats?.bottlenecks || [];
  const deptList = stats?.workloadByDept || stats?.workloadByDepartment || [];
  const typeList = stats?.workloadByType || [];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Operations Analytics & Bottleneck Monitoring" />

        <div className="container-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Operational Performance & Bottleneck Analysis</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Organization-wide operational metrics for 500+ employees</p>
            </div>
            <ExportButton />
          </div>

          {loading ? (
            <div className="card skeleton" style={{ height: '300px' }} />
          ) : (
            <>
              {/* SLA Health Summary Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{complianceRate}%</div>
                    <div className="stat-label">SLA Compliance Rate</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{completedWithinSla}</div>
                    <div className="stat-label">Met SLA Targets</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: '#fff1f2', color: '#f43f5e' }}>
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{overdueCount}</div>
                    <div className="stat-label">Active Overdue Requests</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <div className="stat-value">~18.5 hrs</div>
                    <div className="stat-label">Avg Resolution Time</div>
                  </div>
                </div>
              </div>

              {/* Bottleneck Detector Card */}
              <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} style={{ color: 'var(--status-amber)' }} />
                  <span>Smart Bottleneck & Operational Delay Detector</span>
                </h3>

                {bottlenecksList.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No operational bottlenecks detected! All request stages are processing smoothly.
                  </div>
                ) : (
                  <div className="table-container">
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
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: hoursStuck > 24 ? '#e11d48' : '#d97706' }}>
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

              {/* Workload breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="card">
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Workload by Department</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {deptList.map(d => (
                      <div key={d.department_code || d.department_name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{d.department_name} ({d.department_code || 'N/A'})</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{d.count}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Workload by Request Type</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {typeList.map(t => (
                      <div key={t.type_code || t.type_name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{t.type_name}</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{t.count}</strong>
                      </div>
                    ))}
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
