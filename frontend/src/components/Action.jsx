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
  const [latestUnknownLog, setLatestUnknownLog] = useState(null);
  const [systemOverviewLogs, setSystemOverviewLogs] = useState([]);

  const token = localStorage.getItem('access_token');
  const deviceId = 1;
  const deviceTypes = ['door', 'light'];

  const fetchLogs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/open_door_logs/latest', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const unknownLog = res.data.latest_unknown_log?.[0];
      if (unknownLog) {
        setLatestUnknownLog({
          time: new Date(unknownLog.timestamp).toLocaleTimeString(),
          name: unknownLog.name,
          image: unknownLog.unknown_person_image || null,
        });
      } else {
        setLatestUnknownLog(null);
      }

      const knownLogs = res.data.known_logs.map(log => ({
        time: new Date(log.timestamp).toLocaleTimeString(),
        name: log.name,
      }));
      setSystemOverviewLogs(knownLogs);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleToggle = async (type) => {
    const newState = !deviceStates[type];
    const action = type === 'door' ? (newState ? 'open' : 'close') : (newState ? 'turn on' : 'turn off');

    setDeviceStates(prev => ({ ...prev, [type]: newState }));
    setMessage('');
    setError('');

    try {
      await axios.post('http://localhost:5000/controls', {
        action: `${action} ${type}`,
        device_type: type,
        device_id: deviceId,
        equipment_id: deviceId,
        status: 'pending'
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage(`Command sent: ${action} ${type}`);
      await fetchLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Command failed');
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
            </div>
          );
        })}

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.deviceIcon('notify')}>🔔</div>
            <h3 style={styles.cardTitle}>Warning</h3>
          </div>
          <div style={{ paddingLeft: '0.5rem' }}>
            {!latestUnknownLog ? (
              <p style={{ color: colors.textMuted }}>No unknown person detected</p>
            ) : (
              <div style={{ ...styles.notificationItem, flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={styles.notificationTime}>{latestUnknownLog.time}</span>
                  <span>Unknown detected</span>
                </div>
                {latestUnknownLog.image && (
                  <img
                    src={latestUnknownLog.image}
                    alt="Unknown Person"
                    style={{
                      marginTop: '0.5rem',
                      maxWidth: '100%',
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

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
          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ ...styles.panelTitle, fontSize: '1rem' }}>Recent Door Open with FaceID</h4>
            {systemOverviewLogs.length === 0 ? (
              <p style={{ color: colors.textMuted }}>No known person entries yet</p>
            ) : (
              systemOverviewLogs.map((log, index) => (
                <div key={index} style={styles.statusItem}>
<span>{log.name}</span>
                  <span>{log.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={styles.notifications}>
        {message && (
          <div style={styles.message}>
            <span style={styles.messageIcon}>✓</span> {message}
          </div>
        )}
        {error && (
          <div style={styles.error}>
            <span style={styles.messageIcon}>⚠</span> {error}
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
      type === 'door' ? '#FEEBC8' :
      type === 'light' ? '#C3DDFD' :
      '#FAF089',
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
  statusPanel: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    gridColumn: '1 / -1',
  },
  panelTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: colors.primary,
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0',
    borderBottom: `1px solid ${colors.border}`,
  },
  notificationItem: {
    width: '100%',
    borderBottom: `1px solid ${colors.border}`,
    padding: '0.5rem 0',
    fontSize: '0.95rem',
  },
  notificationTime: {
    color: colors.textMuted,
    fontSize: '0.85rem',
    marginRight: '1rem',
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