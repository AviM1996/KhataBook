import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

   const from = location.state?.from || '/dashboard';

   const handleLogin = () => {
    localStorage.setItem('ACCESS_TOKEN', 'dummy-token');

    navigate(from, { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Login
          </Typography>

          <TextField fullWidth label="Email" margin="normal" />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
          />

          <FormControlLabel control={<Checkbox />} label="Remember me" />

          <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleLogin}>
            Sign In
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
