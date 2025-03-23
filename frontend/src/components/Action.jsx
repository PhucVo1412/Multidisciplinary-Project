import React, { useState } from 'react';
import axios from 'axios';

const Action = () => {
  // State for the action input and potential error/success messages
  const [action, setAction] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Assuming you store the JWT token in localStorage after login
  const token = localStorage.getItem('access_token');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!action.trim()) {
      setError('Please enter an action');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/records', // Adjust URL if your backend runs on a different port/domain
        { action },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT token in the request
            'Content-Type': 'application/json',
          },
        }
      );

      // Success handling
      setMessage(response.data.message);
      setAction(''); // Clear the input
      setError('');
      console.log('New record:', response.data.record);

    } catch (err) {
      // Error handling
      if (err.response) {
        setError(err.response.data.message || 'Failed to create record');
      } else {
        setError('An error occurred. Please try again.');
      }
      setMessage('');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }} class="button-container">

      <button>Button 1</button>
      <button>Button 2</button>
      <button>Button 3</button>
      <button>Button 4</button>

 

      {/* Display success or error messages */}
      {message && (
        <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>
      )}
      {error && (
        <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>
      )}
    </div>
  );
};

export default Action;