import React, { useState, useEffect } from 'react';
import axios from 'axios';

const colors = {
  primary: '#2D3748',
  secondary: '#4A5568',
  success: '#48BB78',
  error: '#F56565',
  accent: '#4299E1',
  background: '#F7FAFC',
  border: '#E2E8F0',
  textMuted: '#718096',
};

const Action = () => {
  const [deviceStates, setDeviceStates] = useState({ door: false, light: false });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [notificationsLog, setNotificationsLog] = useState([]);

  const deviceTypes = ['door', 'light'];
  const token = localStorage.getItem('access_token');
  const deviceId = 1;

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/open_door_logs/latest', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const formattedLogs = response.data.map(log => ({
        time: new Date(log.timestamp).toLocaleTimeString(),
        text: `Log: ${log.name}`
      }));
      setNotificationsLog(formattedLogs);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleToggle = async (type) => {
    const newState = !deviceStates[type];
    const action =
      type === 'door'
        ? newState ? 'open' : 'close'
        : newState ? 'turn on' : 'turn off';

    setDeviceStates(prev => ({ ...prev, [type]: newState }));
    setError('');
    setMessage('');

    try {
      await axios.post(
        'http://localhost:5000/controls',
        {
          action: `${action} ${type}`,
          device_type: type,
          device_id: deviceId,
          equipment_id: deviceId,
          status: 'pending'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage(`Command successfully sent: ${action} ${type}`);
      await fetchLogs(); // refresh notifications after action
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send command');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Smart Home Control Center</h1>
        <div style={styles.statusBadge}>
          <span style={styles.statusDot} />
          Connected
        </div>
      </div>

      <div style={styles.grid}>
        {deviceTypes.map(type => {
          const isOn = deviceStates[type];
          const label = type.charAt(0).toUpperCase() + type.slice(1);

          return (
            <div key={type} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.deviceIcon(type)}>
                  {type === 'door' ? '🚪' : '💡'}
                </div>
                <h3 style={styles.cardTitle}>{label} Controller</h3>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.statusIndicator(isOn)}>
                  {isOn ? 'Active' : 'Inactive'}
                </div>
                <div style={styles.toggleContainer}>
                  <input
                    type="checkbox"
                    checked={isOn}
                    onChange={() => handleToggle(type)}
                    style={styles.hiddenCheckbox}
                  />
                  <div style={styles.toggleTrack(isOn)}>
                    <div style={styles.toggleThumb(isOn)} />
                  </div>
                </div>
              </div>

              <div style={styles.cardFooter}>
                {/* <span style={styles.lastUpdated}>Device Id: 1</span> */}
              </div>
            </div>
          );
        })}

        {/* Notifications Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.deviceIcon('notify')}>🔔</div>
            <h3 style={styles.cardTitle}>Notifications</h3>
          </div>
          <div style={{ paddingLeft: '0.5rem' }}>
            {notificationsLog.length === 0 ? (
              <p style={{ color: colors.textMuted }}>No recent actions</p>
            ) : (
              notificationsLog.map((note, i) => (
                <div key={i} style={styles.notificationItem}>
                  <span style={styles.notificationTime}>{note.time}</span>
                  <span>{note.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Status Panel */}
        <div style={styles.statusPanel}>
          <div style={styles.panelTitle}>System Overview</div>
          <div style={styles.statusItem}>
            <span>Total Devices</span>
            <span>2</span>
          </div>
          <div style={styles.statusItem}>
            <span>Active Devices</span>
            <span>{Object.values(deviceStates).filter(Boolean).length}</span>
          </div>
        </div>
      </div>

      <div style={styles.notifications}>
        {message && (
          <div style={styles.message}>
            <span style={styles.messageIcon}>✓</span>
            {message}
          </div>
        )}
        {error && (
          <div style={styles.error}>
            <span style={styles.messageIcon}>⚠</span>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '2rem',
    borderRadius: '1rem',
    backgroundColor: colors.background,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2.5rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    color: colors.primary,
    margin: 0,
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#E2E8F0',
    borderRadius: '2rem',
    fontSize: '0.9rem',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: colors.success,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  deviceIcon: (type) => ({
    fontSize: '2.5rem',
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor:
      type === 'door' ? '#FEEBC8'
      : type === 'light' ? '#C3DDFD'
      : '#FAF089',
  }),
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: 0,
    color: colors.primary,
  },
  cardBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  statusIndicator: (isOn) => ({
    fontSize: '1.1rem',
    fontWeight: 500,
    color: isOn ? colors.success : colors.error,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  }),
  toggleContainer: {
    position: 'relative',
    width: '64px',
    height: '34px',
  },
  hiddenCheckbox: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    zIndex: 1,
  },
  toggleTrack: (isOn) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: isOn ? colors.success : colors.border,
    borderRadius: '17px',
    transition: 'all 0.2s ease',
  }),
  toggleThumb: (isOn) => ({
    position: 'absolute',
    top: '2px',
    left: isOn ? '32px' : '2px',
    width: '30px',
    height: '30px',
    backgroundColor: 'white',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
  }),
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: colors.textMuted,
  },
  statusPanel: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    gridColumn: '1 / -1',
  },
  panelTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: '0 0 1rem 0',
    color: colors.primary,
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0',
    borderBottom: `1px solid ${colors.border}`,
  },
  batteryIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  batteryLevel: {
    width: '20px',
    height: '10px',
    borderRadius: '2px',
    backgroundColor: colors.success,
    position: 'relative',
    marginRight: '0.5rem',
  },
  signalBars: {
    display: 'flex',
    gap: '3px',
    alignItems: 'flex-end',
    height: '20px',
  },
  signalBar: (i) => ({
    width: '4px',
    height: `${i * 5}px`,
    backgroundColor: i <= 3 ? colors.accent : colors.border,
    borderRadius: '2px',
  }),
  notificationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${colors.border}`,
    padding: '0.5rem 0',
    fontSize: '0.95rem',
  },
  notificationTime: {
    color: colors.textMuted,
    marginRight: '1rem',
    fontSize: '0.85rem',
  },
  notifications: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  message: {
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: '#F0FFF4',
    color: colors.success,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1rem',
  },
  error: {
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: '#FFF5F5',
    color: colors.error,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1rem',
  },
  messageIcon: {
    fontSize: '1.25rem',
  },
};

export default Action;