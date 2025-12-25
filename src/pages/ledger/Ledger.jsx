import { useState, useMemo } from "react";
import {
  Typography,
  Button,
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  TextField,
  Box,
} from "@mui/material";

export default function Ledger({ customer, entries, onTransaction }) {
  const [amount, setAmount] = useState("");

  function handleClick(type) {
    const value = Number(amount);
    if (!value || value <= 0) {
      alert("Please enter valid amount");
      return;
    }
    onTransaction(type, value);
    setAmount("");
  }

  // 🔢 Summary calculation
  const summary = useMemo(() => {
    let credit = 0;
    let debit = 0;

    entries.forEach((e) => {
      if (e.type === "CREDIT") credit += e.amount;
      else debit += e.amount;
    });

    return {
      credit,
      debit,
      balance: credit - debit,
    };
  }, [entries]);

  return (
    <Container maxWidth="sm" sx={{ mt: 2, mb: 10 }}>
      {/* CUSTOMER + SUMMARY */}
      <Paper sx={{ p: 2, mb: 2 }}>
        {/* NAME + ADDRESS */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            {customer.name}
          </Typography>

          {customer.address && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "55%",
              }}
            >
              📍 {customer.address}
            </Typography>
          )}
        </Box>

        {/* PHONE */}
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          📞 {customer.phone}
        </Typography>

        <Divider sx={{ my: 1 }} />

        {/* SUMMARY */}
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography variant="caption">Credit</Typography>
            <Typography color="green">₹{summary.credit}</Typography>
          </Box>

          <Box>
            <Typography variant="caption">Debit</Typography>
            <Typography color="red">₹{summary.debit}</Typography>
          </Box>

          <Box>
            <Typography variant="caption">Balance</Typography>
            <Typography
              fontWeight={600}
              color={summary.balance >= 0 ? "green" : "red"}
            >
              ₹{summary.balance}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* TRANSACTIONS (SCROLLABLE) */}
      <Paper sx={{ maxHeight: "55vh", overflowY: "auto" }}>
        <List>
          {entries.length === 0 && (
            <Typography sx={{ p: 2 }} color="text.secondary">
              No transactions yet
            </Typography>
          )}

          {entries.map((e, i) => (
            <div key={e.id}>
              <ListItem>
                <ListItemText
                  primary={e.type}
                  secondary={new Date(e.date).toDateString()}
                />
                <Typography
                  fontWeight={600}
                  color={e.type === "CREDIT" ? "green" : "red"}
                >
                  {e.type === "CREDIT" ? "+" : "-"}₹{e.amount}
                </Typography>
              </ListItem>
              {i < entries.length - 1 && <Divider />}
            </div>
          ))}
        </List>
      </Paper>

      {/* FIXED BOTTOM ACTION */}
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          borderTop: "1px solid #ddd",
        }}
      >
        <Container maxWidth="sm">
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
          />

          <Stack direction="row" spacing={2} mt={2}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={() => handleClick("CREDIT")}
            >
              + Credit
            </Button>

            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={() => handleClick("DEBIT")}
            >
              − Debit
            </Button>
          </Stack>
        </Container>
      </Paper>
    </Container>
  );
}
