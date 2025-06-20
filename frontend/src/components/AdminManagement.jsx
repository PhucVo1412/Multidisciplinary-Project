import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const AdminManagement = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);  // For sidebar state

  // Filter states
  const [filters, setFilters] = useState({
    name: '',
    type: ''
  });

  const token = localStorage.getItem('access_token');

  // Fetch users data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const data = Array.isArray(response.data) ? response.data : [];
        const sortedData = data.sort((a, b) => b.id - a.id);
        setUsers(sortedData);
        setFilteredUsers(sortedData);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Apply filters
  useEffect(() => {
    const filtered = users.filter(user => {
      if (filters.name && !user.name?.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      
      if (filters.type && user.type?.toLowerCase() !== filters.type.toLowerCase()) {
        return false;
      }
      
      return true;
    });
    
    setFilteredUsers(filtered);
  }, [filters, users]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle user deletion
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setDeletingId(id);
      await axios.delete(`${API_BASE_URL}/admin/normal_users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle user registration
  const handleRegister = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        username,
        password,
        role: 'user',  // Or 'admin' if needed
        action: 'default_action',
        access: 'full',
      });
      setMessage('Registration successful! Please log in.');
      setIsRegistering(false);
      setUsername('');
      setPassword('');
      setIsSidebarOpen(false);  // Close the sidebar after successful registration
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px'
      }}>
        <p style={{
          color: '#7f8c8d',
          fontSize: '18px'
        }}>Loading user data...</p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '30px',
      position: 'relative'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '30px',
        position: 'relative'
      }}>
        <h2 style={{
          color: '#2c3e50',
          marginBottom: '25px',
          fontSize: '24px',
          fontWeight: '600',
          textAlign: 'center'
        }}>Admin Management</h2>

        {/* Filter Controls */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          marginBottom: '25px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2c3e50',
              fontWeight: '500'
            }}>Name</label>
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              style={{
                width: '95%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                backgroundColor: '#fff'
              }}
              placeholder="Search by name"
            />
          </div>
          
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2c3e50',
              fontWeight: '500'
            }}>User Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                backgroundColor: '#fff'
              }}
            >
              <option value="">All Types</option>
              <option value="admin">Admin</option>
              <option value="normal">User</option>
            </select>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '15px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        {filteredUsers.length === 0 ? (
          <p style={{
            textAlign: 'center',
            color: '#7f8c8d',
            padding: '40px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            {users.length === 0 ? 'No users found' : 'No users match your filters'}
          </p>
        ) : (
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            paddingRight: '10px'
          }}>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {filteredUsers.map((user) => (
                <li key={user.id} style={{
                  padding: '15px 20px',
                  marginBottom: '10px',
                  backgroundColor: '#ffffff',
                  borderLeft: '4px solid #3498db',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'transform 0.2s'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{
                      fontWeight: '600',
                      color: '#2c3e50',
                      marginBottom: '5px'
                    }}>{user.name || 'Unknown'}</span>
                    <span style={{
                      color: '#7f8c8d',
                      fontSize: '14px'
                    }}>
                      ID: {user.id || 'N/A'} | Phone: {user.phone || 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      backgroundColor: user.type === 'admin' ? '#e6f7ee' : '#f5f5f5',
                      color: user.type === 'admin' ? '#00a854' : '#757575'
                    }}>
                      {user.type ? user.type.charAt(0).toUpperCase() + user.type.slice(1) : 'Unknown'}
                    </span>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deletingId === user.id}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: deletingId === user.id ? '#95a5a6' : '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: deletingId === user.id ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        fontSize: '14px',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      {deletingId === user.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Add New User Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          backgroundColor: '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          padding: '15px',
          fontSize: '24px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          zIndex: 9999
        }}
      >
        +
      </button>

      {/* Sidebar Register Form */}
      {isSidebarOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '350px',
          height: '100vh',
          backgroundColor: '#fff',
          boxShadow: '-4px 0 12px rgba(0,0,0,0.1)',
          padding: '30px',
          zIndex: 9999,
          transition: 'transform 0.3s ease-in-out',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(100%)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>Register New User</h3>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: '10px',
              width: '100%',
              marginBottom: '10px',
              borderRadius: '6px',
              border: '1px solid #ddd',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: '10px',
              width: '100%',
              marginBottom: '20px',
              borderRadius: '6px',
              border: '1px solid #ddd',
            }}
          />
          <button
            onClick={handleRegister}
            style={{
              padding: '10px',
              width: '100%',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Register
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            style={{
              padding: '10px',
              width: '100%',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              marginTop: '10px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          {message && <p style={{ color: '#e74c3c', marginTop: '10px' }}>{message}</p>}
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
