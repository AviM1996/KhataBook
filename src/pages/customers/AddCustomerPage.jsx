import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { addCustomer } from "../../firebase/customer.service";

export default function AddCustomer() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.phone) {
      setError("Name and phone are required");
      return;
    }

    try {
      setLoading(true);

      // 🔥 Firestore add (NO uuid)
      await addCustomer({
        name: form.name,
        address: form.address,
        phone: form.phone,
      });

      // ✅ back to list
      navigate("/customers");
    } catch (err) {
      console.error("ADD CUSTOMER ERROR 👉", err);
      setError("Failed to add customer");
    } finally {
      setLoading(false);
    }
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

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              mt: 3,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/customers")}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Customer"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
