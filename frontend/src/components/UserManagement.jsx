import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [information, setInformation] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const API_BASE_URL = 'http://localhost:5000';
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchInfo = async () => {
      if (!token) {
        setError('Please log in to view your user information.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setInformation(response.data);
        setLastUpdated(new Date().toLocaleString());
        setError('');
      } catch (err) {
        if (err.response) {
          setError(err.response.data.message || 'Failed to fetch user information');
        } else {
          setError('An error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [token]);

  if (loading) {
    return <div>Loading user information...</div>;
  }

  if (error) {
    return <div >{error}</div>;
  }

  return <div >
  <div >
      <h1>User Profile</h1>
      <p>View and manage your account information</p>
  </div>

  <div >
      <img src="../assets/Sample_User_Icon.png" alt="Profile Picture" />
      
      <div >
          <div>
              <div>Full Name:</div>
              <div>John Doe</div>
          </div>
          <div >
              <div>Email:</div>
              <div>john.doe@example.com</div>
          </div>
          <div>
              <div>Phone:</div>
              <div>(123) 456-7890</div>
          </div>
          <div>
              <div >Address:</div>
              <div >123 Main St, Anytown, USA</div>
          </div>
          <div >
              <div >Member Since:</div>
              <div >January 15, 2020</div>
          </div>
          <div >
              <div >Account Status:</div>
              <div >Active</div>
          </div>
      </div>
  </div>

  <div >
      <button >Edit Profile</button>
      <button >Account Settings</button>
  </div>
</div>;
    
};


export default UserManagement;