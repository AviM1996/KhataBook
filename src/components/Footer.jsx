import { Box, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        textAlign: 'center',
        py: 1,
        fontSize: '0.75rem',
        color: 'text.secondary',
      }}
    >
      <Typography variant="caption">
        © 2025 Khatabook
      </Typography>
    </Box>
  );
}
