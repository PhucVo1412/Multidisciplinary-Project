import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActionLog = () => {
  // State for records, loading status, and error messages
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get JWT token from localStorage
  const token = localStorage.getItem('access_token');

  // Fetch records when component mounts
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

        setRecords(response.data); // Assuming the backend returns an array of records
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

  // Render loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Loading your action log...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>{error}</p>
      </div>
    );
  }

  // Render action log
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>Your Action Log</h2>
        {records.length === 0 ? (
          <p style={styles.noRecords}>No actions recorded yet.</p>
        ) : (
          <ul style={styles.recordList}>
            {records.map((record) => (
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

// Inline styles to match the screenshot and make the card larger
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 60px)', // Adjust for header height (assuming 60px for top bar)
    padding: '20px',
    boxSizing: 'border-box',
  },
  card: {
    width: '700px', // Increased width to make it larger
    maxWidth: '90%', // Ensure it doesn't overflow on smaller screens
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