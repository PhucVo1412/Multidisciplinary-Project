import React, { useState, useEffect } from 'react';
import Camera from './Camera';
import axios from 'axios';

const UserManagement = () => {
  const [information, setInformation] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchInfo = async () => {
      if (!token) {
        setError('Please log in to view your user information.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setInformation(response.data);
        setEditForm(response.data);
        setLastUpdated(new Date().toLocaleString());
        setError('');
      } catch (err) {
        if (err.response) {
          setError(err.response.data.message || 'Failed to fetch user information');
        } else {
          setError('An error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [isEditing, token]);

  const handleEditClick = () => {
    setIsEditing(true);
    setSuccessMessage('');
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditForm(information);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.put(`${API_BASE_URL}/me`, editForm, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setInformation(response.data);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Failed to update profile');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        color: '#7f8c8d',
        fontSize: '18px'
      }}>
        Loading user information...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fadbd8',
        color: '#e74c3c',
        borderRadius: '8px',
        margin: '20px',
        textAlign: 'center'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '30px' }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '30px'
      }}>
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{ color: '#2c3e50', fontSize: '28px', fontWeight: '600', marginBottom: '10px' }}>
            User Profile
          </h1>
          <p style={{ color: '#7f8c8d', fontSize: '16px' }}>View and manage your account information</p>
        </div>

        {successMessage && (
          <div style={{
            padding: '15px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {successMessage}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
              <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #3498db',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                flexShrink: 0
              }}>
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/9187/9187604.png" 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              
              <div style={{ flex: 1, width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', color: '#7f8c8d' }}>Full Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name || ''}
                      onChange={handleInputChange}
                      style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', color: '#7f8c8d' }}>Phone:</label>
                    <input
                      type="text"
                      name="phone"
                      value={editForm.phone || ''}
                      onChange={handleInputChange}
                      style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#7f8c8d' }}>User Id:</span>
                    <span style={{ fontSize: '16px', fontWeight: '500', color: '#2c3e50' }}>{information.id}</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#7f8c8d' }}>Type:</span>
                    <span style={{ fontSize: '16px', fontWeight: '500', color: '#2c3e50' }}>
                      {information.type ? information.type.toUpperCase() : 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px', flexWrap: 'wrap' }}>
              <button 
                type="submit"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  ':hover': { backgroundColor: '#219653', transform: 'translateY(-2px)' }
                }}
              >
                Save Changes
              </button>
              
              <button 
                type="button"
                onClick={handleCancelClick}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f8f9fa',
                  color: '#2c3e50',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  ':hover': { backgroundColor: '#e8e8e8', transform: 'translateY(-2px)' }
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
              <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #3498db',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                flexShrink: 0
              }}>
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/9187/9187604.png" 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              
              <div style={{ flex: 1, width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#7f8c8d' }}>Full Name:</span>
                    <span style={{ fontSize: '16px', fontWeight: '500', color: '#2c3e50' }}>
                      {information.name || 'Not provided'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#7f8c8d' }}>User Id:</span>
                    <span style={{ fontSize: '16px', fontWeight: '500', color: '#2c3e50' }}>
                      {information.id || 'Not provided'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#7f8c8d' }}>Phone:</span>
                    <span style={{ fontSize: '16px', fontWeight: '500', color: '#2c3e50' }}>
                      {information.phone || 'Not provided'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#7f8c8d' }}>Type:</span>
                    <span style={{ fontSize: '16px', fontWeight: '500', color: '#2c3e50' }}>
                      {information.type ? information.type.toUpperCase() : 'Not provided'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#7f8c8d' }}>Account Status:</span>
                    <span style={{ fontSize: '16px', fontWeight: '500', color: '#27ae60' }}>Active</span>
                  </div>
                </div>
                
                <div style={{ marginTop: '20px', textAlign: 'right', fontSize: '12px', color: '#95a5a6' }}>
                  Last updated: {lastUpdated}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px', flexWrap: 'wrap' }}>
              <button 
                onClick={handleEditClick}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  ':hover': { backgroundColor: '#2980b9', transform: 'translateY(-2px)' }
                }}
              >
                Edit Profile
              </button>
              
              <button 
                onClick={() => setShowCamera(!showCamera)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: showCamera ? '#e67e22' : '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  ':hover': {
                    backgroundColor: showCamera ? '#d35400' : '#2980b9',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {showCamera ? 'Close Camera' : 'Face Recognition'}
              </button>

              <button style={{
                padding: '12px 24px',
                backgroundColor: '#f8f9fa',
                color: '#2c3e50',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s',
                ':hover': { backgroundColor: '#e8e8e8', transform: 'translateY(-2px)' }
              }}>
                Account Settings
              </button>
            </div>

            {showCamera && (
              <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <Camera />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;