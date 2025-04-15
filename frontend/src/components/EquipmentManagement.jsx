import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const EquipmentManagement = () => {
  const [equipments, setEquipments] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [ledLcds, setLedLcds] = useState([]);
  const [lights, setLights] = useState([]);
  const [doors, setDoors] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const token = localStorage.getItem('access_token');
  
  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/equipment`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setEquipments(response.data);
    } catch (error) {
      showSnackbar('Error fetching equipment', 'error');
    }
  };

  // ... (keep all your existing fetch methods)

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
    setTimeout(() => setSnackbar({...snackbar, open: false}), 3000);
  };

  const handleOpenDialog = (type, equipment = null) => {
    setDialogType(type);
    if (equipment) {
      setFormData({
        name: equipment.name,
        description: equipment.description
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '30px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h2 style={{
            color: '#2c3e50',
            fontSize: '24px',
            fontWeight: '600',
            margin: 0
          }}>Equipment Management</h2>
          <button
            onClick={() => handleOpenDialog('create')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s',
              ':hover': {
                backgroundColor: '#2980b9'
              }
            }}
          >
            Add New Equipment
          </button>
        </div>

        <div style={{
          display: 'flex',
          gap: '20px'
        }}>
          {/* Equipment List */}
          <div style={{
            flex: '0 0 300px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '15px',
            maxHeight: '600px',
            overflowY: 'auto'
          }}>
            <h3 style={{
              color: '#34495e',
              fontSize: '18px',
              marginTop: 0,
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: '1px solid #ddd'
            }}>Equipment List</h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {equipments.map(equipment => (
                <li 
                  key={equipment.id}
                  onClick={() => {
                    setSelectedEquipment(equipment);
                    fetchEquipmentDetails(equipment.id);
                  }}
                  style={{
                    padding: '12px 15px',
                    marginBottom: '8px',
                    backgroundColor: selectedEquipment?.id === equipment.id ? '#e3f2fd' : 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderLeft: selectedEquipment?.id === equipment.id ? '4px solid #3498db' : '4px solid transparent',
                    ':hover': {
                      backgroundColor: '#e3f2fd'
                    }
                  }}
                >
                  <div style={{
                    fontWeight: '500',
                    color: '#2c3e50',
                    marginBottom: '5px'
                  }}>{equipment.name}</div>
                  <div style={{
                    color: '#7f8c8d',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>{equipment.description}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Equipment Details */}
          <div style={{
            flex: 1,
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            {selectedEquipment ? (
              <>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  paddingBottom: '15px',
                  borderBottom: '1px solid #eee'
                }}>
                  <h3 style={{
                    color: '#2c3e50',
                    fontSize: '20px',
                    margin: 0
                  }}>{selectedEquipment.name}</h3>
                  <div>
                    <button
                      onClick={() => handleOpenDialog('edit', selectedEquipment)}
                      style={{
                        padding: '8px 15px',
                        backgroundColor: '#f39c12',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        marginRight: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        ':hover': {
                          backgroundColor: '#e67e22'
                        }
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEquipment(selectedEquipment.id)}
                      style={{
                        padding: '8px 15px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        ':hover': {
                          backgroundColor: '#c0392b'
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p style={{
                  color: '#7f8c8d',
                  marginBottom: '25px'
                }}>{selectedEquipment.description}</p>

                {/* Tabs */}
                <div style={{
                  display: 'flex',
                  borderBottom: '1px solid #ddd',
                  marginBottom: '20px'
                }}>
                  {['LED/LCDs', 'Lights', 'Doors'].map((tab, index) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(index)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === index ? '#3498db' : 'transparent',
                        color: activeTab === index ? 'white' : '#7f8c8d',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: '500',
                        transition: 'all 0.3s',
                        borderRadius: '4px 4px 0 0',
                        marginRight: '5px'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div>
                  {activeTab === 0 && (
                    <div>
                      <h4 style={{
                        color: '#34495e',
                        marginTop: 0,
                        marginBottom: '15px'
                      }}>LED/LCD Panels</h4>
                      {ledLcds.length > 0 ? (
                        <ul style={{
                          listStyle: 'none',
                          padding: 0,
                          margin: 0,
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                          gap: '15px'
                        }}>
                          {ledLcds.map(device => (
                            <li key={device.id} style={{
                              backgroundColor: '#f8f9fa',
                              padding: '15px',
                              borderRadius: '6px',
                              borderLeft: '3px solid #3498db'
                            }}>
                              <div style={{
                                fontWeight: '500',
                                marginBottom: '5px'
                              }}>ID: {device.id}</div>
                              <div style={{
                                color: '#7f8c8d',
                                fontSize: '14px'
                              }}>Status: {device.status}</div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ color: '#95a5a6' }}>No LED/LCD devices found</p>
                      )}
                    </div>
                  )}

                  {activeTab === 1 && (
                    <div>
                      <h4 style={{
                        color: '#34495e',
                        marginTop: 0,
                        marginBottom: '15px'
                      }}>Lighting Controls</h4>
                      {lights.length > 0 ? (
                        <ul style={{
                          listStyle: 'none',
                          padding: 0,
                          margin: 0,
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                          gap: '15px'
                        }}>
                          {lights.map(device => (
                            <li key={device.id} style={{
                              backgroundColor: '#f8f9fa',
                              padding: '15px',
                              borderRadius: '6px',
                              borderLeft: '3px solid #f39c12'
                            }}>
                              <div style={{
                                fontWeight: '500',
                                marginBottom: '5px'
                              }}>ID: {device.id}</div>
                              <div style={{
                                color: '#7f8c8d',
                                fontSize: '14px'
                              }}>Status: {device.status}</div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ color: '#95a5a6' }}>No lighting devices found</p>
                      )}
                    </div>
                  )}

                  {activeTab === 2 && (
                    <div>
                      <h4 style={{
                        color: '#34495e',
                        marginTop: 0,
                        marginBottom: '15px'
                      }}>Door Controls</h4>
                      {doors.length > 0 ? (
                        <ul style={{
                          listStyle: 'none',
                          padding: 0,
                          margin: 0,
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                          gap: '15px'
                        }}>
                          {doors.map(device => (
                            <li key={device.id} style={{
                              backgroundColor: '#f8f9fa',
                              padding: '15px',
                              borderRadius: '6px',
                              borderLeft: '3px solid #e74c3c'
                            }}>
                              <div style={{
                                fontWeight: '500',
                                marginBottom: '5px'
                              }}>ID: {device.id}</div>
                              <div style={{
                                color: '#7f8c8d',
                                fontSize: '14px'
                              }}>Status: {device.status}</div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ color: '#95a5a6' }}>No door devices found</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '300px',
                color: '#95a5a6',
                fontSize: '18px'
              }}>
                Select an equipment to view details
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Snackbar */}
      {snackbar.open && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '15px 25px',
          backgroundColor: snackbar.severity === 'success' ? '#27ae60' : '#e74c3c',
          color: 'white',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          animation: 'fadeIn 0.3s'
        }}>
          {snackbar.message}
        </div>
      )}

      {/* Add/Edit Dialog */}
      {openDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{
              marginTop: 0,
              color: '#2c3e50',
              fontSize: '20px',
              marginBottom: '25px'
            }}>
              {dialogType === 'create' ? 'Add New Equipment' : 'Edit Equipment'}
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#7f8c8d',
                fontSize: '14px'
              }}>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#7f8c8d',
                fontSize: '14px'
              }}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  minHeight: '100px'
                }}
              />
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '15px'
            }}>
              <button
                onClick={handleCloseDialog}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f8f9fa',
                  color: '#2c3e50',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  ':hover': {
                    backgroundColor: '#e8e8e8'
                  }
                }}
              >
                Cancel
              </button>
              <button
                onClick={dialogType === 'create' ? handleCreateEquipment : handleUpdateEquipment}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  ':hover': {
                    backgroundColor: '#2980b9'
                  }
                }}
              >
                {dialogType === 'create' ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentManagement;