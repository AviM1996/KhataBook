import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

export default function AppLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* 🔝 Header */}
      <Header />

      {/* 📄 Page Content */}
      <Box component="main" sx={{ flex: 1, p: 2 }}>
        {children}
      </Box>

      {/* 🔻 Footer */}
      <Footer />
    </Box>
  );
}
