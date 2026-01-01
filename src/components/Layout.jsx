import { Box } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";

export default function AppLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",          // 🔥 IMPORTANT
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #020617, #0f172a)",
        overflowX: "hidden",


      }}
    >
      <Header />

      <Box
        component="main"
        sx={{
          flex: 1,
          width: "100%",         // 🔥 IMPORTANT
          padding: "24px",
        }}
      >
        {children}
      </Box>

      <Footer />
    </Box>
  );
}
