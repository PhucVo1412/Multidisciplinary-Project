import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActionLog = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  
  // Available options for filters
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [deviceIds, setDeviceIds] = useState([]);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchRecords = async () => {
      if (!token) {
        setError('Please log in to view your action log.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/controls', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setRecords(response.data);
        setFilteredRecords(response.data);
        
        // Extract unique device types and IDs for filter options
        const types = [...new Set(response.data.map(record => record.device_type))];
        const ids = [...new Set(response.data.map(record => record.device_id))];
        
        setDeviceTypes(types);
        setDeviceIds(ids);
        setError('');
      } catch (err) {
        if (err.response) {
          setError(err.response.data.message || 'Failed to fetch action log');
        } else {
          setError('An error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [token]);

  // Apply filters whenever any filter criteria or records change
  useEffect(() => {
    let filtered = [...records];
    
    if (selectedDate) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.start_time).toISOString().split('T')[0];
        return recordDate === selectedDate;
      });
    }
    
    if (selectedDeviceType) {
      filtered = filtered.filter(record => record.device_type === selectedDeviceType);
    }
    
    if (selectedDeviceId) {
      // Compare as numbers if possible
      filtered = filtered.filter(record => {
        const recordId = typeof record.device_id === 'number' ? 
          record.device_id : 
          parseInt(record.device_id, 10);
        const filterId = parseInt(selectedDeviceId, 10);
        return recordId === filterId;
      });
    }
    
    setFilteredRecords(filtered);
  }, [selectedDate, selectedDeviceType, selectedDeviceId, records]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleDeviceTypeChange = (e) => {
    setSelectedDeviceType(e.target.value);
  };

  const handleDeviceIdChange = (e) => {
    setSelectedDeviceId(e.target.value);
  };

  const clearFilters = () => {
    setSelectedDate('');
    setSelectedDeviceType('');
    setSelectedDeviceId('');
  };

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
        }}>Loading your action log...</p>
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
        margin: '20px'
      }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '30px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '30px'
      }}>
        <h2 style={{
          color: '#2c3e50',
          marginBottom: '25px',
          fontSize: '24px',
          fontWeight: '600',
          textAlign: 'center'
        }}>Action History</h2>
        
        {/* Filters Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          {/* Date Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="dateFilter" style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#34495e'
            }}>
              Date:
            </label>
            <input
              type="date"
              id="dateFilter"
              value={selectedDate}
              onChange={handleDateChange}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
          
          {/* Device Type Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="deviceTypeFilter" style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#34495e'
            }}>
              Device Type:
            </label>
            <select
              id="deviceTypeFilter"
              value={selectedDeviceType}
              onChange={handleDeviceTypeChange}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="">All Types</option>
              {deviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* Device ID Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="deviceIdFilter" style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#34495e'
            }}>
              Device ID:
            </label>
            <select
              id="deviceIdFilter"
              value={selectedDeviceId}
              onChange={handleDeviceIdChange}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="">All IDs</option>
              {deviceIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>
          
          {/* Clear Filters Button */}
          {(selectedDate || selectedDeviceType || selectedDeviceId) && (
            <button
              onClick={clearFilters}
              style={{
                alignSelf: 'flex-end',
                padding: '10px 15px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                ':hover': {
                  backgroundColor: '#c0392b'
                }
              }}
            >
              Clear All Filters
            </button>
          )}
        </div>
        
        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <p style={{
            textAlign: 'center',
            color: '#7f8c8d',
            padding: '40px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            {selectedDate || selectedDeviceType || selectedDeviceId 
              ? 'No records match the selected filters'
              : 'No actions recorded yet.'
            }
          </p>
        ) : (
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            {filteredRecords.map((record) => (
              <li key={record.id} style={{
                padding: '15px 20px',
                marginBottom: '10px',
                backgroundColor: '#ffffff',
                borderLeft: '4px solid #3498db',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'transform 0.2s',
                ':hover': {
                  transform: 'translateX(5px)'
                }
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '5px'
                  }}>{record.action.charAt(0).toUpperCase() + record.action.slice(1)}</span>
                  <span style={{
                    color: '#7f8c8d',
                    fontSize: '14px'
                  }}>
                    {record.device_type} (ID: {record.device_id})
                  </span>
                </div>
                <span style={{
                  color: '#7f8c8d',
                  fontSize: '14px',
                  whiteSpace: 'nowrap'
                }}>
                  {new Date(record.start_time).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ActionLog;