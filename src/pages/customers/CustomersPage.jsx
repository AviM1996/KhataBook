import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  IconButton,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

import { useCustomers } from "../../hooks/useCustomers";
import { useLedger } from "../../hooks/useLedger";

export default function Customers() {
  const navigate = useNavigate();
  const { customers, loading, deleteCustomer } = useCustomers();

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Customers
        </Typography>

        <Button variant="contained" onClick={() => navigate("/customers/add")}>
          + Add Customer
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 2, maxHeight: "65vh", overflowY: "auto" }}>
        <List disablePadding>
          {loading && <Typography sx={{ p: 2 }}>Loading...</Typography>}

          {!loading && customers.length === 0 && (
            <Typography sx={{ p: 2, color: "text.secondary" }}>
              No customers found.
            </Typography>
          )}

          {customers.map((c, index) => (
            <CustomerRow
              key={c.id}
              customer={c}
              index={index}
              onEdit={() => navigate(`/customers/edit/${c.id}`)}
              onLedger={() => navigate(`/ledger/${c.id}`)}
              onDelete={() => deleteCustomer(c.id)}
            />
          ))}
        </List>
      </Paper>
    </Container>
  );
}

/* 🔹 Row component (balance aware) */
function CustomerRow({ customer, index, onEdit, onLedger, onDelete }) {
  const { balance } = useLedger(customer.id);

  return (
    <>
      <ListItem
        sx={{
          py: 2,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          "&:hover": { background: "rgba(25,118,210,0.05)" },
        }}
        onClick={onLedger}
      >
        <ListItemText
          primary={<Typography fontWeight={600}>{customer.name}</Typography>}
          secondary={`📞 ${customer.phone || "-"}`}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={`₹ ${balance}`}
            color={balance >= 0 ? "success" : "error"}
            variant="outlined"
          />

          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <EditIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            color="error"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </ListItem>

      {index !== undefined && <Divider />}
    </>
  );
}
