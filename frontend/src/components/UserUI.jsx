import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Action from './Action';
import UserManagement from './UserManagement';
import ActionLog from './ActionLog';
import EquipmentManagement from './EquipmentManagement';
import AdminManagement from './AdminManagement'; // Make sure to create this component

const API_BASE_URL = 'http://localhost:5000';

const UserUI = ({ setIsLoggedIn }) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [currentComponent, setCurrentComponent] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    let isMounted = true; // Track if component is mounted
    let intervalId = null;
  
    const fetchUserInfo = async () => {
      if (!token || !isMounted) return;
      
      try {
        const response = await axios.get(`${API_BASE_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (isMounted) {
          setUserInfo(response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to fetch user information');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
  
    // Initial fetch
    fetchUserInfo();
  
    // Set up polling
    intervalId = setInterval(fetchUserInfo, 1000);
  
    // Cleanup function
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleButtonClick = (component) => {
    setCurrentComponent(component);
    setIsSidebarOpen(false);
  };

  const renderComponent = () => {
    switch (currentComponent) {
      case 'action':
        return <Action />;
      case 'userManagement':
        return <UserManagement />;
      case 'actionLog':
        return <ActionLog />;
      case 'equipment':
        return <EquipmentManagement />;
      case 'adminManagement':
        return <AdminManagement />;
      default:
        return <h2 style={{ padding: '20px', color: '#333' }}>Welcome to the Dashboard</h2>;
    }
  };

  // Navigation items - base items for all users
  const navItems = [
    { label: 'Action', key: 'action' },
    { label: 'Action Log', key: 'actionLog' },
    { label: 'Equipment Management', key: 'equipment' },
    { label: 'User Management', key: 'userManagement' }
  ];

  // Add admin-specific items if user is admin
  if (userInfo?.type === 'admin') {
    navItems.push(
      { label: 'Admin Management', key: 'adminManagement' }
    );
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading user information...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#fadbd8', 
        color: '#e74c3c', 
        borderRadius: '8px', 
        margin: '20px', 
        textAlign: 'center' 
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#2c3e50',
        color: 'white',
        minHeight: '100vh',
        position: 'fixed',
        left: isSidebarOpen ? '0' : '-250px',
        transition: 'left 0.3s ease',
        zIndex: 1000
      }}>
        <nav style={{ padding: '20px 0' }}>
          {/* Dashboard Heading */}
          <div style={{
            color: '#ffffff',
            padding: '15px 20px',
            fontSize: '18px',
            fontWeight: 'bold',
            borderBottom: '1px solid #34495e',
            marginBottom: '10px',
            letterSpacing: '0.5px'
          }}>
            {userInfo?.type === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
          </div>
          
          {/* Navigation Buttons */}
          {navItems.map(({ label, key }) => (
            <button
              key={key}
              onClick={() => handleButtonClick(key)}
              style={{
                display: 'block',
                width: '90%',
                margin: '0 auto 8px',
                padding: '12px 20px',
                backgroundColor: currentComponent === key ? '#ff7e33' : 'rgba(255,255,255,0.15)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '15px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                ':hover': {
                  backgroundColor: currentComponent === key ? '#ff7e33' : 'rgba(59, 21, 228, 0.25)',
                  transform: 'translateX(5px)'
                }
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: isSidebarOpen ? '250px' : '0',
        width: '100%',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Topbar */}
        <header style={{
          backgroundColor: '#3498db',
          color: 'white',
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                marginRight: '20px',
                cursor: 'pointer'
              }}
            >
              {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <h1 style={{ margin: 0, fontSize: '24px' }}>
              {userInfo?.type === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '16px' }}>{currentTime}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>{userInfo?.name || 'New User'}</span>
              <span style={{ 
                backgroundColor: userInfo?.type === 'admin' ? '#e74c3c' : '#2ecc71',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {userInfo?.type === 'admin' ? 'ADMIN' : 'USER'}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'background-color 0.3s',
                  ':hover': {
                    backgroundColor: '#c0392b'
                  }
                }}
              >
                <LogoutIcon fontSize="small" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '20px' }}>
          {renderComponent()}
        </main>
      </div>
    </div>
  );
};

export default UserUI;