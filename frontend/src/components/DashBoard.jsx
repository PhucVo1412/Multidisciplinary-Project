import React,{ useState }  from "react";




const API_BASE_URL = 'http://localhost:5000';
function DashBoard(props){
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
  const [equipment, setEquipment] = useState([]);

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
    
    const fetchEquipment = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/equipment`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setEquipment(response.data);
        } catch (error) {
            console.error("Error fetching equipment data:", error);
        }
    };
    const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    setIsOn(prev => !prev);
  };

  return (
    <div>
      <label className="switch">
        <input type="checkbox" checked={isOn} onChange={handleToggle} />
        <span className="slider"></span>
      </label>
      <span className="label">{isOn ? 'On' : 'Off'}</span>
      <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 34px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #4caf50;
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }

        .label {
          margin-left: 10px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
    

};

export default DashBoard;