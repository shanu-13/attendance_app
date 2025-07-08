import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import '../styles/Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [role, setRole] = useState('employee'); // toggle between 'employee' and 'hr'
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const fetchOrganization = useCallback(async (orgId) => {
    try {
      const response = await api.get('/organizations/list/');
      const org = response.data.find(o => o.id.toString() === orgId);
      setOrganization(org);
    } catch (error) {
      console.error('Error fetching organization:', error);
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const selectedOrgId = localStorage.getItem('selectedOrganization');
    if (!selectedOrgId) {
      navigate('/');
      return;
    }
    fetchOrganization(selectedOrgId);
  }, [navigate, fetchOrganization]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(credentials.username, credentials.password, role);

    if (result.success) {
      toast.success(`${role === 'employee' ? 'Employee' : 'HR'} login successful!`);
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login failed');
    }
    setLoading(false);
  };

  const handleBack = () => {
    localStorage.removeItem('selectedOrganization');
    navigate('/');
  };

  if (!organization) {
    return (
      <div className="login-page-container employee-bg">
        <div className="login-card">
          <p>Loading organization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`login-page-container ${role === 'employee' ? 'employee-bg' : 'hr-bg'}`}>
      <div className="login-card">
          {organization.logo && (
            <img src={organization.logo} alt={organization.name} className="login-logo" />
          )}
          <h2 className="login-title">{role === 'employee' ? 'Employee Login' : 'HR Login'}</h2>
          <p className="login-subtitle">{organization.name}</p>

          {/* Toggle Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <button
              onClick={() => setRole('employee')}
              style={{
                padding: '0.5rem 1rem',
                marginRight: '0.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                background: role === 'employee' ? '#4f46e5' : '#e5e7eb',
                color: role === 'employee' ? '#fff' : '#000'
              }}
            >
              Employee
            </button>
            <button
              onClick={() => setRole('hr')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                background: role === 'hr' ? '#22c55e' : '#e5e7eb',
                color: role === 'hr' ? '#fff' : '#000'
              }}
            >
              HR
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              className="login-input"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="login-input"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
            <button
              type="submit"
              className={`login-button ${role === 'hr' ? 'hr' : ''}`}
              disabled={loading}
            >
              {loading ? 'Signing in...' : `Sign in as ${role === 'employee' ? 'Employee' : 'HR'}`}
            </button>
          </form>
          <div className="back-button" onClick={handleBack}>
            Back to Organizations
          </div>
        </div>
    </div>
  );
};

export default Login;

