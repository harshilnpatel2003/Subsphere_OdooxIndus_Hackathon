'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import withAuth from '@/components/withAuth';
import { formatDate } from '@/lib/formatters';

function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userSubs, setUserSubs] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users/')
      .then(res => {
        setUsers(Array.isArray(res.data) ? res.data : res.data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const openProfile = async (u: any) => {
    setSelectedUser(u);
    setUserSubs([]);
    setSubsLoading(true);
    try {
      const res = await api.get(`/subscriptions/?customer=${u.id}`);
      setUserSubs(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch { /* no subs */ }
    setSubsLoading(false);
  };

  const doAction = async (id: number, action: string, label: string) => {
    if (!window.confirm(`${label}?`)) return;
    setActionLoading(action + id);
    try {
      await api.post(`/users/${id}/${action}/`);
      fetchUsers();
      if (selectedUser?.id === id) {
        const res = await api.get('/users/');
        const updated = (Array.isArray(res.data) ? res.data : res.data.results || []).find((u: any) => u.id === id);
        if (updated) setSelectedUser(updated);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Action failed');
    }
    setActionLoading('');
  };

  const roleColor: Record<string, string> = {
    admin: '#4f46e5',
    manager: '#0891b2',
    portal_user: '#64748b',
  };

  const statusColor: Record<string, string> = {
    active: '#059669',
    cancelled: '#dc2626',
    draft: '#64748b',
    confirmed: '#2563eb',
    closed: '#9f1239',
  };

  return (
    <DashboardLayout title="Users Administration" subtitle="Manage enterprise users and roles">
      <div className="card">
        {loading ? (
          <p style={{ padding: 20, color: 'var(--on-surface-variant)' }}>Loading users...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--surface-container-highest)' }}>
                  {['Name', 'Email', 'Role', 'Active Subs', 'Manager Request', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', color: 'var(--on-surface-variant)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr
                    key={u.id}
                    style={{ borderBottom: '1px solid var(--surface-container)', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-container-lowest)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    onClick={() => openProfile(u)}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--on-surface)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: roleColor[u.role] || '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                          {(u.first_name || u.email).charAt(0).toUpperCase()}
                        </div>
                        {u.first_name} {u.last_name}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, background: `${roleColor[u.role]}22`, color: roleColor[u.role] || '#64748b' }}>
                        {u.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: u.active_subscriptions > 0 ? '#059669' : 'var(--on-surface-variant)' }}>
                        {u.active_subscriptions ?? 0}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.manager_request_pending
                        ? <span style={{ color: '#d97706', fontSize: '0.8rem', fontWeight: 600 }}>⏳ Pending</span>
                        : <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>{formatDate(u.created_at)}</td>
                    <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {u.manager_request_pending && (
                          <>
                            <button onClick={() => doAction(u.id, 'approve-manager', 'Approve as Manager')}
                              disabled={!!actionLoading}
                              style={{ padding: '4px 10px', background: '#059669', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                              ✓ Approve
                            </button>
                            <button onClick={() => doAction(u.id, 'reject-manager', 'Reject Manager Request')}
                              disabled={!!actionLoading}
                              style={{ padding: '4px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                              ✗ Reject
                            </button>
                          </>
                        )}
                        {(u.role === 'manager' || u.role === 'internal_user') && (
                          <button onClick={() => doAction(u.id, 'revoke-manager', 'Revoke Manager role (back to Customer)')}
                            disabled={!!actionLoading}
                            style={{ padding: '4px 10px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                            ↩ Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p style={{ textAlign: 'center', padding: 40, color: 'var(--on-surface-variant)' }}>No users found.</p>}
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}
          onClick={() => setSelectedUser(null)}>
          <div style={{ width: 480, height: '100vh', background: 'var(--surface)', overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.2)', padding: 32 }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: roleColor[selectedUser.role] || '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 22 }}>
                  {(selectedUser.first_name || selectedUser.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--on-surface)' }}>{selectedUser.first_name} {selectedUser.last_name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{selectedUser.email}</div>
                  <span style={{ marginTop: 4, display: 'inline-block', padding: '2px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, background: `${roleColor[selectedUser.role]}22`, color: roleColor[selectedUser.role] }}>
                    {selectedUser.role.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: 'var(--on-surface-variant)' }}>✕</button>
            </div>

            {/* Profile Details */}
            <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)' }}>Profile Details</div>
              {[
                ['Phone', selectedUser.phone || '—'],
                ['Member Since', formatDate(selectedUser.created_at)],
                ['Manager Request', selectedUser.manager_request_pending ? '⏳ Pending' : '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--surface-container)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{label}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--on-surface)' }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 600, marginBottom: 10, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)' }}>Actions</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selectedUser.manager_request_pending && (
                  <>
                    <button onClick={() => doAction(selectedUser.id, 'approve-manager', 'Approve as Manager')}
                      disabled={!!actionLoading}
                      style={{ padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                      ✓ Approve Manager
                    </button>
                    <button onClick={() => doAction(selectedUser.id, 'reject-manager', 'Reject Manager Request')}
                      disabled={!!actionLoading}
                      style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                      ✗ Reject Request
                    </button>
                  </>
                )}
                {(selectedUser.role === 'manager' || selectedUser.role === 'internal_user') && (
                  <button onClick={() => doAction(selectedUser.id, 'revoke-manager', 'Revoke Manager role')}
                    disabled={!!actionLoading}
                    style={{ padding: '8px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                    ↩ Revoke Manager
                  </button>
                )}
                {!selectedUser.manager_request_pending && selectedUser.role === 'portal_user' && (
                  <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', padding: '8px 0' }}>No pending actions</span>
                )}
              </div>
            </div>

            {/* Subscriptions */}
            <div>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)' }}>
                Subscriptions {!subsLoading && `(${userSubs.length})`}
              </div>
              {subsLoading ? (
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>Loading...</p>
              ) : userSubs.length === 0 ? (
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>No subscriptions found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {userSubs.map((s: any) => (
                    <div key={s.id} style={{ padding: 12, background: 'var(--surface-container-lowest)', borderRadius: 8, border: '1px solid var(--surface-container)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--on-surface)' }}>{s.subscription_number}</span>
                        <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, background: `${statusColor[s.status] || '#64748b'}22`, color: statusColor[s.status] || '#64748b' }}>
                          {s.status?.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ marginTop: 4, fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                        Start: {s.start_date} {s.expiration_date ? `· Expires: ${s.expiration_date}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default withAuth(UsersPage);
