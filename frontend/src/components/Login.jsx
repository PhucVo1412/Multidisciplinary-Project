import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between login and register

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });
      setMessage('Login successful!');
      
      // Save the token to localStorage
      localStorage.setItem('access_token', response.data.access_token);
      console.log('New token:', response.data.access_token);
      // Update the login state in App.jsx
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
        "role":"user",
        "action": "default_action",
        "access": "full",
      });
      setMessage('Registration successful! Please log in.');
      setIsRegistering(false); // Switch back to login after successful registration
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className= "login-form">
      <h2>Smart Home Protection Service</h2>
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <input className = "login-input"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input className = "login-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {isRegistering ? (
        <button onClick={handleRegister} className ="login-button">Register</button>
      ) : (
        <button onClick={handleLogin}className ="login-button">Login</button>
      )}
      <p>
        {isRegistering ? (
          <>
            Already have an account?{' '}
            <button onClick={() => setIsRegistering(false)} className ="login-button">Login here</button>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <button onClick={() => setIsRegistering(true)} className ="login-button">Register here</button>
          </>
        )}
      </p>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;