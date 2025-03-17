import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Items = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [message, setMessage] = useState('');

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/items', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to fetch items');
    }
  };

  const addItem = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/items',
        { name: newItem },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      setNewItem('');
      fetchItems(); // Refresh the list
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add item');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div>
      <h2>Your Items</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="New Item"
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
      />
      <button onClick={addItem}>Add Item</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Items;