import React, { useState } from 'react';
import axios from 'axios';

const Action = () => {
  const [deviceType, setDeviceType] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [action, setAction] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deviceTypes = ['door', 'led', 'light'];
  const actions = {
    door: ['open', 'close'],
    led: ['turn on', 'turn off'],
    light: ['turn on', 'turn off']
  };

  const token = localStorage.getItem('access_token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!deviceType || !deviceId || !action) {
      setError('Please complete all selections');
      return;
    }

    if (!/^\d+$/.test(deviceId)) {
      setError('Device ID must be a positive integer');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/controls',
        {
          action: `${action} ${deviceType}`,
          device_type: deviceType,
          device_id: parseInt(deviceId),
          equipment_id: parseInt(deviceId),
          status: "pending"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage(`Action sent: ${action} ${deviceType} #${deviceId}`);
      setDeviceType('');
      setDeviceId('');
      setAction('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send command');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>Device Control</h2>
        
        <div style={styles.filterContainer}>
          {/* Device Type Filter */}
          <div style={styles.filterGroup}>
            <label htmlFor="deviceType" style={styles.filterLabel}>
              Device Type:
            </label>
            <select
              id="deviceType"
              value={deviceType}
              onChange={(e) => {
                setDeviceType(e.target.value);
                setAction('');
              }}
              style={styles.filterInput}
            >
              <option value="">Select type</option>
              {deviceTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Device ID Input */}
          <div style={styles.filterGroup}>
            <label htmlFor="deviceId" style={styles.filterLabel}>
              Device ID:
            </label>
            <input
              type="text"
              id="deviceId"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter ID"
              style={styles.filterInput}
            />
          </div>

          {/* Action Selection */}
          {deviceType && (
            <div style={styles.filterGroup}>
              <label htmlFor="action" style={styles.filterLabel}>
                Action:
              </label>
              <select
                id="action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                style={styles.filterInput}
              >
                <option value="">Select action</option>
                {actions[deviceType]?.map(act => (
                  <option key={act} value={act}>
                    {act.charAt(0).toUpperCase() + act.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          style={styles.submitButton}
          disabled={!deviceType || !deviceId || !action || isSubmitting}
        >
          {isSubmitting ? (
            <span style={styles.buttonText}>Sending...</span>
          ) : (
            <span style={styles.buttonText}>Send Command</span>
          )}
        </button>

        {/* Status Messages */}
        <div style={styles.messageContainer}>
          {error && <p style={styles.errorText}>{error}</p>}
          {message && <p style={styles.successText}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

// Styles matching your ActionLog component exactly
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
    width: '500px',
    maxWidth: '90%',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    padding: '25px',
    boxSizing: 'border-box',
  },
  header: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: '25px',
  },
  filterContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: '14px',
    color: '#333',
    width: '100px',
    flexShrink: 0,
  },
  filterInput: {
    padding: '10px 12px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    flex: 1,
    boxSizing: 'border-box',
    backgroundColor: "#169976",
  },
  submitButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s',
  },
  buttonText: {
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  messageContainer: {
    marginTop: '15px',
    textAlign: 'center',
    minHeight: '20px',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: '14px',
    margin: 0,
  },
  successText: {
    color: '#388e3c',
    fontSize: '14px',
    margin: 0,
  },
};

export default Action;