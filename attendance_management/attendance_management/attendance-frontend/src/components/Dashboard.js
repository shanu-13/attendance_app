import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchAttendanceStatus();
    fetchTodayAttendance();
    fetchLeaveBalance();
    fetchNotifications();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchAttendanceStatus = async () => {
    try {
      const response = await attendanceAPI.getAttendanceStatus();
      setAttendanceStatus(response.data);
    } catch (error) {
      console.error('Error fetching attendance status:', error);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await attendanceAPI.getTodayAttendance();
      setTodayAttendance(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const response = await attendanceAPI.getLeaveBalance();
      setLeaveBalance(response.data);
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await attendanceAPI.getNotifications();
      setNotifications(response.data.slice(0, 3)); // Show only latest 3
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    try {
      await attendanceAPI.clockIn();
      toast.success('Clocked in successfully!');
      fetchAttendanceStatus();
      fetchTodayAttendance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Clock in failed');
    }
    setLoading(false);
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      await attendanceAPI.clockOut();
      toast.success('Clocked out successfully!');
      fetchAttendanceStatus();
      fetchTodayAttendance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Clock out failed');
    }
    setLoading(false);
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave_approved':
        return '✅';
      case 'leave_rejected':
        return '❌';
      default:
        return '📢';
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="card" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', marginBottom: '30px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1 style={{fontSize: '28px', fontWeight: '700', marginBottom: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p style={{color: 'rgba(255,255,255,0.9)', fontSize: '16px'}}>{formatDate(currentTime)}</p>
            <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginTop: '4px'}}>
              {isAdmin ? 'Administrator Dashboard' : 'Employee Portal'}
            </p>
          </div>
          <div className="text-center">
            <div style={{fontSize: '36px', fontWeight: '700', fontFamily: 'monospace', textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>
              {formatTime(currentTime)}
            </div>
            <p style={{fontSize: '14px', color: 'rgba(255,255,255,0.9)'}}>Current Time</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4">
        <div className="card">
          <h3 className="font-bold mb-4" style={{color: '#111827'}}>Today's Attendance</h3>
          <div>
            {attendanceStatus?.is_clocked_in ? (
              <div>
                <div style={{marginBottom: '12px'}}>
                  <p style={{fontSize: '14px', color: '#6b7280'}}>Currently Clocked In</p>
                  <p className="font-bold text-green">
                    {attendanceStatus.active_session ? 
                      new Date(attendanceStatus.active_session.clock_in).toLocaleTimeString() : 'N/A'}
                  </p>
                </div>
                <button
                  onClick={handleClockOut}
                  disabled={loading}
                  className="btn btn-danger"
                  style={{width: '100%'}}
                >
                  {loading ? 'Processing...' : 'Clock Out'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleClockIn}
                disabled={loading}
                className="btn btn-success"
                style={{width: '100%', marginBottom: '12px'}}
              >
                {loading ? 'Processing...' : 'Clock In'}
              </button>
            )}
            
            {todayAttendance.length > 0 && (
              <div style={{marginTop: '16px', fontSize: '12px', color: '#6b7280'}}>
                <p>Sessions today: {todayAttendance.length}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold mb-4" style={{color: '#111827'}}>Working Hours</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue">
              {todayAttendance.reduce((total, record) => total + parseFloat(record.total_hours || 0), 0).toFixed(2)}
            </div>
            <p style={{fontSize: '14px', color: '#6b7280'}}>Hours Today</p>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold mb-4" style={{color: '#111827'}}>Leave Balance</h3>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{color: '#f59e0b'}}>
              {leaveBalance?.remaining_leaves || 0}
            </div>
            <p style={{fontSize: '14px', color: '#6b7280'}}>Days Remaining</p>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold mb-4" style={{color: '#111827'}}>Status</h3>
          <div className="text-center">
            <div style={{
              display: 'inline-flex',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: attendanceStatus?.is_clocked_in ? '#d1fae5' : '#f3f4f6',
              color: attendanceStatus?.is_clocked_in ? '#065f46' : '#374151'
            }}>
              {attendanceStatus?.is_clocked_in ? 'Clocked In' : 'Not Clocked In'}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      {!isAdmin && (
        <div className="card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
            <h3 className="font-bold" style={{color: '#111827'}}>Recent Notifications</h3>
            <button 
              onClick={() => window.location.href = '/notifications'}
              style={{fontSize: '12px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer'}}
            >
              View All
            </button>
          </div>
          {notifications.length === 0 ? (
            <p style={{color: '#6b7280', fontSize: '14px'}}>No new notifications</p>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div key={notification.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px',
                  marginBottom: '8px',
                  backgroundColor: notification.is_read ? '#f9fafb' : '#eff6ff',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <span style={{fontSize: '16px'}}>{getNotificationIcon(notification.notification_type)}</span>
                  <div style={{flex: 1}}>
                    <p style={{margin: 0, fontSize: '13px', fontWeight: '500'}}>{notification.title}</p>
                    <p style={{margin: 0, fontSize: '12px', color: '#6b7280'}}>{notification.message}</p>
                  </div>
                  {!notification.is_read && (
                    <div style={{width: '6px', height: '6px', backgroundColor: '#3b82f6', borderRadius: '50%'}}></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Professional Details */}
      <div className="card">
        <h3 className="font-bold mb-4" style={{color: '#111827'}}>Professional Details</h3>
        <div className="grid grid-cols-3">
          <div>
            <p style={{fontSize: '14px', color: '#6b7280'}}>Employee ID</p>
            <p className="font-bold">{user?.employee_id || 'N/A'}</p>
          </div>
          <div>
            <p style={{fontSize: '14px', color: '#6b7280'}}>Project</p>
            <p className="font-bold">{user?.project || 'N/A'}</p>
          </div>
          <div>
            <p style={{fontSize: '14px', color: '#6b7280'}}>Designation</p>
            <p className="font-bold">{user?.designation || 'N/A'}</p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="card">
          <h3 className="font-bold mb-4" style={{color: '#111827'}}>Admin Quick Actions</h3>
          <div className="grid grid-cols-2">
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/admin/employees'}
            >
              View All Employees
            </button>
            <button 
              className="btn btn-success"
              onClick={() => window.location.href = '/admin/reports'}
            >
              Generate Reports
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;