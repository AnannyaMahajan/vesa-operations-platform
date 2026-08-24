import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import SlaBadge from '../components/SlaBadge';
import Timeline from '../components/Timeline';
import CommentBox from '../components/CommentBox';
import AttachmentViewer from '../components/AttachmentViewer';
import { CheckCircle2, XCircle, AlertCircle, CheckSquare, Clock, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function RequestDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Workflow Action Form State
  const [actionComment, setActionComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getRequestById(id);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load request details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleAction = async (actionType) => {
    if ((actionType === 'REJECT' || actionType === 'REQUEST_CHANGES') && !actionComment.trim()) {
      showToast(`A mandatory justification comment is required when performing '${actionType.replace('_', ' ')}'.`, 'error');
      return;
    }

    setActionLoading(true);
    try {
      await api.executeAction(id, actionType, actionComment.trim());
      showToast(`Action '${actionType}' completed successfully!`, 'success');
      setActionComment('');
      loadDetail();
    } catch (err) {
      showToast(err.message || `Failed to execute action ${actionType}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async (msg) => {
    await api.addComment(id, msg);
    loadDetail();
  };

  const handleUploadAttachment = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    await api.uploadAttachment(id, formData);
    showToast('Supporting document uploaded successfully!', 'success');
    loadDetail();
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Navbar title="Request Details" />
          <div className="page-container">
            <div className="card" style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Loading request details...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Navbar title="Request Error" />
          <div className="page-container">
            <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
              <ShieldAlert size={36} style={{ color: 'var(--status-rose)', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{error || 'Request Not Found'}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                The request could not be retrieved or you do not have permission to view it.
              </p>
              <button onClick={() => navigate('/requests')} className="btn btn-secondary" style={{ marginTop: '16px' }}>
                <ArrowLeft size={14} /> Back to Requests List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { request, approvals, comments, attachments, auditLogs } = data;
  const isRequester = user.id === request.requester_id;
  const isTerminal = ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(request.status);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title={`Request ${request.request_number}`} description="Enterprise Workflow Details & Audit Trail" />

        <div className="page-container">
          {/* Back button & Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <button onClick={() => navigate('/requests')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <ArrowLeft size={14} /> Back to Requests
            </button>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: request.priority === 'URGENT' ? '#ffe4e6' : (request.priority === 'HIGH' ? '#fef3c7' : '#f1f5f9'),
                color: request.priority === 'URGENT' ? '#e11d48' : (request.priority === 'HIGH' ? '#d97706' : '#475569')
              }}>
                {request.priority} PRIORITY
              </span>
              <StatusBadge status={request.status} />
              <SlaBadge slaStatus={request.sla_status} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            {/* Left Column: Info & Action Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header Info Card */}
              <div className="card">
                <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {request.type_name} • Target SLA: {request.target_sla_hours} Hours
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '4px', marginBottom: '14px', color: 'var(--text-primary)' }}>
                  {request.title}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>Requester</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{request.requester_name}</strong> ({request.department_code})
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>Current Assignee</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{request.assignee_name || 'Unassigned Queue'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>Submitted Date</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{new Date(request.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                  </div>
                </div>

                {/* Dynamic Workflow Payload Specification */}
                <div style={{ marginTop: '18px' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Workflow Specification Payload
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
                    {Object.entries(request.payload || {}).map(([key, val]) => (
                      <div key={key} style={{ padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>
                          {key.replace('_', ' ')}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Decision Panel */}
              {!isTerminal && (
                <div className="card" style={{ border: '2px solid var(--accent-bg)' }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckSquare size={16} style={{ color: 'var(--accent)' }} />
                    <span>Workflow Stage Action Control</span>
                  </h3>

                  {isRequester && user.role !== 'System Administrator' ? (
                    <div style={{ padding: '10px 14px', backgroundColor: 'var(--status-amber-bg)', color: 'var(--status-amber)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontWeight: 600 }}>
                      ⚠️ Security Policy Active: Requesters cannot approve or process their own requests.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label className="form-label">
                          Action Note / Justification (Mandatory for Reject & Request Changes)
                        </label>
                        <textarea 
                          rows={2} 
                          placeholder="Provide approval comments, verification notes, or rejection justification..."
                          value={actionComment}
                          onChange={(e) => setActionComment(e.target.value)}
                          className="form-textarea"
                        />
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        <button 
                          onClick={() => handleAction('APPROVE')} 
                          className="btn btn-success" 
                          disabled={actionLoading}
                        >
                          <CheckCircle2 size={15} />
                          <span>Approve Stage</span>
                        </button>

                        <button 
                          onClick={() => handleAction('REQUEST_CHANGES')} 
                          className="btn btn-secondary" 
                          style={{ color: 'var(--status-amber)', borderColor: 'rgba(217,119,6,0.3)' }}
                          disabled={actionLoading}
                        >
                          <AlertCircle size={15} />
                          <span>Request Changes</span>
                        </button>

                        <button 
                          onClick={() => handleAction('REJECT')} 
                          className="btn btn-danger" 
                          disabled={actionLoading}
                        >
                          <XCircle size={15} />
                          <span>Reject Request</span>
                        </button>

                        {['Reporting Manager', 'Department Staff', 'System Administrator'].includes(user.role) && (
                          <button 
                            onClick={() => handleAction('COMPLETE')} 
                            className="btn btn-primary" 
                            disabled={actionLoading}
                          >
                            <CheckSquare size={15} />
                            <span>Mark Completed</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Attachments Card */}
              <div className="card">
                <AttachmentViewer attachments={attachments} onUpload={handleUploadAttachment} />
              </div>

              {/* Comments Thread Card */}
              <div className="card">
                <CommentBox comments={comments} onAddComment={handleAddComment} />
              </div>
            </div>

            {/* Right Column: Vertical Activity Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card">
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} style={{ color: 'var(--accent)' }} />
                  <span>Activity & Audit Trail</span>
                </h3>
                <Timeline auditLogs={auditLogs} approvals={approvals} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
