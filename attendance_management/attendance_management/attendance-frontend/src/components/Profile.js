import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ChangePassword from './ChangePassword';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const result = await updateProfile(profileData);
    if (result.success) {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } else {
      toast.error('Failed to update profile');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) return;
    
    const formData = new FormData();
    formData.append('profile_picture', selectedPhoto);
    
    const result = await updateProfile(formData, true);
    if (result.success) {
      toast.success('Photo updated successfully!');
      setSelectedPhoto(null);
      setPhotoPreview(null);
    } else {
      toast.error('Failed to update photo');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{borderBottom: '2px solid #e5e7eb', paddingBottom: '20px', marginBottom: '30px'}}>
          <h1 className="text-2xl font-bold" style={{color: '#1f2937', marginBottom: '8px'}}>Employee Profile</h1>
          <p style={{color: '#6b7280', fontSize: '14px'}}>Manage your personal and professional information</p>
        </div>
        
        <div style={{display: 'flex', gap: '40px', alignItems: 'flex-start'}}>
          {/* Profile Picture */}
          <div style={{textAlign: 'center', minWidth: '200px'}}>
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '12px',
              margin: '0 auto 20px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {photoPreview || user?.profile_picture ? (
                <img 
                  src={photoPreview || user.profile_picture} 
                  alt="Profile" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '56px',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                </div>
              )}
            </div>
            <div style={{marginBottom: '16px'}}>
              <h3 style={{fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0'}}>
                {user?.first_name} {user?.last_name}
              </h3>
              <p style={{fontSize: '14px', color: '#6b7280', margin: '4px 0'}}>{user?.designation || 'Employee'}</p>
              <p style={{fontSize: '12px', color: '#9ca3af'}}>{user?.department || 'Department'}</p>
            </div>
            <div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoChange}
                style={{display: 'none'}}
                id="photo-upload"
              />
              <label 
                htmlFor="photo-upload"
                className="btn btn-primary" 
                style={{fontSize: '14px', padding: '8px 16px', cursor: 'pointer', marginRight: '8px'}}
              >
                Choose Photo
              </label>
              {selectedPhoto && (
                <button 
                  onClick={handlePhotoUpload}
                  className="btn btn-success" 
                  style={{fontSize: '14px', padding: '8px 16px'}}
                >
                  Upload
                </button>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div style={{flex: 1}}>
            <div style={{backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px', marginBottom: '24px'}}>
              <h4 style={{fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px'}}>Personal Information</h4>
              {isEditing ? (
                <form onSubmit={handleUpdateProfile}>
                  <div className="grid grid-cols-2" style={{gap: '16px'}}>
                    <div>
                      <label style={{display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px', fontWeight: '500'}}>First Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileData.first_name}
                        onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                        style={{backgroundColor: 'white'}}
                      />
                    </div>
                    <div>
                      <label style={{display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px', fontWeight: '500'}}>Last Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileData.last_name}
                        onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                        style={{backgroundColor: 'white'}}
                      />
                    </div>
                  </div>
                  <div style={{marginTop: '16px'}}>
                    <label style={{display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px', fontWeight: '500'}}>Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      style={{backgroundColor: 'white', width: '50%'}}
                    />
                  </div>
                  <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
                    <button type="submit" className="btn btn-success">Save Changes</button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="btn"
                      style={{backgroundColor: '#6b7280', color: 'white'}}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="grid grid-cols-2" style={{gap: '20px', marginBottom: '20px'}}>
                    <div>
                      <label style={{fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Full Name</label>
                      <p style={{fontSize: '16px', fontWeight: '500', color: '#1f2937', margin: '4px 0'}}>{user?.first_name} {user?.last_name}</p>
                    </div>
                    <div>
                      <label style={{fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Email Address</label>
                      <p style={{fontSize: '16px', fontWeight: '500', color: '#1f2937', margin: '4px 0'}}>{user?.email}</p>
                    </div>
                    <div>
                      <label style={{fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Phone Number</label>
                      <p style={{fontSize: '16px', fontWeight: '500', color: '#1f2937', margin: '4px 0'}}>{user?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div style={{display: 'flex', gap: '12px'}}>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="btn btn-primary"
                    >
                      Edit Information
                    </button>
                    <button 
                      onClick={() => setShowChangePassword(true)}
                      className="btn"
                      style={{backgroundColor: '#dc2626', color: 'white'}}
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Professional Details */}
            <div style={{backgroundColor: '#f1f5f9', padding: '24px', borderRadius: '8px'}}>
              <h4 style={{fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px'}}>Organization Information</h4>
              <div className="grid grid-cols-2" style={{gap: '20px'}}>
                <div>
                  <label style={{fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Employee ID</label>
                  <p style={{fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '4px 0', fontFamily: 'monospace'}}>{user?.employee_id || 'Not Assigned'}</p>
                </div>
                <div>
                  <label style={{fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Department</label>
                  <p style={{fontSize: '16px', fontWeight: '500', color: '#1f2937', margin: '4px 0'}}>{user?.department || 'Not Assigned'}</p>
                </div>
                <div>
                  <label style={{fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Job Title</label>
                  <p style={{fontSize: '16px', fontWeight: '500', color: '#1f2937', margin: '4px 0'}}>{user?.designation || 'Not Assigned'}</p>
                </div>
                <div>
                  <label style={{fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Date Joined</label>
                  <p style={{fontSize: '16px', fontWeight: '500', color: '#1f2937', margin: '4px 0'}}>{user?.date_joined_company || 'Not Available'}</p>
                </div>
                <div>
                  <label style={{fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Role</label>
                  <p style={{fontSize: '16px', fontWeight: '500', color: '#1f2937', margin: '4px 0', textTransform: 'capitalize'}}>{user?.role}</p>
                </div>
                <div>
                  <label style={{fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Account Status</label>
                  <div style={{marginTop: '4px'}}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: user?.is_active ? '#dcfce7' : '#fee2e2',
                      color: user?.is_active ? '#166534' : '#991b1b'
                    }}>
                      {user?.is_active ? 'Active Employee' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
};

export default Profile;