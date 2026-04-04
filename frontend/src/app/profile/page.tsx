'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { formatDate } from '@/lib/formatters';
import withAuth from '@/components/withAuth';

function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    api.get('/users/me/')
      .then(res => {
        setProfile(res.data);
        setFirstName(res.data.first_name || '');
        setLastName(res.data.last_name || '');
        setPhone(res.data.phone || '');
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      await api.patch('/users/me/', {
        first_name: firstName,
        last_name: lastName,
        phone: phone
      });
      setMsg('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg('');
    setPwError('');
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    try {
      await api.post('/auth/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmPassword
      });
      setPwMsg('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwError(err.response?.data?.error || 'Failed to change password');
    }
  };

  if (loading) return <DashboardLayout title="Profile" subtitle="Loading..."><div className="card">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your account information and security">
      <div style={{display:'flex', gap:'20px', flexDirection:'column'}}>
        <div style={{display:'flex', gap:'20px'}}>
          <div className="card" style={{flex: 1}}>
             <form onSubmit={handleUpdateProfile}>
                <h3 style={{fontSize: '1.1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '20px'}}>Profile Information</h3>
                
                <div style={{marginBottom:'15px'}}>
                  <label style={{display:'block', marginBottom:'5px', fontSize: '0.875rem', color: 'var(--on-surface-variant)'}}>Email Address</label>
                  <input type="email" value={profile.email} disabled style={{width:'100%', padding:'10px', background:'var(--surface-container-highest)', border: 'none', borderRadius: '4px', color: 'var(--on-surface-variant)'}} />
                </div>
                
                <div style={{marginBottom:'15px', display:'flex', gap:'10px'}}>
                  <div style={{flex:1}}>
                    <label style={{display:'block', marginBottom:'5px', fontSize: '0.875rem', color: 'var(--on-surface-variant)'}}>First Name</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} style={{width:'100%', padding:'10px', background:'var(--surface-container)', border: '1px solid var(--outline)', borderRadius: '4px', color: 'var(--on-surface)'}} />
                  </div>
                  <div style={{flex:1}}>
                    <label style={{display:'block', marginBottom:'5px', fontSize: '0.875rem', color: 'var(--on-surface-variant)'}}>Last Name</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} style={{width:'100%', padding:'10px', background:'var(--surface-container)', border: '1px solid var(--outline)', borderRadius: '4px', color: 'var(--on-surface)'}} />
                  </div>
                </div>

                <div style={{marginBottom:'20px'}}>
                  <label style={{display:'block', marginBottom:'5px', fontSize: '0.875rem', color: 'var(--on-surface-variant)'}}>Phone Number</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={{width:'100%', padding:'10px', background:'var(--surface-container)', border: '1px solid var(--outline)', borderRadius: '4px', color: 'var(--on-surface)'}} />
                </div>
                
                <button type="submit" style={{width:'100%', padding:'10px', background:'var(--primary)', color:'var(--on-primary)', border:'none', borderRadius:'4px', cursor:'pointer', fontWeight:600}}>
                  Save Changes
                </button>
                
                {msg && <p style={{color:'var(--primary)', fontWeight:600, marginTop:'10px', fontSize: '0.875rem'}}>{msg}</p>}
                {error && <p style={{color:'var(--error)', marginTop:'10px', fontSize: '0.875rem'}}>{error}</p>}
             </form>
          </div>

          <div className="card" style={{flex: 1}}>
             <h3 style={{fontSize: '1.1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '20px'}}>Account Summary</h3>
             <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{color: 'var(--on-surface-variant)'}}>Role</span>
                  <span className={`badge badge-${profile.role === 'admin' ? 'active' : profile.role === 'internal_user' ? 'pending' : 'cancelled'}`}>{profile.role.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{color: 'var(--on-surface-variant)'}}>Member Since</span>
                  <span style={{color: 'var(--on-surface)', fontWeight: 500}}>{formatDate(profile.created_at)}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="card">
           <form onSubmit={handleChangePassword}>
              <h3 style={{fontSize: '1.1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '20px'}}>Security Settings</h3>
              
              <div style={{marginBottom:'15px', maxWidth: '400px'}}>
                <label style={{display:'block', marginBottom:'5px', fontSize: '0.875rem', color: 'var(--on-surface-variant)'}}>Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={{width:'100%', padding:'10px', background:'var(--surface-container)', border: '1px solid var(--outline)', borderRadius: '4px', color: 'var(--on-surface)'}} required />
              </div>
              <div style={{marginBottom:'15px', maxWidth: '400px'}}>
                <label style={{display:'block', marginBottom:'5px', fontSize: '0.875rem', color: 'var(--on-surface-variant)'}}>New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{width:'100%', padding:'10px', background:'var(--surface-container)', border: '1px solid var(--outline)', borderRadius: '4px', color: 'var(--on-surface)'}} required />
              </div>
              <div style={{marginBottom:'20px', maxWidth: '400px'}}>
                <label style={{display:'block', marginBottom:'5px', fontSize: '0.875rem', color: 'var(--on-surface-variant)'}}>Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{width:'100%', padding:'10px', background:'var(--surface-container)', border: '1px solid var(--outline)', borderRadius: '4px', color: 'var(--on-surface)'}} required />
              </div>
              
              <button type="submit" style={{width:'100%', maxWidth: '400px', padding:'10px', background:'var(--surface-container-highest)', color:'var(--on-surface)', border:'1px solid var(--outline)', borderRadius:'4px', cursor:'pointer', fontWeight:600}}>
                Update Password
              </button>
              
              {pwMsg && <p style={{color:'var(--primary)', fontWeight:600, marginTop:'10px', fontSize: '0.875rem'}}>{pwMsg}</p>}
              {pwError && <p style={{color:'var(--error)', marginTop:'10px', fontSize: '0.875rem'}}>{pwError}</p>}
           </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(ProfilePage);
