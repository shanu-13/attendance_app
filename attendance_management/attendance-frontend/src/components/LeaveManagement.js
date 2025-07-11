import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import toast from 'react-hot-toast';

const LeaveManagement = () => {
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
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
    fetchLeaveHistory();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const response = await attendanceAPI.getLeaveBalance();
      setLeaveBalance(response.data);
    } catch (error) {
      toast.error('Failed to fetch leave balance');
    }
  };

  const fetchLeaveHistory = async () => {
    try {
      const response = await attendanceAPI.getLeaveRequests();
      setLeaveHistory(response.data || []);
    } catch (error) {
      console.error('Failed to fetch leave history');
    }
  };

  const isWeekend = (day) => {
    const currentDate = new Date();
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayOfWeek = checkDate.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const calculateWorkingDays = (startDate, endDate) => {
    let count = 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
    }
    return count;
  };

  const getLeaveTypeForDate = (day) => {
    const currentDate = new Date();
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    const leave = leaveHistory.find(leave => {
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);
      return checkDate >= startDate && checkDate <= endDate && leave.status === 'approved';
    });
    
    return leave?.leave_type || null;
  };

  const getLeaveColor = (leaveType) => {
    switch (leaveType) {
      case 'full_day':
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'half_day':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'sick':
        return { backgroundColor: '#ddd6fe', color: '#5b21b6' };
      default:
        return { backgroundColor: 'white', color: '#374151' };
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    
    let requestedDays = 1;
    
    if (leaveRequest.leave_type === 'half_day') {
      requestedDays = 0.5;
    } else if (leaveRequest.leave_type === 'sick' || leaveRequest.leave_type === 'full_day') {
      const startDate = new Date(leaveRequest.start_date);
      const endDate = new Date(leaveRequest.end_date || leaveRequest.start_date);
      requestedDays = calculateWorkingDays(startDate, endDate);
    }
    
    if (leaveBalance && (leaveBalance.used_leaves + requestedDays) > leaveBalance.total_allowed) {
      toast.error(`Cannot request ${requestedDays} working days. You only have ${leaveBalance.remaining_leaves} days remaining.`);
      return;
    }
    
    if (leaveBalance && (leaveBalance.remaining_leaves - requestedDays) <= 1) {
      const proceed = window.confirm(
        `This will use ${requestedDays} working days of your ${leaveBalance.remaining_leaves} remaining days. Continue?`
      );
      if (!proceed) return;
    }
    
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
      fetchLeaveHistory();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit leave request');
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
          <div style={{marginBottom: '16px'}}>
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
            <div style={{marginBottom: '16px'}}>
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
            <div style={{marginBottom: '16px'}}>
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
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px'}}>
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
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px'}}>
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
            <div style={{marginBottom: '16px'}}>
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
            {(() => {
              const currentDate = new Date();
              const year = currentDate.getFullYear();
              const month = currentDate.getMonth();
              const firstDay = new Date(year, month, 1);
              const lastDay = new Date(year, month + 1, 0);
              const startingDayOfWeek = firstDay.getDay();
              const daysInMonth = lastDay.getDate();
              
              const calendarDays = [];
              
              for (let i = 0; i < startingDayOfWeek; i++) {
                calendarDays.push(
                  <div key={`empty-${i}`} style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    color: '#d1d5db'
                  }}>
                  </div>
                );
              }
              
              for (let day = 1; day <= daysInMonth; day++) {
                const currentDateForDay = new Date(year, month, day);
                const dayOfWeek = currentDateForDay.getDay();
                const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
                const leaveType = getLeaveTypeForDate(day);
                
                let colors;
                if (isWeekendDay) {
                  colors = { backgroundColor: '#f3f4f6', color: '#9ca3af' };
                } else {
                  colors = getLeaveColor(leaveType);
                }
                
                calendarDays.push(
                  <div key={day} style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    ...colors,
                    position: 'relative'
                  }}>
                    {day}
                    {leaveType && !isWeekendDay && (
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        fontSize: '8px',
                        fontWeight: 'bold'
                      }}>
                        {leaveType === 'full_day' ? 'F' : leaveType === 'half_day' ? 'H' : 'S'}
                      </div>
                    )}
                    {isWeekendDay && (
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        fontSize: '8px',
                        fontWeight: 'bold'
                      }}>
                        W
                      </div>
                    )}
                  </div>
                );
              }
              
              return calendarDays;
            })()}
          </div>
          
          <div style={{display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <div style={{width: '12px', height: '12px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5'}}></div>
              <span>Full Day</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <div style={{width: '12px', height: '12px', backgroundColor: '#fef3c7', border: '1px solid #fcd34d'}}></div>
              <span>Half Day</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <div style={{width: '12px', height: '12px', backgroundColor: '#ddd6fe', border: '1px solid #c4b5fd'}}></div>
              <span>Sick Leave</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <div style={{width: '12px', height: '12px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db'}}></div>
              <span>Weekend</span>
            </div>
          </div>
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

              {leaveBalance && leaveBalance.remaining_leaves <= 1 && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  <p style={{margin: 0, fontSize: '14px', color: '#92400e'}}>
                    ⚠️ Warning: You only have {leaveBalance.remaining_leaves} leave days remaining this month.
                  </p>
                </div>
              )}
              
              {renderDateFields()}
              
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

export default LeaveManagement;
