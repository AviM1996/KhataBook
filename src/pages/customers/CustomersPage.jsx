import React, { useEffect, useState } from 'react';
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
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAllCustomers } from '../../db/customer.service';
import { getBalanceByCustomer } from "../../db/transaction.service";


export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    async function loadCustomers() {
      const data = await getAllCustomers();

       const withBalance = await Promise.all(
        data.map(async (c) => {
          const balance = await getBalanceByCustomer(c.id);
          return { ...c, balance };
        })
      );

      setCustomers(withBalance);
    }

    loadCustomers();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Customers
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate('/customers/add')}
        >
          + Add Customer
        </Button>
      </Box>

      {/* List */}
      <Paper sx={{ borderRadius: 2 }}>
        <List disablePadding>
          {customers.length === 0 && (
            <Typography sx={{ p: 2, color: 'text.secondary' }}>
              No customers found. Add your first customer.
            </Typography>
          )}

          {customers.map((c, index) => (
            <React.Fragment key={c.id}>
              <ListItem
                sx={{
                  py: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    background: 'rgba(25,118,210,0.05)',
                  },
                }}
                onClick={() => navigate(`/ledger/${c.id}`)}
              >
                <ListItemText
                  primary={
                    <Typography fontWeight={600}>
                      {c.name}
                    </Typography>
                  }
                  secondary={`📞 ${c.phone || '-'}`}
                />

                {/* Balance future-ready */}
                <Chip
                  label={`₹ ${c.balance}`}
                  color={c.balance >= 0 ? "success" : "error"}
                  variant="outlined"
                />
              </ListItem>

              {index < customers.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
}
