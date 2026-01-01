import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useCustomers } from "../../hooks/useCustomers";

export default function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    getCustomerById,
    updateCustomer,
    loading,
  } = useCustomers();

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
  });

  // 🔹 wait until customers loaded
  useEffect(() => {
    if (loading) return;

    const customer = getCustomerById(id);

    if (!customer) {
      navigate("/customers");
      return;
    }

    setForm({
      name: customer.name || "",
      address: customer.address || "",
      phone: customer.phone || "",
    });
  }, [id, loading, getCustomerById, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await updateCustomer(id, form);
    navigate("/customers");
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Loading customer...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Edit Customer
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
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/customers")}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>

            <Button variant="contained" type="submit">
              Update
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
