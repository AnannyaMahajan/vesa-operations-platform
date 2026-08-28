import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useNotification } from '../context/NotificationContext';
import { Users, Shield, Clock, Plus, Settings } from 'lucide-react';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [slaConfigs, setSlaConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  // New user form state
  const [showAddUser, setShowAddUser] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Employee');
  const [deptId, setDeptId] = useState('1');

  const { showToast } = useNotification();

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const uRes = await api.getUsers();
      const dRes = await api.getDepartments();
      const sRes = await api.getSlaConfigs();
      setUsers(uRes.users || []);
      setDepartments(dRes.departments || []);
      setSlaConfigs(sRes.requestTypes || sRes.sla_configs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createUser({
        email,
        password,
        full_name: fullName,
        role,
        department_id: parseInt(deptId, 10)
      });
      showToast('User created successfully!', 'success');
      setShowAddUser(false);
      setEmail('');
      setFullName('');
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to create user.', 'error');
    }
  };

  const handleUpdateSla = async (id, currentHours) => {
    const newHours = prompt(`Enter new target SLA hours for this request type:`, currentHours);
    if (!newHours || isNaN(newHours)) return;
    try {
      await api.updateSlaConfig(id, parseInt(newHours, 10));
      showToast('SLA target updated successfully!', 'success');
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to update SLA.', 'error');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="System Administration & Workflow Configuration" />

        <div className="container-body">
          {/* SLA Target Configuration Card */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} className="text-primary" />
                <span>Target SLA Hours Configuration</span>
              </h3>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Process Code</th>
                    <th>Process Name</th>
                    <th>Target SLA (Hours)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {slaConfigs.map(cfg => (
                    <tr key={cfg.id}>
                      <td style={{ fontWeight: 700 }}>{cfg.code}</td>
                      <td>{cfg.name}</td>
                      <td><strong>{cfg.target_sla_hours} Hours</strong></td>
                      <td>
                        <button onClick={() => handleUpdateSla(cfg.id, cfg.target_sla_hours)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.78rem' }}>
                          <Settings size={12} /> Edit SLA
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Management Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} className="text-primary" />
                <span>Organization User Directory ({users.length} Users)</span>
              </h3>

              <button onClick={() => setShowAddUser(!showAddUser)} className="btn btn-primary" style={{ padding: '6px 14px' }}>
                <Plus size={16} /> <span>Add User</span>
              </button>
            </div>

            {showAddUser && (
              <form onSubmit={handleCreateUser} style={{ backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Full Name</label>
                  <input type="text" required placeholder="User Name" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Email</label>
                  <input type="email" required placeholder="user@company.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Role</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <option value="Employee">Employee</option>
                    <option value="Reporting Manager">Reporting Manager</option>
                    <option value="Department Staff">Department Staff</option>
                    <option value="Department Head / Director">Department Head / Director</option>
                    <option value="System Administrator">System Administrator</option>
                    <option value="Operations Manager">Operations Manager</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Department</label>
                  <select value={deptId} onChange={(e) => setDeptId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>Save User</button>
              </form>
            )}

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700 }}>#{u.id}</td>
                      <td>{u.full_name}</td>
                      <td>{u.email}</td>
                      <td><span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>{u.role}</span></td>
                      <td>{u.department_name} ({u.department_code})</td>
                      <td><span className="badge badge-approved">{u.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
