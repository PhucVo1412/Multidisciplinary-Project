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
    return <div className="text-red-500">{error}</div>;
  }

  return <div class="ucontainer">
  <div class="uheader">
      <h1>User Profile</h1>
      <p>View and manage your account information</p>
  </div>

  <div class="uuser-profile">
      <img src="../assets/Sample_User_Icon.png" alt="Profile Picture" class="profile-pic"/>
      
      <div class="uuser-details">
          <div class="udetail-row">
              <div class="udetail-label">Full Name:</div>
              <div class="udetail-value">John Doe</div>
          </div>
          <div class="udetail-row">
              <div class="udetail-label">Email:</div>
              <div class="udetail-value">john.doe@example.com</div>
          </div>
          <div class="udetail-row">
              <div class="udetail-label">Phone:</div>
              <div class="udetail-value">(123) 456-7890</div>
          </div>
          <div class="udetail-row">
              <div class="udetail-label">Address:</div>
              <div class="udetail-value">123 Main St, Anytown, USA</div>
          </div>
          <div class="udetail-row">
              <div class="udetail-label">Member Since:</div>
              <div class="udetail-value">January 15, 2020</div>
          </div>
          <div class="udetail-row">
              <div class="udetail-label">Account Status:</div>
              <div class="udetail-value">Active</div>
          </div>
      </div>
  </div>

  <div class="uactions">
      <button class="ubtn ubtn-edit">Edit Profile</button>
      <button class="ubtn ubtn-settings">Account Settings</button>
  </div>
</div>;
    
};


export default UserManagement;