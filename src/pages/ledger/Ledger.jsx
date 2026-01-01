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
  const [note, setNote] = useState("");

  if (!customer) {
    return (
      <Container sx={{ mt: 3 }}>
        <Typography color="text.secondary">Loading...</Typography>
      </Container>
    );
  }

  function handleClick(type) {
    const value = Number(amount);
    if (!value || value <= 0) {
      alert("Please enter valid amount");
      return;
    }

    onTransaction(type, value, note);
    setAmount("");
    setNote("");
  }

  /* ===== SUMMARY ===== */
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
        <Typography variant="h6" fontWeight={600}>
          {customer.name}
        </Typography>

        <Typography color="text.secondary">📞 {customer.phone}</Typography>

        <Divider sx={{ my: 1 }} />

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

      {/* TRANSACTIONS */}
      <Paper sx={{ maxHeight: "55vh", overflowY: "auto" }}>
        <List>
          {entries.length === 0 && (
            <Typography sx={{ p: 2 }} color="text.secondary">
              No transactions yet
            </Typography>
          )}

          {entries.map((e, i) => (
            <Box key={e.id}>
              <ListItem>
                <ListItemText
                  primary={e.type}
                  secondary={
                    <Box component="span">
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        display="block"
                      >
                        {e.createdAt?.toDate().toDateString()}
                      </Typography>

                      {e.note && (
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          📝 {e.note}
                        </Typography>
                      )}
                    </Box>
                  }
                />

                <Typography
                  fontWeight={600}
                  color={e.type === "CREDIT" ? "green" : "red"}
                >
                  {e.type === "CREDIT" ? "+" : "-"}₹{e.amount}
                </Typography>
              </ListItem>

              {i < entries.length - 1 && <Divider />}
            </Box>
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
            inputProps={{ min: 1 }}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
          />

          <TextField
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
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
