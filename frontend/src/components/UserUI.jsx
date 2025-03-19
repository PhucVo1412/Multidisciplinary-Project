import React, { useState, useEffect } from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import Action from './Action'; // Import the Action component
import UserManagement from './UserManagement'; // Import the UserManagement component
import ActionLog from './ActionLog'; // Import the ActionLog component

const UserUI = ({ setIsLoggedIn }) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [currentComponent, setCurrentComponent] = useState('dashboard');
  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  // Function to update the clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  // Function to handle clickable sections
  const handleButtonClick = (component) => {
    setCurrentComponent(component); // Update the current component
  };

  const renderComponent = () => {
    switch (currentComponent) {
      case 'action':
        return <Action />;
      case 'userManagement':
        return <UserManagement />;
      case 'actionLog':
        return <ActionLog />;
      default:
        return <h2>Welcome to the User Dashboard</h2>;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="user-container">
        <div className="dashboard-clock">{currentTime}</div>
        <button className="dashboard-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="sidebar">
        <h2>User Dashboard</h2>
        <button
          className="sidebar-button"
          onClick={() => handleButtonClick('action')}
        >
          Action
        </button>
        <button
          className="sidebar-button"
          onClick={() => handleButtonClick('userManagement')}
        >
          User Management
        </button>
        <button
          className="sidebar-button"
          onClick={() => handleButtonClick('actionLog')}
        >
          Action Log
        </button>
      </div>
      <div style={{
  display: 'flex',
  marginLeft: '250px',
  justifyContent: 'center', // Centers horizontally
  alignItems: 'center', // Centers vertically
  position: 'relative'
  }}>
        {renderComponent()}
      </div>
    </div>
  );
};
export default UserUI;