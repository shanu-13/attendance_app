import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import toast from 'react-hot-toast';

const EmployeeLeaveManagement = () => {
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [leaveRequest, setLeaveRequest] = useState({
    leave_type: 'full_day',
    start_date: '',
    end_date: '',
    half_day_period: '',
    custom_start_time: '',
    custom_end_time: '',
    reason: '',
    medical_certificate: null
  });

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const response = await attendanceAPI.getLeaveBalance();
      setLeaveBalance(response.data);
    } catch (error) {
      toast.error('Failed to fetch leave balance');
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(leaveRequest).forEach(key => {
        if (leaveRequest[key] !== null && leaveRequest[key] !== '') {
          formData.append(key, leaveRequest[key]);
        }
      });

      await attendanceAPI.requestLeave(formData);
      toast.success('Leave request submitted successfully!');
      setShowRequestForm(false);
      setLeaveRequest({
        leave_type: 'full_day',
        start_date: '',
        end_date: '',
        half_day_period: '',
        custom_start_time: '',
        custom_end_time: '',
        reason: '',
        medical_certificate: null
      });
      fetchLeaveBalance();
    } catch (error) {
      toast.error('Failed to submit leave request');
    }
  };

  const handleLeaveTypeChange = (type) => {
    setLeaveRequest({
      ...leaveRequest,
      leave_type: type,
      start_date: '',
      end_date: '',
      half_day_period: '',
      custom_start_time: '',
      custom_end_time: '',
      medical_certificate: null
    });
  };

  const renderDateFields = () => {
    switch (leaveRequest.leave_type) {
      case 'full_day':
        return (
          <div>
            <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>
              Select Date *
            </label>
            <input
              type="date"
              className="form-input"
              value={leaveRequest.start_date}
              onChange={(e) => setLeaveRequest({
                ...leaveRequest, 
                start_date: e.target.value,
                end_date: e.target.value
              })}
              required
            />
          </div>
        );
      
      case 'half_day':
        return (
          <>
            <div>
              <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>
                Select Date *
              </label>
              <input
                type="date"
                className="form-input"
                value={leaveRequest.start_date}
                onChange={(e) => setLeaveRequest({
                  ...leaveRequest, 
                  start_date: e.target.value,
                  end_date: e.target.value
                })}
                required
              />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>
                Time Period *
              </label>
              <select
                className="form-input"
                value={leaveRequest.half_day_period}
                onChange={(e) => setLeaveRequest({...leaveRequest, half_day_period: e.target.value})}
                required
              >
                <option value="">Select Period</option>
                <option value="morning">Morning (9 AM - 1 PM)</option>
                <option value="afternoon">Afternoon (1 PM - 5 PM)</option>
                <option value="custom">Custom Time</option>
              </select>
            </div>
            {leaveRequest.half_day_period === 'custom' && (
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>
                    Start Time *
                  </label>
                  <input
                    type="time"
                    className="form-input"
                    value={leaveRequest.custom_start_time}
                    onChange={(e) => setLeaveRequest({...leaveRequest, custom_start_time: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>
                    End Time *
                  </label>
                  <input
                    type="time"
                    className="form-input"
                    value={leaveRequest.custom_end_time}
                    onChange={(e) => setLeaveRequest({...leaveRequest, custom_end_time: e.target.value})}
                    required
                  />
                </div>
              </div>
            )}
          </>
        );
      
      case 'sick':
        return (
          <>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>
                  Start Date *
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={leaveRequest.start_date}
                  onChange={(e) => setLeaveRequest({...leaveRequest, start_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>
                  End Date *
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={leaveRequest.end_date}
                  onChange={(e) => setLeaveRequest({...leaveRequest, end_date: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>
                Medical Certificate (Optional)
              </label>
              <input
                type="file"
                className="form-input"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setLeaveRequest({...leaveRequest, medical_certificate: e.target.files[0]})}
              />
              <p style={{fontSize: '12px', color: '#6b7280', marginTop: '4px'}}>
                Upload medical certificate (PDF, JPG, PNG)
              </p>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
          <h1 className="text-2xl font-bold" style={{color: '#111827'}}>Leave Management</h1>
          <button
            onClick={() => setShowRequestForm(true)}
            className="btn btn-primary"
          >
            Request Leave
          </button>
        </div>

        {/* Leave Balance */}
        <div style={{display: 'flex', gap: '16px', marginBottom: '24px'}}>
          <div style={{backgroundColor: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1, textAlign: 'center'}}>
            <div className="text-2xl font-bold text-blue">{leaveBalance?.total_allowed || 4}</div>
            <p style={{fontSize: '12px', color: '#6b7280'}}>Total Allowed</p>
          </div>
          <div style={{backgroundColor: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1, textAlign: 'center'}}>
            <div className="text-2xl font-bold text-red">{leaveBalance?.used_leaves || 0}</div>
            <p style={{fontSize: '12px', color: '#6b7280'}}>Used Leaves</p>
          </div>
          <div style={{backgroundColor: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1, textAlign: 'center'}}>
            <div className="text-2xl font-bold text-green">{leaveBalance?.remaining_leaves || 4}</div>
            <p style={{fontSize: '12px', color: '#6b7280'}}>Remaining</p>
          </div>
        </div>

        {/* Calendar View */}
        <div className="card">
          <h3 className="font-bold mb-4" style={{color: '#111827'}}>Monthly Calendar</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            textAlign: 'center'
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{
                padding: '8px',
                fontWeight: 'bold',
                backgroundColor: '#f3f4f6',
                color: '#374151'
              }}>
                {day}
              </div>
            ))}
            {Array.from({length: 30}, (_, i) => (
              <div key={i} style={{
                padding: '12px',
                border: '1px solid #e5e7eb',
                backgroundColor: Math.random() > 0.8 ? '#fee2e2' : 'white',
                color: Math.random() > 0.8 ? '#991b1b' : '#374151'
              }}>
                {i + 1}
              </div>
            ))}
          </div>
          <p style={{fontSize: '12px', color: '#6b7280', marginTop: '12px'}}>
            Red dates indicate leave days
          </p>
        </div>
      </div>

      {/* Leave Request Modal */}
      {showRequestForm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{width: '500px'}}>
            <h2 className="text-2xl font-bold mb-4" style={{color: '#111827'}}>Request Leave</h2>
            <form onSubmit={handleSubmitLeave}>
              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>
                  Leave Type *
                </label>
                <select
                  className="form-input"
                  value={leaveRequest.leave_type}
                  onChange={(e) => handleLeaveTypeChange(e.target.value)}
                  required
                >
                  <option value="full_day">Full Day</option>
                  <option value="half_day">Half Day</option>
                  <option value="sick">Sick Leave</option>
                </select>
              </div>
              
              {/* Dynamic Date Fields */}
              <div style={{marginBottom: '16px'}}>
                {renderDateFields()}
              </div>
              
              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500'}}>
                  Reason *
                </label>
                <textarea
                  className="form-input"
                  placeholder="Reason for leave"
                  value={leaveRequest.reason}
                  onChange={(e) => setLeaveRequest({...leaveRequest, reason: e.target.value})}
                  rows="3"
                  required
                ></textarea>
              </div>
              
              <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
                <button type="submit" className="btn btn-primary">Submit Request</button>
                <button 
                  type="button" 
                  onClick={() => setShowRequestForm(false)}
                  className="btn"
                  style={{backgroundColor: '#6b7280', color: 'white'}}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaveManagement;
