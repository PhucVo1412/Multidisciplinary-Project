import React, { useState } from 'react';
import axios from 'axios';

const Action = () => {
  const [deviceType, setDeviceType] = useState('');
  // const [deviceId, setDeviceId] = useState('');
  const deviceId = 1;
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
      setAction('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send command');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '30px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{
          color: '#2c3e50',
          marginBottom: '25px',
          fontSize: '24px',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          Device Control Panel
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Device Type Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="deviceType" style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#34495e'
            }}>
              Device Type:
            </label>
            <select
              id="deviceType"
              value={deviceType}
              onChange={(e) => {
                setDeviceType(e.target.value);
                setAction('');
              }}
              style={{
                padding: '12px 15px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
                backgroundColor: '#f9f9f9',
                transition: 'all 0.3s',
                ':focus': {
                  outline: 'none',
                  borderColor: '#3498db',
                  boxShadow: '0 0 0 2px rgba(52,152,219,0.2)'
                }
              }}
            >
              <option value="">Select device type</option>
              {deviceTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Device ID Input
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="deviceId" style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#34495e'
            }}>
              Device ID:
            </label>
            <input
              type="text"
              id="deviceId"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter numeric ID"
              style={{
                padding: '12px 15px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '15px',
                backgroundColor: '#f9f9f9',
                transition: 'all 0.3s',
                ':focus': {
                  outline: 'none',
                  borderColor: '#3498db',
                  boxShadow: '0 0 0 2px rgba(52,152,219,0.2)'
                }
              }}
            />
          </div> */}

          {/* Action Selection */}
          {deviceType && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="action" style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#34495e'
              }}>
                Action:
              </label>
              <select
                id="action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                style={{
                  padding: '12px 15px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '15px',
                  backgroundColor: '#f9f9f9',
                  transition: 'all 0.3s',
                  ':focus': {
                    outline: 'none',
                    borderColor: '#3498db',
                    boxShadow: '0 0 0 2px rgba(52,152,219,0.2)'
                  }
                }}
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
          disabled={!deviceType || !deviceId || !action || isSubmitting}
          style={{
            width: '100%',
            marginTop: '25px',
            padding: '14px',
            backgroundColor: !deviceType || !deviceId || !action ? '#bdc3c7' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: !deviceType || !deviceId || !action ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            ':hover': {
              backgroundColor: !deviceType || !deviceId || !action ? '#bdc3c7' : '#2980b9'
            }
          }}
        >
          {isSubmitting ? (
            <span>Sending Command...</span>
          ) : (
            <span>Send Command</span>
          )}
        </button>

        {/* Status Messages */}
        <div style={{ marginTop: '20px' }}>
          {error && <p style={{
            color: '#e74c3c',
            padding: '10px',
            backgroundColor: '#fadbd8',
            borderRadius: '6px',
            fontSize: '14px'
          }}>{error}</p>}
          {message && <p style={{
            color: '#27ae60',
            padding: '10px',
            backgroundColor: '#d5f5e3',
            borderRadius: '6px',
            fontSize: '14px'
          }}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Action;