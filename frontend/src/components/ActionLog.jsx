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
      filtered = filtered.filter(record => record.device_id === selectedDeviceId);
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
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Loading your action log...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>Your Action Log</h2>
        
        {/* Filters Section */}
        <div style={styles.filtersContainer}>
          {/* Date Filter */}
          <div style={styles.filterGroup}>
            <label htmlFor="dateFilter" style={styles.filterLabel}>
            Date:
            </label>
            <input
              type="date"
              id="dateFilter"
              value={selectedDate}
              onChange={handleDateChange}
              style={styles.filterInput}
            />
          </div>
          
          {/* Device Type Filter */}
          <div style={styles.filterGroup}>
            <label htmlFor="deviceTypeFilter" style={styles.filterLabel}>
            Device Type:
            </label>
            <select
              id="deviceTypeFilter"
              value={selectedDeviceType}
              onChange={handleDeviceTypeChange}
              style={styles.filterInput}
            >
              <option value="">All Types</option>
              {deviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* Device ID Filter */}
          <div style={styles.filterGroup}>
            <label htmlFor="deviceIdFilter" style={styles.filterLabel}>
              Device ID:
            </label>
            <select
              id="deviceIdFilter"
              value={selectedDeviceId}
              onChange={handleDeviceIdChange}
              style={styles.filterInput}
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
              style={styles.clearButton}
            >
              Clear All Filters
            </button>
          )}
        </div>
        
        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <p style={styles.noRecords}>
            {selectedDate || selectedDeviceType || selectedDeviceId 
              ? 'No records match the selected filters'
              : 'No actions recorded yet.'
            }
          </p>
        ) : (
          <ul style={styles.recordList}>
            {filteredRecords.map((record) => (
              <li key={record.id} style={styles.recordItem}>
                <div style={styles.recordDetails}>
                  <span style={styles.actionText}>{record.action}</span>
                  <span style={styles.deviceInfo}>
                    {record.action} (ID: {record.device_id})
                  </span>
                </div>
                <span style={styles.timeText}>
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

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 60px)',
    padding: '20px',
    boxSizing: 'border-box',
  },
  card: {
    width: '800px',
    maxWidth: '90%',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    boxSizing: 'border-box',
  },
  header: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: '20px',
  },
  filtersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  filterLabel: {
    fontSize: '14px',
    color: '#333',
    minWidth: '120px',
  },
  filterInput: {
    padding: '8px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    flex: 1,
  },
  clearButton: {
    padding: '8px 12px',
    fontSize: '14px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#333',
    marginTop: '10px',
    alignSelf: 'flex-start',
  },
  recordList: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
  },
  recordItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #e0e0e0',
  },
  recordDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  actionText: {
    fontWeight: 'normal',
    fontSize: '16px',
  },
  deviceInfo: {
    fontSize: '14px',
    color: '#666',
  },
  timeText: {
    fontSize: '14px',
    color: '#666',
  },
  noRecords: {
    fontSize: '16px',
    color: '#666',
    textAlign: 'center',
    padding: '20px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 60px)',
  },
  loadingText: {
    fontSize: '16px',
    color: '#333',
  },
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 60px)',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: '16px',
  },
};

export default ActionLog;