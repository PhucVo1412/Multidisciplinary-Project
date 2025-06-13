import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FixedSizeList as List } from 'react-window';

const ActionLog = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [deviceIds, setDeviceIds] = useState([]);
  const [listHeight, setListHeight] = useState(600);

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
        const types = [...new Set(response.data.map(record => record.device_type))];
        const ids = [...new Set(response.data.map(record => record.device_id))];
        setDeviceTypes(types);
        setDeviceIds(ids);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [token]);

  useEffect(() => {
    const calculateHeight = () => {
      const viewportHeight = window.innerHeight;
      setListHeight(Math.min(600, viewportHeight - 300));
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  useEffect(() => {
    let filtered = [...records];
    
    if (selectedDate) {
      filtered = filtered.filter(record => 
        new Date(record.start_time).toISOString().split('T')[0] === selectedDate
      );
    }
    
    if (selectedDeviceType) {
      filtered = filtered.filter(record => record.device_type === selectedDeviceType);
    }
    
    if (selectedDeviceId) {
      filtered = filtered.filter(record => 
        Number(record.device_id) === Number(selectedDeviceId)
      );
    }
    
    setFilteredRecords(filtered);
  }, [selectedDate, selectedDeviceType, selectedDeviceId, records]);

  const handleDateChange = (e) => setSelectedDate(e.target.value);
  const handleDeviceTypeChange = (e) => setSelectedDeviceType(e.target.value);
  const handleDeviceIdChange = (e) => setSelectedDeviceId(e.target.value);

  const clearFilters = () => {
    setSelectedDate('');
    setSelectedDeviceType('');
    setSelectedDeviceId('');
  };

  const Row = ({ index, style }) => {
    const record = filteredRecords[index];
    return (
      <div style={{ 
        ...style,
        padding: '15px 20px',
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
          }}>
            {record.action.charAt(0).toUpperCase() + record.action.slice(1)}
          </span>
          <span style={{ color: '#7f8c8d', fontSize: '14px' }}>
            {record.device_type} (ID: {record.device_id})
          </span>
        </div>
        <span style={{ color: '#7f8c8d', fontSize: '14px', whiteSpace: 'nowrap' }}>
          {new Date(record.start_time).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Loading your action log...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="content-wrapper">
        <h2 className="header">Action History</h2>
        
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="dateFilter">Date:</label>
            <input
              type="date"
              id="dateFilter"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="deviceTypeFilter">Device Type:</label>
            <select
              id="deviceTypeFilter"
              value={selectedDeviceType}
              onChange={handleDeviceTypeChange}
            >
              <option value="">All Types</option>
              {deviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="deviceIdFilter">Device ID:</label>
            <select
              id="deviceIdFilter"
              value={selectedDeviceId}
              onChange={handleDeviceIdChange}
            >
              <option value="">All IDs</option>
              {deviceIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>
          
          {(selectedDate || selectedDeviceType || selectedDeviceId) && (
            <button
              onClick={clearFilters}
              className="clear-button"
            >
              Clear All Filters
            </button>
          )}
        </div>
        
        {filteredRecords.length === 0 ? (
          <p className="empty-message">
            {selectedDate || selectedDeviceType || selectedDeviceId 
              ? 'No records match the selected filters'
              : 'No actions recorded yet.'
            }
          </p>
        ) : (
          <div className="list-container">
            <List
              height={listHeight}
              itemCount={filteredRecords.length}
              itemSize={80}
              width="100%"
            >
              {Row}
            </List>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = `
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .loading-text {
    color: #7f8c8d;
    font-size: 18px;
  }

  .error-container {
    padding: 20px;
    background-color: #fadbd8;
    color: #e74c3c;
    border-radius: 8px;
    margin: 20px;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px;
  }

  .content-wrapper {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    padding: 30px;
  }

  .header {
    color: #2c3e50;
    margin-bottom: 25px;
    font-size: 24px;
    font-weight: 600;
    text-align: center;
  }

  .filters-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .filter-group label {
    font-size: 14px;
    font-weight: 500;
    color: #34495e;
  }

  .filter-group input, .filter-group select {
    padding: 10px 12px;
    border-radius: 6px;
    border: 1px solid #ddd;
    font-size: 14px;
    background-color: #ffffff;
  }

  .clear-button {
    align-self: flex-end;
    padding: 10px 15px;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .clear-button:hover {
    background-color: #c0392b;
  }

  .empty-message {
    text-align: center;
    color: #7f8c8d;
    padding: 40px;
    background-color: #f8f9fa;
    border-radius: 8px;
  }

  .list-container {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 8px;
  }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ActionLog;