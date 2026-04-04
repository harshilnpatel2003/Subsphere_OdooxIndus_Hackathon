'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import PortalNav from '@/components/PortalNav';
import { formatDate } from '@/lib/formatters';
import withAuth from '@/components/withAuth';

function AccountPage() {
  const [profile, setProfile] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [subCount, setSubCount] = useState(0);
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
    Promise.all([
      api.get('/users/me/'),
      api.get('/subscriptions/?customer=me') // Fetching to count for demo
    ]).then(([meRes, subsRes]) => {
      setProfile(meRes.data);
      setFirstName(meRes.data.first_name || '');
      setLastName(meRes.data.last_name || '');
      setPhone(meRes.data.phone || '');
      setSubCount(subsRes.data.length);
      setLoading(false);
    }).catch(err => {
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
      setMsg('✓ Profile updated successfully');
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
      setPwMsg('✓ Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwError(err.response?.data?.error || 'Failed to change password');
    }
  };

  if (loading) return <div><PortalNav /><div style={{padding:'20px'}}>Loading...</div></div>;

  return (
    <div>
      <PortalNav />
      <div style={{padding:'20px', maxWidth:'800px', margin:'0 auto'}}>
        <h1>My Account</h1>
        
        <div style={{display:'flex', gap:'40px', marginTop:'30px'}}>
          <div style={{flex: 1}}>
             <form onSubmit={handleUpdateProfile} style={{padding:'20px', border:'1px solid #ddd', borderRadius:'8px'}}>
                <h3>Profile Information</h3>
                <div style={{marginTop:'15px'}}>
                  <label style={{display:'block', marginBottom:'5px'}}>Email Address:</label>
                  <input type="email" value={profile.email} disabled style={{width:'100%', padding:'10px', background:'#f5f5f5'}} />
                  <p style={{fontSize:'0.8em', color:'#888', marginTop:'5px'}}>Email cannot be changed.</p>
                </div>
                
                <div style={{marginTop:'15px', display:'flex', gap:'10px'}}>
                  <div style={{flex:1}}>
                    <label style={{display:'block', marginBottom:'5px'}}>First Name:</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} style={{width:'100%', padding:'10px'}} />
                  </div>
                  <div style={{flex:1}}>
                    <label style={{display:'block', marginBottom:'5px'}}>Last Name:</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} style={{width:'100%', padding:'10px'}} />
                  </div>
                </div>

                <div style={{marginTop:'15px'}}>
                  <label style={{display:'block', marginBottom:'5px'}}>Phone Number:</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={{width:'100%', padding:'10px'}} />
                </div>
                
                <button type="submit" style={{width:'100%', padding:'12px', background:'#0070f3', color:'#fff', border:'none', borderRadius:'4px', marginTop:'20px', cursor:'pointer', fontWeight:'bold'}}>
                  Save Changes
                </button>
                
                {msg && <p style={{color:'green', fontWeight:'bold', marginTop:'10px', textAlign:'center'}}>{msg}</p>}
                {error && <p style={{color:'red', marginTop:'10px', textAlign:'center'}}>{error}</p>}
             </form>
          </div>

          <div style={{flex: 1}}>
             <div style={{padding:'20px', border:'1px solid #ddd', borderRadius:'8px', marginBottom:'20px'}}>
                <h3>Account Summary</h3>
                <p><strong>Account Type:</strong> {profile.role.replace('_', ' ').toUpperCase()}</p>
                <p><strong>Member Since:</strong> {formatDate(profile.created_at)}</p>
                <p><strong>Active Subscriptions:</strong> {subCount}</p>

                {profile.role === 'portal_user' && !profile.manager_request_pending && (
                  <button 
                    onClick={async () => {
                      if(window.confirm('Are you sure you want to request the Manager role?')) {
                        try {
                          await api.post('/users/me/request-manager/');
                          setProfile({...profile, manager_request_pending: true});
                          alert('Manager role requested successfully.');
                        } catch(err) {
                          alert('Failed to request manager role.');
                        }
                      }
                    }}
                    style={{marginTop: '15px', padding: '10px 15px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}
                  >
                    Request Manager Role
                  </button>
                )}
                {profile.manager_request_pending && (
                  <p style={{marginTop: '15px', color: '#888', fontWeight: 'bold'}}>
                    Manager Role Requested (Pending Approval)
                  </p>
                )}
             </div>

             <form onSubmit={handleChangePassword} style={{padding:'20px', border:'1px solid #ddd', borderRadius:'8px'}}>
                <h3>Change Password</h3>
                <div style={{marginTop:'15px'}}>
                  <label style={{display:'block', marginBottom:'5px'}}>Current Password:</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={{width:'100%', padding:'10px'}} required />
                </div>
                <div style={{marginTop:'15px'}}>
                  <label style={{display:'block', marginBottom:'5px'}}>New Password:</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{width:'100%', padding:'10px'}} required />
                </div>
                <div style={{marginTop:'15px'}}>
                  <label style={{display:'block', marginBottom:'5px'}}>Confirm New Password:</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{width:'100%', padding:'10px'}} required />
                </div>
                
                <button type="submit" style={{width:'100%', padding:'12px', background:'#6c757d', color:'#fff', border:'none', borderRadius:'4px', marginTop:'20px', cursor:'pointer', fontWeight:'bold'}}>
                  Update Password
                </button>
                
                {pwMsg && <p style={{color:'green', fontWeight:'bold', marginTop:'10px', textAlign:'center'}}>{pwMsg}</p>}
                {pwError && <p style={{color:'red', marginTop:'10px', textAlign:'center'}}>{pwError}</p>}
             </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AccountPage);
