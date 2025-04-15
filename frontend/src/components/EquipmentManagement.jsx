import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const EquipmentManagement = () => {
  // State management
  const [equipments, setEquipments] = useState([]);
  const [filteredEquipments, setFilteredEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Track which equipment is being deleted
  
  // Filter states
  const [filters, setFilters] = useState({
    deviceType: '',
    room: '',
    id: ''
  });
  
  // Create form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: 'Door',
    status: 'active',
    place_id: 1
  });
  const [formErrors, setFormErrors] = useState({});
  
  const token = localStorage.getItem('access_token');

  // Fetch equipment data
  useEffect(() => {
    let isMounted = true;
    
    const fetchEquipments = async () => {
      if (!token) {
        if (isMounted) {
          setError('Please log in to view equipment');
          setLoading(false);
        }
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/equipment`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (isMounted) {
          const data = Array.isArray(response.data) ? response.data : [];
          // Sort by ID in descending order to show newest first
          const sortedData = data.sort((a, b) => b.id - a.id);
          setEquipments(sortedData);
          setFilteredEquipments(sortedData);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to fetch equipment');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEquipments();
    
    return () => {
      isMounted = false;
    };
  }, [isCreating]);

  // Apply filters
  useEffect(() => {
    const filtered = equipments.filter(equipment => {
      if (!equipment) return false;
      if (filters.deviceType && 
          !equipment.name?.toLowerCase().includes(filters.deviceType.toLowerCase())) {
        return false;
      }
      if (filters.room && 
          equipment.place_id?.toString() !== filters.room) {
        return false;
      }
      if (filters.id && 
          !equipment.id?.toString().includes(filters.id)) {
        return false;
      }
      return true;
    });
    
    setFilteredEquipments(filtered);
  }, [filters, equipments]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle input changes in create form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEquipment(prev => ({
      ...prev,
      [name]: name === 'place_id' ? (value === '' ? '' : parseInt(value, 10)) : value
    }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handle create form submission
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Please log in to create equipment');
      setShowCreateForm(false);
      return;
    }
    
    // Validate form
    const errors = {};
    if (!newEquipment.name) errors.name = 'Device type is required';
    if (!newEquipment.status) errors.status = 'Status is required';
    if (newEquipment.place_id === '' || isNaN(newEquipment.place_id) || newEquipment.place_id <= 0) {
      errors.place_id = 'Valid positive room number is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setIsCreating(true);
      const payload = {
        name: newEquipment.name,
        status: newEquipment.status,
        place_id: parseInt(newEquipment.place_id, 10)
      };
      
      const response = await axios.post(`${API_BASE_URL}/equipment`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.data || !response.data.id || !response.data.name || !response.data.status || response.data.place_id == null) {
        throw new Error('Invalid equipment data returned from server');
      }
      
      // Add new equipment at the beginning of the list
      setEquipments(prev => [response.data, ...prev]);
      setError('');
      
      setNewEquipment({
        name: 'Door',
        status: 'active',
        place_id: 1
      });
      setShowCreateForm(false);
      setFormErrors({});
    } catch (err) {
      console.error('Creation error:', err);
      setError(err.response?.data?.message || 'Failed to create equipment');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle equipment deletion
  const handleDeleteEquipment = async (id) => {
    if (!token) {
      setError('Please log in to delete equipment');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this equipment?')) {
      return;
    }

    try {
      setDeletingId(id);
      await axios.delete(`${API_BASE_URL}/equipment/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the deleted equipment from the state
      setEquipments(prev => prev.filter(equipment => equipment.id !== id));
      setError('');
    } catch (err) {
      console.error('Deletion error:', err);
      setError(err.response?.data?.message || 'Failed to delete equipment');
    } finally {
      setDeletingId(null);
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
        }}>Loading equipment data...</p>
      </div>
    );
  }

  // Check if form is valid
  const isFormValid = newEquipment.name && newEquipment.status && newEquipment.place_id !== '' && !isNaN(newEquipment.place_id) && newEquipment.place_id > 0;

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '30px',
      position: 'relative'
    }}>
      {/* Slide-out Create Form */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: showCreateForm ? 0 : '-500px',
        width: '400px',
        height: '100vh',
        backgroundColor: '#ffffff',
        boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
        transition: 'right 0.3s ease-in-out',
        zIndex: 1000,
        padding: '30px',
        overflowY: 'auto'
      }}>
        <h3 style={{
          color: '#2c3e50',
          marginBottom: '25px',
          fontSize: '20px',
          fontWeight: '600'
        }}>Add New Equipment</h3>
        
        <form onSubmit={handleCreateSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2c3e50',
              fontWeight: '500'
            }}>Device Type</label>
            <select
              name="name"
              value={newEquipment.name}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: formErrors.name ? '1px solid #e74c3c' : '1px solid #ddd',
                backgroundColor: '#fff'
              }}
              disabled={isCreating}
            >
              <option value="Door">Door</option>
              <option value="LedLCD">Led/LCD</option>
              <option value="Light">Light</option>
            </select>
            {formErrors.name && (
              <p style={{ color: '#e74c3c', fontSize: '14px', marginTop: '5px' }}>
                {formErrors.name}
              </p>
            )}
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2c3e50',
              fontWeight: '500'
            }}>Status</label>
            <select
              name="status"
              value={newEquipment.status}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: formErrors.status ? '1px solid #e74c3c' : '1px solid #ddd',
                backgroundColor: '#fff'
              }}
              disabled={isCreating}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
            {formErrors.status && (
              <p style={{ color: '#e74c3c', fontSize: '14px', marginTop: '5px' }}>
                {formErrors.status}
              </p>
            )}
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2c3e50',
              fontWeight: '500'
            }}>Room Number</label>
            <input
              type="number"
              name="place_id"
              value={newEquipment.place_id}
              onChange={handleInputChange}
              min="1"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: formErrors.place_id ? '1px solid #e74c3c' : '1px solid #ddd',
                backgroundColor: '#fff'
              }}
              disabled={isCreating}
            />
            {formErrors.place_id && (
              <p style={{ color: '#e74c3c', fontSize: '14px', marginTop: '5px' }}>
                {formErrors.place_id}
              </p>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              type="submit"
              disabled={isCreating || !isFormValid}
              style={{
                padding: '12px 20px',
                backgroundColor: isCreating || !isFormValid ? '#95a5a6' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isCreating || !isFormValid ? 'not-allowed' : 'pointer',
                flex: 1,
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
            >
              {isCreating ? 'Creating...' : 'Create Equipment'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setFormErrors({});
                setNewEquipment({
                  name: 'Door',
                  status: 'active',
                  place_id: 1
                });
              }}
              disabled={isCreating}
              style={{
                padding: '12px 20px',
                backgroundColor: isCreating ? '#95a5a6' : '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isCreating ? 'not-allowed' : 'pointer',
                flex: 1,
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      
      {/* Overlay when form is open */}
      {showCreateForm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            cursor: 'pointer'
          }}
          onClick={() => !isCreating && setShowCreateForm(false)}
        />
      )}
      
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
        }}>Equipment Management</h2>
        
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
            }}>Device Type</label>
            <select
              name="deviceType"
              value={filters.deviceType}
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
              <option value="Door">Door</option>
              <option value="LedLCD">Led/LCD</option>
              <option value="Light">Light</option>
            </select>
          </div>
          
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2c3e50',
              fontWeight: '500'
            }}>Room Number</label>
            <input
              type="text"
              name="room"
              placeholder="Enter room number"
              value={filters.room}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                backgroundColor: '#fff'
              }}
            />
          </div>
          
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2c3e50',
              fontWeight: '500'
            }}>Equipment ID</label>
            <input
              type="text"
              name="id"
              placeholder="Enter equipment ID"
              value={filters.id}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                backgroundColor: '#fff'
              }}
            />
          </div>
        </div>
        
        {filteredEquipments.length === 0 ? (
          <p style={{
            textAlign: 'center',
            color: '#7f8c8d',
            padding: '40px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            {equipments.length === 0 ? 'No equipment found' : 'No equipment matches your filters'}
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
              {filteredEquipments.map((eq) => (
                <li key={eq.id} style={{
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
                    }}>{eq.name || 'Unknown'}</span>
                    <span style={{
                      color: '#7f8c8d',
                      fontSize: '14px'
                    }}>
                      ID: {eq.id || 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <span style={{
                      color: '#7f8c8d',
                      fontSize: '14px'
                    }}>
                      Room {eq.place_id != null ? eq.place_id : 'N/A'}
                    </span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      backgroundColor: 
                        eq.status === 'active' ? '#e6f7ee' :
                        eq.status === 'inactive' ? '#f5f5f5' :
                        eq.status === 'maintenance' ? '#fff8e6' : '#ffebee',
                      color: 
                        eq.status === 'active' ? '#00a854' :
                        eq.status === 'inactive' ? '#757575' :
                        eq.status === 'maintenance' ? '#ffa000' : '#f44336'
                    }}>
                      {eq.status ? eq.status.charAt(0).toUpperCase() + eq.status.slice(1) : 'Unknown'}
                    </span>
                    <button
                      onClick={() => handleDeleteEquipment(eq.id)}
                      disabled={deletingId === eq.id || !token}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: deletingId === eq.id || !token ? '#95a5a6' : '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: deletingId === eq.id || !token ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        fontSize: '14px',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      {deletingId === eq.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Create Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '30px'
        }}>
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={!token}
            style={{
              padding: '12px 30px',
              backgroundColor: !token ? '#95a5a6' : '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: !token ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              boxShadow: '0 2px 10px rgba(46, 204, 113, 0.3)',
              transition: 'background-color 0.2s, transform 0.2s, box-shadow 0.2s'
            }}
          >
            + Add New Equipment
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentManagement;