import React, { useState, useEffect } from 'react';
import { authAPI, attendanceAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showLeaveProfile, setShowLeaveProfile] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [leaveData, setLeaveData] = useState(null);
  const [filters, setFilters] = useState({
    project: '',
    designation: '',
    status: ''
  });
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    employee_id: '',
    project: '',
    designation: '',
    date_joined_company: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, filters]);

  const fetchEmployees = async () => {
    try {
      const response = await attendanceAPI.getEmployeesLeaveManagement();
      setEmployees(response.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const filterEmployees = () => {
    let filtered = employees;
    
    if (filters.project) {
      filtered = filtered.filter(emp => emp.project === filters.project);
    }
    if (filters.designation) {
      filtered = filtered.filter(emp => emp.designation === filters.designation);
    }
    if (filters.status) {
      filtered = filtered.filter(emp => 
        filters.status === 'active' ? emp.status === 'Active' : emp.status === 'Inactive'
      );
    }
    
    setFilteredEmployees(filtered);
  };

  const getUniqueProjects = () => {
    return [...new Set(employees.filter(emp => emp.project).map(emp => emp.project))];
  };

  const getUniqueDesignations = () => {
    return [...new Set(employees.filter(emp => emp.designation).map(emp => emp.designation))];
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(newEmployee).forEach(key => {
        if (newEmployee[key] !== null && newEmployee[key] !== '') {
          formData.append(key, newEmployee[key]);
        }
      });
      formData.append('role', 'employee');

      await authAPI.createUser(formData);
      toast.success('Employee created successfully!');
      setShowCreateForm(false);
      setNewEmployee({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        employee_id: '',
        project: '',
        designation: '',
        date_joined_company: ''
      });
      fetchEmployees();
    } catch (error) {
      const errorMsg = error.response?.data?.username?.[0] || 
                      error.response?.data?.email?.[0] || 
                      error.response?.data?.employee_id?.[0] || 
                      'Failed to create employee';
      toast.error(errorMsg);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee({
      id: employee.id,
      username: employee.username,
      email: employee.email,
      first_name: employee.first_name,
      last_name: employee.last_name,
      employee_id: employee.employee_id,
      project: employee.project || '',
      designation: employee.designation || '',
      date_joined_company: employee.date_joined_company || ''
    });
    setShowEditForm(true);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updateUser(editingEmployee.id, editingEmployee);
      toast.success('Employee updated successfully!');
      setShowEditForm(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (employeeId, employeeName) => {
    if (window.confirm(`Are you sure you want to delete ${employeeName}?`)) {
      try {
        await authAPI.deleteUser(employeeId);
        toast.success('Employee deleted successfully!');
        fetchEmployees();
      } catch (error) {
        toast.error('Failed to delete employee');
      }
    }
  };

  const handleViewLeaveProfile = async (employee) => {
    try {
      setSelectedEmployee(employee);
      setShowLeaveProfile(true);
      const response = await attendanceAPI.getEmployeeLeaveHistory(employee.id);
      setLeaveData(response.data);
    } catch (error) {
      toast.error('Failed to fetch leave history');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Employee Management</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px'
            }}
          >
            + Add Employee
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <select
            value={filters.project}
            onChange={(e) => setFilters({ ...filters, project: e.target.value })}
            style={{
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#f8fafc'
            }}
          >
            <option value="">All Projects</option>
            {getUniqueProjects().map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
          <select
            value={filters.designation}
            onChange={(e) => setFilters({ ...filters, designation: e.target.value })}
            style={{
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#f8fafc'
            }}
          >
            <option value="">All Designations</option>
            {getUniqueDesignations().map(designation => (
              <option key={designation} value={designation}>{designation}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            style={{
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#f8fafc'
            }}
          >
            <option value="">All Status</option>
            <option value="active">Clocked In</option>
            <option value="inactive">Clocked Out</option>
          </select>
        </div>

        {/* Employee Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
          maxHeight: '600px',
          overflowY: 'auto',
          padding: '4px'
        }}>
          {filteredEmployees.map((employee) => (
            <div key={employee.id} style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}>

              {/* Status Badge - Top Right */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px'
              }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  backgroundColor: employee.status === 'Active' ? '#10b981' : '#ef4444',
                  color: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {employee.status === 'Active' ? 'Clocked In' : 'Clocked Out'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                {/* Profile Picture */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: employee.profile_picture ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  overflow: 'hidden',
                  border: '4px solid #ffffff',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }}>
                  {employee.profile_picture ? (
                    <img
                      src={employee.profile_picture}
                      alt={`${employee.first_name} ${employee.last_name}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: '700'
                    }}>
                      {getInitials(employee.first_name, employee.last_name)}
                    </span>
                  )}
                </div>

                {/* Employee Name */}
                <h3 style={{
                  margin: '0 0 6px 0',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1f2937',
                  letterSpacing: '-0.025em'
                }}>
                  {employee.first_name} {employee.last_name}
                </h3>

                {/* Username */}
                <p style={{
                  margin: '0 0 4px 0',
                  fontSize: '14px',
                  color: '#6366f1',
                  fontWeight: '500',
                  backgroundColor: '#f0f9ff',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  @{employee.username}
                </p>

                {/* Employee ID */}
                <p style={{
                  margin: '0 0 16px 0',
                  fontSize: '13px',
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  ID: {employee.employee_id || 'N/A'}
                </p>

                {/* Divider */}
                <div style={{
                  width: '100%',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
                  margin: '16px 0'
                }}></div>

                {/* Additional Info */}
                <div style={{ width: '100%', textAlign: 'left', marginBottom: '16px' }}>
                  {employee.designation && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                      padding: '8px 12px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '8px'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: '#475569',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginRight: '8px'
                      }}>
                        Role:
                      </span>
                      <span style={{
                        fontSize: '14px',
                        color: '#1e293b',
                        fontWeight: '600'
                      }}>
                        {employee.designation}
                      </span>
                    </div>
                  )}
                  
                  {employee.project && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: '#fef3c7',
                      borderRadius: '8px'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: '#92400e',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginRight: '8px'
                      }}>
                        Project:
                      </span>
                      <span style={{
                        fontSize: '14px',
                        color: '#92400e',
                        fontWeight: '600'
                      }}>
                        {employee.project}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <button
                    onClick={() => handleViewLeaveProfile(employee)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    📅 Leaves
                  </button>
                  <button
                    onClick={() => handleEditEmployee(employee)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(employee.id, `${employee.first_name} ${employee.last_name}`)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No employees found</h3>
            <p style={{ fontSize: '14px' }}>Try adjusting your filters or create a new employee.</p>
          </div>
        )}
      </div>

      {/* Create Employee Modal */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '500px', maxHeight: '80vh', overflow: 'auto' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#111827' }}>Create New Employee</h2>
            <form onSubmit={handleCreateEmployee}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Employee ID *</label>
                <input
                  type="text"
                  placeholder="EMP001"
                  className="form-input"
                  value={newEmployee.employee_id}
                  onChange={(e) => setNewEmployee({ ...newEmployee, employee_id: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Username *</label>
                  <input
                    type="text"
                    placeholder="john.doe"
                    className="form-input"
                    value={newEmployee.username}
                    onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Default Password *</label>
                  <input
                    type="password"
                    placeholder="Temporary password"
                    className="form-input"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>First Name *</label>
                  <input
                    type="text"
                    placeholder="John"
                    className="form-input"
                    value={newEmployee.first_name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Last Name *</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="form-input"
                    value={newEmployee.last_name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Email Address *</label>
                <input
                  type="email"
                  placeholder="john.doe@company.com"
                  className="form-input"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Project</label>
                  <input
                    type="text"
                    placeholder="Project Alpha"
                    className="form-input"
                    value={newEmployee.project}
                    onChange={(e) => setNewEmployee({ ...newEmployee, project: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Job Title</label>
                  <input
                    type="text"
                    placeholder="Software Developer"
                    className="form-input"
                    value={newEmployee.designation}
                    onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Date Joined</label>
                <input
                  type="date"
                  className="form-input"
                  value={newEmployee.date_joined_company}
                  onChange={(e) => setNewEmployee({ ...newEmployee, date_joined_company: e.target.value })}
                  style={{ width: '50%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">Create Employee</button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn"
                  style={{ backgroundColor: '#6b7280', color: 'white' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditForm && editingEmployee && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '500px', maxHeight: '80vh', overflow: 'auto' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#111827' }}>Edit Employee</h2>
            <form onSubmit={handleUpdateEmployee}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Employee ID *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingEmployee.employee_id}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, employee_id: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Username *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingEmployee.username}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editingEmployee.email}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>First Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingEmployee.first_name}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, first_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Last Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingEmployee.last_name}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Project</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingEmployee.project}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, project: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Job Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingEmployee.designation}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Date Joined</label>
                <input
                  type="date"
                  className="form-input"
                  value={editingEmployee.date_joined_company}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, date_joined_company: e.target.value })}
                  style={{ width: '50%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">Update Employee</button>
                <button
                  type="button"
                  onClick={() => { setShowEditForm(false); setEditingEmployee(null); }}
                  className="btn"
                  style={{ backgroundColor: '#6b7280', color: 'white' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Profile Modal */}
      {showLeaveProfile && selectedEmployee && leaveData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '700px', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#111827', fontSize: '24px', fontWeight: '700', margin: 0 }}>
                Leave Profile - {leaveData.employee.name}
              </h2>
              <button
                onClick={() => { setShowLeaveProfile(false); setLeaveData(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            {/* Leave Balance */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: '#dbeafe',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>
                  {leaveData.leave_balance.total_allowed}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Total Allowed</div>
              </div>
              <div style={{
                padding: '16px',
                backgroundColor: '#fee2e2',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
                  {leaveData.leave_balance.used_leaves}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Used</div>
              </div>
              <div style={{
                padding: '16px',
                backgroundColor: '#d1fae5',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                  {leaveData.leave_balance.remaining_leaves}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Remaining</div>
              </div>
            </div>

            {/* Statistics */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Leave Statistics</h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                  <strong>Total Days Taken:</strong> {leaveData.statistics.total_days_taken}
                </div>
                <div style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                  <strong>Approved:</strong> {leaveData.statistics.approved_requests}
                </div>
                <div style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                  <strong>Pending:</strong> {leaveData.statistics.pending_requests}
                </div>
              </div>
            </div>

            {/* Leave History */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Leave History</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {leaveData.leave_history.map((leave) => (
                  <div key={leave.id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: '#ffffff'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>
                          {leave.leave_type.replace('_', ' ').toUpperCase()}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                          {leave.start_date} to {leave.end_date}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          {leave.reason}
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: leave.status === 'approved' ? '#d1fae5' :
                          leave.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                        color: leave.status === 'approved' ? '#065f46' :
                          leave.status === 'rejected' ? '#991b1b' : '#92400e'
                      }}>
                        {leave.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;
