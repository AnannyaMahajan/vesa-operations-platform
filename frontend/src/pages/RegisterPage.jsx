import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [deptId, setDeptId] = useState('1');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.register({
        email,
        password,
        full_name: fullName,
        department_id: parseInt(deptId, 10),
        role: 'Employee'
      });
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '36px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Employee Registration</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Create an employee profile to submit and track requests</p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: 'var(--status-rose-bg)', color: 'var(--status-rose)', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Full Name</label>
            <input type="text" required placeholder="e.g. Rahul Verma" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Work Email Address</label>
            <input type="email" required placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Department</label>
            <select value={deptId} onChange={(e) => setDeptId(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
              <option value="1">Product Engineering (ENG)</option>
              <option value="2">Marketing & Growth (MKT)</option>
              <option value="3">Operations & Logistics (OPS)</option>
              <option value="4">Finance & Accounting (FIN)</option>
              <option value="5">IT & Infrastructure (IT)</option>
              <option value="6">Human Resources (HR)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Password (min 8 characters)</label>
            <input type="password" required minLength={8} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Creating Profile...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
