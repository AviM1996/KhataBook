import * as React from 'react';
import {
  Container,
  Typography,
  Paper,
  Button,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: { xs: 4, sm: 6 },
        px: { xs: 2, sm: 0 }
      }}
    >
      <Paper
        sx={{
          p: { xs: 3, sm: 4 },
          textAlign: 'center'
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: '1.6rem', sm: '2rem' },
            fontWeight: 600,
            mb: 1
          }}
        >
          📒 Khatabook
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '0.9rem', sm: '1rem' },
            color: 'text.secondary',
            mb: 3
          }}
        >
          Simple digital ledger to manage your customers and payments.
        </Typography>

        {/* 🔐 Login Button */}
        <Box>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
