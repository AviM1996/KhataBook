import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { addCustomer } from '../../db/customer.service';
import { v4 as uuid } from 'uuid';

export default function AddCustomer() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔹 RxDB save
    await addCustomer({
      id: uuid(),
      name: form.name,
      address: form.address,
      phone: form.phone,
    });

    // 🔹 back to list
    navigate('/customers');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Add Customer
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Customer Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />

          <TextField
            label="Customer Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
              mt: 3,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate('/customers')}
            >
              Cancel
            </Button>

            <Button variant="contained" type="submit">
              Save Customer
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
