import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const EquipmentManagement = () => {
  // State management
  const [equipments, setEquipments] = useState([]);
  const [filteredEquipments, setFilteredEquipments] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [user, setUser] = useState(null);
  
  // New place creation states
  const [showCreatePlaceForm, setShowCreatePlaceForm] = useState(false);
  const [newPlace, setNewPlace] = useState({
    room: '',
    address: ''
  });
  const [placeFormErrors, setPlaceFormErrors] = useState({});
  const [isCreatingPlace, setIsCreatingPlace] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    deviceType: '',
    room: '',
    address: ''
  });
  
  // Create equipment form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: 'Door',
    status: 'active',
    place_id: 1
  });
  const [formErrors, setFormErrors] = useState({});
  
  const token = localStorage.getItem('access_token');

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      
      try {
        const response = await axios.get(`${API_BASE_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };

    fetchUserData();
  }, [token]);
  
  // Fetch equipment and places data
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!token) {
        if (isMounted) {
          setError('Please log in to view equipment');
          setLoading(false);
        }
        return;
      }

      try {
        const placesResponse = await axios.get(`${API_BASE_URL}/places`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (isMounted) {
          setPlaces(Array.isArray(placesResponse.data) ? placesResponse.data : []);
        }

        const equipmentResponse = await axios.get(`${API_BASE_URL}/equipment`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (isMounted) {
          const data = Array.isArray(equipmentResponse.data) ? equipmentResponse.data : [];
          const sortedData = data.sort((a, b) => b.id - a.id);
          setEquipments(sortedData);
          setFilteredEquipments(sortedData);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to fetch data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [isCreating, isCreatingPlace, token]);

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
      
      if (filters.address) {
        const place = places.find(p => p.id === equipment.place_id);
        if (!place || !place.address?.toLowerCase().includes(filters.address.toLowerCase())) {
          return false;
        }
      }
      
      return true;
    });
    
    setFilteredEquipments(filtered);
  }, [filters, equipments, places]);

  // Get unique addresses for the address filter
  const uniqueAddresses = [...new Set(places.map(place => place.address))].filter(Boolean);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle input changes in create equipment form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEquipment(prev => ({
      ...prev,
      [name]: name === 'place_id' ? (value === '' ? '' : parseInt(value, 10)) : value
    }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handle input changes in create place form
  const handlePlaceInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlace(prev => ({
      ...prev,
      [name]: value
    }));
    setPlaceFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handle create equipment form submission
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Please log in to create equipment');
      setShowCreateForm(false);
      return;
    }
    
    const errors = {};
    if (!newEquipment.name) errors.name = 'Device type is required';
    if (!newEquipment.status) errors.status = 'Status is required';
    if (newEquipment.place_id === '' || isNaN(newEquipment.place_id) || newEquipment.place_id <= 0) {
      errors.place_id = 'Valid room selection is required';
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

  // Handle create place form submission
  const handleCreatePlaceSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Please log in to create a place');
      setShowCreatePlaceForm(false);
      return;
    }
    
    const errors = {};
    if (!newPlace.room) errors.room = 'Room name is required';
    if (!newPlace.address) errors.address = 'Address is required';
    
    if (Object.keys(errors).length > 0) {
      setPlaceFormErrors(errors);
      return;
    }
    
    try {
      setIsCreatingPlace(true);
      const payload = {
        room: newPlace.room,
        address: newPlace.address
      };
      
      const response = await axios.post(`${API_BASE_URL}/places`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.data || !response.data.id || !response.data.room || !response.data.address) {
        throw new Error('Invalid place data returned from server');
      }
      
      setPlaces(prev => [response.data, ...prev]);
      setError('');
      
      setNewPlace({
        room: '',
        address: ''
      });
      setShowCreatePlaceForm(false);
      setPlaceFormErrors({});
    } catch (err) {
      console.error('Place creation error:', err);
      setError(err.response?.data?.message || 'Failed to create place');
    } finally {
      setIsCreatingPlace(false);
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

  // Check if forms are valid
  const isEquipmentFormValid = newEquipment.name && newEquipment.status && newEquipment.place_id !== '' && !isNaN(newEquipment.place_id) && newEquipment.place_id > 0;
  const isPlaceFormValid = newPlace.room && newPlace.address;

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '30px',
      position: 'relative'
    }}>
      {/* Slide-out Create Equipment Form */}
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
            }}>Room</label>
            <select
              name="place_id"
              value={newEquipment.place_id}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: formErrors.place_id ? '1px solid #e74c3c' : '1px solid #ddd',
                backgroundColor: '#fff'
              }}
              disabled={isCreating}
            >
              <option value="">Select a room</option>
              {places.map(place => (
                <option key={place.id} value={place.id}>
                  {place.room} - {place.address}
                </option>
              ))}
            </select>
            {formErrors.place_id && (
              <p style={{ color: '#e74c3c', fontSize: '14px', marginTop: '5px' }}>
                {formErrors.place_id}
              </p>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              type="submit"
              disabled={isCreating || !isEquipmentFormValid}
              style={{
                padding: '12px 20px',
                backgroundColor: isCreating || !isEquipmentFormValid ? '#95a5a6' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isCreating || !isEquipmentFormValid ? 'not-allowed' : 'pointer',
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
      
      {/* Slide-out Create Place Form */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: showCreatePlaceForm ? 0 : '-500px',
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
        }}>Add New Place</h3>
        
        <form onSubmit={handleCreatePlaceSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2c3e50',
              fontWeight: '500'
            }}>Room Name</label>
            <input
              type="text"
              name="room"
              value={newPlace.room}
              onChange={handlePlaceInputChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: placeFormErrors.room ? '1px solid #e74c3c' : '1px solid #ddd',
                backgroundColor: '#fff'
              }}
              disabled={isCreatingPlace}
              placeholder="e.g., Room 101"
            />
            {placeFormErrors.room && (
              <p style={{ color: '#e74c3c', fontSize: '14px', marginTop: '5px' }}>
                {placeFormErrors.room}
              </p>
            )}
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2c3e50',
              fontWeight: '500'
            }}>Address</label>
            <input
              type="text"
              name="address"
              value={newPlace.address}
              onChange={handlePlaceInputChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: placeFormErrors.address ? '1px solid #e74c3c' : '1px solid #ddd',
                backgroundColor: '#fff'
              }}
              disabled={isCreatingPlace}
              placeholder="e.g., 123 Main St"
            />
            {placeFormErrors.address && (
              <p style={{ color: '#e74c3c', fontSize: '14px', marginTop: '5px' }}>
                {placeFormErrors.address}
              </p>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              type="submit"
              disabled={isCreatingPlace || !isPlaceFormValid}
              style={{
                padding: '12px 20px',
                backgroundColor: isCreatingPlace || !isPlaceFormValid ? '#95a5a6' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isCreatingPlace || !isPlaceFormValid ? 'not-allowed' : 'pointer',
                flex: 1,
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
            >
              {isCreatingPlace ? 'Creating...' : 'Create Place'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreatePlaceForm(false);
                setPlaceFormErrors({});
                setNewPlace({
                  room: '',
                  address: ''
                });
              }}
              disabled={isCreatingPlace}
              style={{
                padding: '12px 20px',
                backgroundColor: isCreatingPlace ? '#95a5a6' : '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isCreatingPlace ? 'not-allowed' : 'pointer',
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
      
      {/* Overlay when either form is open */}
      {(showCreateForm || showCreatePlaceForm) && (
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
          onClick={() => {
            if (!isCreating) {
              setShowCreateForm(false);
              setFormErrors({});
              setNewEquipment({
                name: 'Door',
                status: 'active',
                place_id: 1
              });
            }
            if (!isCreatingPlace) {
              setShowCreatePlaceForm(false);
              setPlaceFormErrors({});
              setNewPlace({
                room: '',
                address: ''
              });
            }
          }}
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
            }}>Room</label>
            <select
              name="room"
              value={filters.room}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                backgroundColor: '#fff'
              }}
            >
              <option value="">All Rooms</option>
              {places.map(place => (
                <option key={place.id} value={place.id}>
                  {place.room}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2c3e50',
              fontWeight: '500'
            }}>Address</label>
            <select
              name="address"
              value={filters.address}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                backgroundColor: '#fff'
              }}
            >
              <option value="">All Addresses</option>
              {uniqueAddresses.map((address, index) => (
                <option key={index} value={address}>
                  {address}
                </option>
              ))}
            </select>
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
              {filteredEquipments.map((eq) => {
                const place = places.find(p => p.id === eq.place_id) || {};
                return (
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '5px' }}>
                        <span style={{
                          color: '#7f8c8d',
                          fontSize: '14px'
                        }}>
                          {place.room || `Room ${eq.place_id || 'N/A'}`}
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
                        {user?.type === 'admin' && (
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
                        )}
                      </div>
                      {place.address && (
                        <span style={{
                          color: '#95a5a6',
                          fontSize: '13px',
                          fontStyle: 'italic'
                        }}>
                          {place.address}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        {/* Create Buttons - only for admin */}
        {user?.type === 'admin' && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '30px',
            gap: '20px'
          }}>
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                padding: '12px 30px',
                backgroundColor: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                boxShadow: '0 2px 10px rgba(46, 204, 113, 0.3)',
                transition: 'background-color 0.2s, transform 0.2s, box-shadow 0.2s'
              }}
            >
              + Add New Equipment
            </button>
            <button
              onClick={() => setShowCreatePlaceForm(true)}
              style={{
                padding: '12px 30px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                boxShadow: '0 2px 10px rgba(52, 152, 219, 0.3)',
                transition: 'background-color 0.2s, transform 0.2s, box-shadow 0.2s'
              }}
            >
              + Add New Place
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentManagement;