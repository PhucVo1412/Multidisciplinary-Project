import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  Divider, 
  Grid, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  Paper, 
  TextField, 
  Typography,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Tv, 
  Lightbulb, 
  DoorFront, 
  Close,
  Save,
  Cancel
} from '@mui/icons-material';

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
  // Fetch all equipment on component mount
  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/equipment`,{
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

  const fetchEquipmentDetails = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/equipment/${id}`,{
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setSelectedEquipment(response.data);
      fetchLedLcds(id);
      fetchLights(id);
      fetchDoors(id);
    } catch (error) {
      showSnackbar('Error fetching equipment details', 'error');
      console.error('Error fetching equipment details:', error);
    }
  };

  const fetchLedLcds = async (equipmentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/equipment/${equipmentId}/ledlcd`,{
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setLedLcds(response.data);
    } catch (error) {
      showSnackbar('Error fetching LED/LCDs', 'error');
      console.error('Error fetching LED/LCDs:', error);
    }
  };

  const fetchLights = async (equipmentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/equipment/${equipmentId}/lights`,{
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setLights(response.data);
    } catch (error) {
      showSnackbar('Error fetching lights', 'error');
      console.error('Error fetching lights:', error);
    }
  };

  const fetchDoors = async (equipmentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/equipment/${equipmentId}/doors`,{
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setDoors(response.data);
    } catch (error) {
      showSnackbar('Error fetching doors', 'error');
      console.error('Error fetching doors:', error);
    }
  };

  const handleCreateEquipment = async () => {
    try {
      await axios.post(`${API_BASE_URL}/equipment`, formData);
      showSnackbar('Equipment created successfully', 'success');
      fetchEquipments();
      handleCloseDialog();
    } catch (error) {
      showSnackbar('Error creating equipment', 'error');
      console.error('Error creating equipment:', error);
    }
  };

  const handleUpdateEquipment = async () => {
    try {
      await axios.put(`${API_BASE_URL}/equipment/${selectedEquipment.id}`, formData);
      showSnackbar('Equipment updated successfully', 'success');
      fetchEquipments();
      if (selectedEquipment) {
        fetchEquipmentDetails(selectedEquipment.id);
      }
      handleCloseDialog();
    } catch (error) {
      showSnackbar('Error updating equipment', 'error');
      console.error('Error updating equipment:', error);
    }
  };


  return (
    <Box sx={{ p: 3 }}>
      {/* Equipment List and Details JSX (same as before) */}

    </Box>
  );
};

export default EquipmentManagement;