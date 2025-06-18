import React, { useState } from 'react';
import axios from 'axios';
import LoginIcon from '@mui/icons-material/Login';

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Styles object
  const styles = {
    loginContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      backgroundColor: 'aqua',
      backgroundImage: 'url("https://thhome.vn/wp-content/uploads/2021/05/anh-biet-thu-12.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      fontFamily: 'Arial, sans-serif',
      position: 'fixed',
      top: 0,
      left: 0,
    },
    loginForm: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)', // More opaque for better contrast
      backdropFilter: 'blur(5px)',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
      width: '90%',
      maxWidth: '400px',
      textAlign: 'center',
      margin: '1rem',
      border: '1px solid rgba(255, 255, 255, 0.5)',
    },
    title: {
      color: '#2d3748', // Darker text for better readability
      marginBottom: '1.5rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      margin: '0.5rem 0',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '4px',
      fontSize: '1rem',
      color: 'black',
      boxSizing: 'border-box',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    button: {
      width: '100%',
      padding: '0.75rem',
      margin: '1rem 0',
      backgroundColor: '#3182ce', // Slightly darker blue
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    message: {
      color: '#4a5568',
      marginTop: '1rem',
      fontWeight: '500',
    },
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });
      setMessage('Login successful!');
      localStorage.setItem('access_token', response.data.access_token);
      setIsLoggedIn(true);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginForm}>
        <h2 style={styles.title}>Smart Home Protection Service</h2>
        <h2 style={styles.title}>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button
          onClick={handleLogin}
          style={{
            ...styles.button,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px', // Adds space between icon and text
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#2c5282')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#3182ce')}
        >
          <LoginIcon style={{ fontSize: '20px' }} />
          <span>Login</span>
        </button>
        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default Login;
