import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

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
      backgroundImage: 'url("https://scontent.fsgn5-14.fna.fbcdn.net/v/t39.30808-6/480566140_937548405231812_434531939589231469_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=86c6b0&_nc_ohc=xDiOn9LLNLsQ7kNvwEVlQIA&_nc_oc=AdmojOiToT-q4YZ0320OrgEUU6q1mQi-3a4OKggNhVQ-DMusChmQ6N5eL3azRhRdtHaiWhs14SF6SifyFBZrVRia&_nc_zt=23&_nc_ht=scontent.fsgn5-14.fna&_nc_gid=N2KIVCMQkeRRzkPmLU3Axw&oh=00_AfGvEdTBaq3Wa8aKgHUi8KAPMNkKiZZR1mQRouj6ATE45g&oe=6803EA1A")',
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
    linkButton: {
      background: 'none',
      border: 'none',
      color: '#3182ce', // Matching the button color
      cursor: 'pointer',
      padding: '0',
      marginLeft: '0.25rem',
      textDecoration: 'underline',
      fontSize: '0.9rem',
    },
    message: {
      color: '#grey',
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

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5000/register', {
        username,
        password,
        role: 'user',
        action: 'default_action',
        access: 'full',
      });
      setMessage('Registration successful! Please log in.');
      setIsRegistering(false);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginForm}>
        <h2 style={styles.title}>Smart Home Protection Service</h2>
        <h2 style={styles.title}>{isRegistering ? 'Register' : 'Login'}</h2>
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
        {isRegistering ? (
          <button 
            onClick={handleRegister} 
            style={styles.button}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2c5282'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3182ce'}
          >
            Register
          </button>
        ) : (
          <button 
            onClick={handleLogin} 
            style={styles.button}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2c5282'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3182ce'}
          >
            Login
          </button>
        )}
        <p style={{color: '#4a5568', fontSize: '0.9rem'}}>
          {isRegistering ? (
            <>
              Already have an account?{' '}
              <button
                style={styles.linkButton}
                onClick={() => setIsRegistering(false)}
              >
                Login here
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                style={styles.linkButton}
                onClick={() => setIsRegistering(true)}
              >
                Register here
              </button>
            </>
          )}
        </p>
        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default Login;