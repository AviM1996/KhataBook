import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    navigate("/", { replace: true });
  };

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Left: Hamburger + Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setOpen(true)}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6">📒 Khatabook</Typography>
          </Box>

          {/* Right: Logout */}
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            width: 260,
            height: "100%",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {/* Glass Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(8, 94, 180, 0.35)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#1e1d1dff",
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              📒 Khatabook
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(84, 77, 77, 0.8)" }}
            >
              Manage your business
            </Typography>
          </Box>

          {/* Menu */}
          <List>
            {[
              { label: "Dashboard", path: "/dashboard" },
              { label: "Customers", path: "/customers" },
            ].map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  sx={{
                    mx: 1,
                    my: 0.75,
                    borderRadius: "14px",
                    color: "#1a237e",
                    transition: "all 0.25s ease",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",

                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.35)",
                      boxShadow: `
              inset 0 0 0 1px rgba(255,255,255,0.45),
              0 8px 20px rgba(25,118,210,0.25)
            `,
                      transform: "translateY(-1px) scale(1.01)",
                    },

                    "&:active": {
                      transform: "scale(0.98)",
                      background: "rgba(255,255,255,0.45)",
                    },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "1rem",
                      fontWeight: 500,
                      letterSpacing: "0.2px",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
