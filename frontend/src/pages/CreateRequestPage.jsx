import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useNotification } from '../context/NotificationContext';
import { ShieldCheck, FileSpreadsheet, FileCheck, HardDrive, Send, Check } from 'lucide-react';

export default function CreateRequestPage() {
  const [requestTypeCode, setRequestTypeCode] = useState('SOFTWARE_ACCESS');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form payload states for 4 workflows
  const [softwareName, setSoftwareName] = useState('');
  const [accessLevel, setAccessLevel] = useState('Standard User');
  const [businessJustification, setBusinessJustification] = useState('');
  const [requiredDate, setRequiredDate] = useState('');

  const [expenseCategory, setExpenseCategory] = useState('Client Meeting & Travel');
  const [expenseDate, setExpenseDate] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [businessPurpose, setBusinessPurpose] = useState('');

  const [documentTitle, setDocumentTitle] = useState('');
  const [documentType, setDocumentType] = useState('Internal Policy Standard');
  const [version, setVersion] = useState('1.0');
  const [approvalDeadline, setApprovalDeadline] = useState('');

  const [equipmentType, setEquipmentType] = useState('External Monitor (27-inch 4K)');
  const [quantity, setQuantity] = useState('1');

  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    let payload = {};

    if (requestTypeCode === 'SOFTWARE_ACCESS') {
      if (!softwareName || !accessLevel || !businessJustification || !requiredDate) {
        setError('Please complete all Software Access fields.');
        return;
      }
      payload = { software_name: softwareName, access_level: accessLevel, business_justification: businessJustification, required_date: requiredDate };
    } else if (requestTypeCode === 'EXPENSE_REIMBURSEMENT') {
      if (!expenseCategory || !expenseDate || !amount || Number(amount) <= 0 || !businessPurpose) {
        setError('Please enter valid Expense Reimbursement fields and amount.');
        return;
      }
      payload = { expense_category: expenseCategory, expense_date: expenseDate, amount: Number(amount), description, business_purpose: businessPurpose };
    } else if (requestTypeCode === 'DOCUMENT_APPROVAL') {
      if (!documentTitle || !documentType || !version || !approvalDeadline) {
        setError('Please complete all Document Approval fields.');
        return;
      }
      payload = { document_title: documentTitle, document_type: documentType, version, approval_deadline: approvalDeadline };
    } else if (requestTypeCode === 'EQUIPMENT_REQUEST') {
      if (!equipmentType || !quantity || Number(quantity) <= 0 || !businessJustification || !requiredDate) {
        setError('Please complete all Equipment Request fields.');
        return;
      }
      payload = { equipment_type: equipmentType, quantity: Number(quantity), business_justification: businessJustification, required_date: requiredDate };
    }

    setLoading(true);
    try {
      const res = await api.createRequest({
        request_type_code: requestTypeCode,
        title: title.trim(),
        priority,
        payload
      });

      showToast(`Request ${res.request.request_number} submitted successfully!`, 'success');
      navigate(`/requests/${res.request.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  const workflowOptions = [
    { code: 'SOFTWARE_ACCESS', name: 'Software Access', desc: 'Request access to software & apps', sla: '24h Target SLA', icon: ShieldCheck },
    { code: 'EXPENSE_REIMBURSEMENT', name: 'Expense Claim', desc: 'Submit business expense claims', sla: '48h Target SLA', icon: FileSpreadsheet },
    { code: 'DOCUMENT_APPROVAL', name: 'Doc Approval', desc: 'Route documents for review', sla: '72h Target SLA', icon: FileCheck },
    { code: 'EQUIPMENT_REQUEST', name: 'Equipment', desc: 'Order hardware & peripherals', sla: '72h Target SLA', icon: HardDrive }
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="New Request" />

        <div className="page-container" style={{ maxWidth: '780px' }}>
          <div className="card">
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                New Request
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Tell us what you need. We'll route it to the right workflow engine.
              </p>
            </div>

            {/* Step 1: Selectable Process Cards */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                STEP 1: SELECT REQUEST TYPE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {workflowOptions.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = requestTypeCode === opt.code;
                  return (
                    <div
                      key={opt.code}
                      onClick={() => setRequestTypeCode(opt.code)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${isSelected ? '#2563eb' : 'var(--border-color)'}`,
                        backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        position: 'relative',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <Icon size={22} style={{ color: isSelected ? '#2563eb' : 'var(--text-muted)', flexShrink: 0 }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#2563eb' : 'var(--text-primary)' }}>{opt.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{opt.desc}</div>
                      </div>
                      {isSelected && (
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={10} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--status-rose-bg)', color: 'var(--status-rose)', borderRadius: 'var(--radius-sm)', marginBottom: '18px', fontSize: '0.82rem', fontWeight: 600 }}>
                {error}
              </div>
            )}

            {/* Conversational Form Fields */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                STEP 2: REQUEST OVERVIEW
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">What is this request for? *</label>
                  <input type="text" required placeholder="e.g. Access to Figma Enterprise License" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" />
                </div>

                <div>
                  <label className="form-label">Priority Level</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="form-select">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Contextual Workflow Fields */}
              {requestTypeCode === 'SOFTWARE_ACCESS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#fafafa', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Software Access Specifications</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label">Software / Application Name *</label>
                      <input type="text" required placeholder="e.g. Jira & Confluence Suite" value={softwareName} onChange={(e) => setSoftwareName(e.target.value)} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Access Level Required *</label>
                      <select value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)} className="form-select">
                        <option value="Standard User">Standard User</option>
                        <option value="Editor / Developer">Editor / Developer</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Read Only">Read Only</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">When do you need this by? *</label>
                    <input type="date" required value={requiredDate} onChange={(e) => setRequiredDate(e.target.value)} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Why do you need this? Briefly explain what you're trying to accomplish. *</label>
                    <textarea required rows={3} placeholder="Explain why this software access is required for your role..." value={businessJustification} onChange={(e) => setBusinessJustification(e.target.value)} className="form-textarea" />
                  </div>
                </div>
              )}

              {requestTypeCode === 'EXPENSE_REIMBURSEMENT' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#fafafa', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Expense Claim Details</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label">Expense Category *</label>
                      <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} className="form-select">
                        <option value="Client Meeting & Travel">Client Meeting & Travel</option>
                        <option value="Software Subscription">Software Subscription</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="Training & Certifications">Training & Certifications</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Expense Date *</label>
                      <input type="date" required value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Amount (₹) *</label>
                      <input type="number" required min="1" placeholder="4850" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-input" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Business Purpose & Details *</label>
                    <textarea required rows={3} placeholder="Describe the business purpose and eligible expenditure..." value={businessPurpose} onChange={(e) => setBusinessPurpose(e.target.value)} className="form-textarea" />
                  </div>
                </div>
              )}

              {requestTypeCode === 'DOCUMENT_APPROVAL' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#fafafa', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Document Specifications</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label">Document Title *</label>
                      <input type="text" required placeholder="e.g. Data Protection Standard" value={documentTitle} onChange={(e) => setDocumentTitle(e.target.value)} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Document Type *</label>
                      <input type="text" required placeholder="e.g. Internal Policy Standard" value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Version *</label>
                      <input type="text" required placeholder="1.0" value={version} onChange={(e) => setVersion(e.target.value)} className="form-input" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Approval Deadline *</label>
                    <input type="date" required value={approvalDeadline} onChange={(e) => setApprovalDeadline(e.target.value)} className="form-input" />
                  </div>
                </div>
              )}

              {requestTypeCode === 'EQUIPMENT_REQUEST' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#fafafa', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Hardware Equipment Details</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label">Equipment Type *</label>
                      <select value={equipmentType} onChange={(e) => setEquipmentType(e.target.value)} className="form-select">
                        <option value="External Monitor (27-inch 4K)">External Monitor (27-inch 4K)</option>
                        <option value="MacBook Pro 16-inch M3">MacBook Pro 16-inch M3</option>
                        <option value="Wireless Mechanical Keyboard">Wireless Mechanical Keyboard</option>
                        <option value="Ergonomic Desk Chair">Ergonomic Desk Chair</option>
                        <option value="Noise-Canceling Headset">Noise-Canceling Headset</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Quantity *</label>
                      <input type="number" required min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="form-input" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">When do you need this by? *</label>
                    <input type="date" required value={requiredDate} onChange={(e) => setRequiredDate(e.target.value)} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Why do you need this equipment? *</label>
                    <textarea required rows={3} placeholder="Explain why this equipment is needed for your work..." value={businessJustification} onChange={(e) => setBusinessJustification(e.target.value)} className="form-textarea" />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Send size={14} />
                  <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
