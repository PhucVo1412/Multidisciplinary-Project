import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActionLog = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchRecords = async () => {
      if (!token) {
        setError('Please log in to view your action log.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/records', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setRecords(response.data);
        setFilteredRecords(response.data); // Initially show all records
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

  // Filter records when selectedDate changes
  useEffect(() => {
    if (!selectedDate) {
      setFilteredRecords(records); // Show all records when no date is selected
      return;
    }

    const filtered = records.filter(record => {
      const recordDate = new Date(record.time).toISOString().split('T')[0];
      return recordDate === selectedDate;
    });
    setFilteredRecords(filtered);
  }, [selectedDate, records]);

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
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
        <div style={styles.filterContainer}>
          <label htmlFor="dateFilter" style={styles.filterLabel}>
            Filter by Date:
          </label>
          <input
            type="date"
            id="dateFilter"
            value={selectedDate}
            onChange={handleDateChange}
            style={styles.dateInput}
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              style={styles.clearButton}
            >
              Clear Filter
            </button>
          )}
        </div>
        {filteredRecords.length === 0 ? (
          <p style={styles.noRecords}>
            {selectedDate 
              ? `No actions recorded on ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : 'No actions recorded yet.'
            }
          </p>
        ) : (
          <ul style={styles.recordList}>
            {filteredRecords.map((record) => (
              <li key={record.id} style={styles.recordItem}>
                <span style={styles.actionText}>{record.action}</span>
                <span style={styles.timeText}>
                  {new Date(record.time).toLocaleString('en-US', {
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
  // Existing styles remain unchanged, adding new styles for filter
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 60px)',
    padding: '20px',
    boxSizing: 'border-box',
  },
  card: {
    width: '700px',
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
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    justifyContent: 'center',
  },
  filterLabel: {
    fontSize: '16px',
    color: '#333',
  },
  date976Input: {
    padding: '8px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    cursor: 'pointer',
  },
  clearButton: {
    padding: '8px 12px',
    fontSize: '14px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#333',
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
    padding: '10px 0',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '16px',
    color: '#333',
  },
  actionText: {
    fontWeight: 'normal',
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