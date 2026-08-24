import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const getCleanErrorMessage = (err) => {
    if (!err) return 'Unable to sign in. Please verify your credentials and try again.';
    const msg = String(err.message || err);
    if (msg.includes('JSON') || msg.includes('Unexpected token') || msg.includes('SyntaxError')) {
      return 'Unable to sign you in right now. Please check your credentials and try again.';
    }
    return msg || 'Unable to sign in. Please verify your credentials and try again.';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getCleanErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, 'Password123!');
      navigate('/dashboard');
    } catch (err) {
      setError(getCleanErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-main)',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        padding: '32px'
      }}>
        {/* VESA Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="logo-badge" style={{ margin: '0 auto 10px auto', width: '44px', height: '44px', fontSize: '1.3rem' }}>V</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            VESA Operations
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Sign in to access your enterprise workspace
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'var(--status-rose-bg)',
            color: 'var(--status-rose)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '18px',
            fontSize: '0.82rem',
            fontWeight: 600,
            border: '1px solid rgba(225, 29, 72, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="form-label">
              Work Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '11px', top: '11px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '34px' }}
              />
            </div>
          </div>

          <div>
            <label className="form-label">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '11px', top: '11px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '34px' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', marginTop: '4px' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
          </button>
        </form>

        {/* Quick Demo Persona Switcher */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <UserCheck size={13} /> Quick Demo Personas (One-Click Login)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button type="button" onClick={() => handleQuickLogin('aarav.sharma@company.com')} className="btn btn-secondary" style={{ padding: '5px 6px', fontSize: '0.72rem' }}>
              1. Employee (Aarav)
            </button>
            <button type="button" onClick={() => handleQuickLogin('priya.mehta@company.com')} className="btn btn-secondary" style={{ padding: '5px 6px', fontSize: '0.72rem' }}>
              2. Manager (Priya)
            </button>
            <button type="button" onClick={() => handleQuickLogin('vikram.singh@company.com')} className="btn btn-secondary" style={{ padding: '5px 6px', fontSize: '0.72rem' }}>
              3. IT Staff (Vikram)
            </button>
            <button type="button" onClick={() => handleQuickLogin('elena.rodriguez@company.com')} className="btn btn-secondary" style={{ padding: '5px 6px', fontSize: '0.72rem' }}>
              4. Director (Elena)
            </button>
            <button type="button" onClick={() => handleQuickLogin('alex.chen@company.com')} className="btn btn-secondary" style={{ padding: '5px 6px', fontSize: '0.72rem' }}>
              5. System Admin
            </button>
            <button type="button" onClick={() => handleQuickLogin('sarah.jenkins@company.com')} className="btn btn-secondary" style={{ padding: '5px 6px', fontSize: '0.72rem' }}>
              6. Ops Manager
            </button>
          </div>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Register employee account</Link>
        </div>
      </div>
    </div>
  );
}
