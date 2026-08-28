import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  CheckSquare, 
  BarChart3, 
  ShieldAlert, 
  Users, 
  LogOut 
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  const isItemActive = (targetPath) => {
    if (targetPath === '/requests') {
      return location.pathname === '/requests' || (location.pathname.startsWith('/requests/') && location.pathname !== '/requests/create');
    }
    return location.pathname === targetPath;
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="logo-badge">V</div>
        <div>
          <div className="brand-title">VESA Operations</div>
          <div className="brand-subtitle">ENTERPRISE PLATFORM</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <Link 
          to="/dashboard" 
          className={`nav-item ${isItemActive('/dashboard') ? 'active' : ''}`}
        >
          <LayoutDashboard className="nav-icon" />
          <span>Dashboard</span>
        </Link>

        <Link 
          to="/requests" 
          className={`nav-item ${isItemActive('/requests') ? 'active' : ''}`}
        >
          <FileText className="nav-icon" />
          <span>All Requests</span>
        </Link>

        <Link 
          to="/requests/create" 
          className={`nav-item ${isItemActive('/requests/create') ? 'active' : ''}`}
        >
          <PlusCircle className="nav-icon" />
          <span>New Request</span>
        </Link>

        <Link 
          to="/pending-work" 
          className={`nav-item ${isItemActive('/pending-work') ? 'active' : ''}`}
        >
          <CheckSquare className="nav-icon" />
          <span>Pending Work</span>
        </Link>

        {['Operations Manager', 'System Administrator'].includes(user.role) && (
          <Link 
            to="/analytics" 
            className={`nav-item ${isItemActive('/analytics') ? 'active' : ''}`}
          >
            <BarChart3 className="nav-icon" />
            <span>Analytics & SLAs</span>
          </Link>
        )}

        {['Operations Manager', 'System Administrator'].includes(user.role) && (
          <Link 
            to="/audit-logs" 
            className={`nav-item ${isItemActive('/audit-logs') ? 'active' : ''}`}
          >
            <ShieldAlert className="nav-icon" />
            <span>Audit Trail</span>
          </Link>
        )}

        {user.role === 'System Administrator' && (
          <Link 
            to="/admin" 
            className={`nav-item ${isItemActive('/admin') ? 'active' : ''}`}
          >
            <Users className="nav-icon" />
            <span>System Admin</span>
          </Link>
        )}
      </nav>

      {/* Bottom Profile Area & Sign Out */}
      <div style={{ padding: '14px 12px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px', borderRadius: '6px', backgroundColor: 'var(--border-subtle)' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.78rem'
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.full_name}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.role}
            </div>
          </div>
        </div>

        <button onClick={logout} className="nav-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', justifyContent: 'flex-start', padding: '8px 10px' }}>
          <LogOut className="nav-icon" style={{ color: '#f43f5e' }} />
          <span style={{ color: '#f43f5e' }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
