import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";

import { getAllCustomers } from "../../db/customer.service";
import {
  getAllTransactions,
  getRecentTransactions,
} from "../../db/transaction.service";

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recent, setRecent] = useState([]);
  const [month, setMonth] = useState("ALL");

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    async function load() {
      const c = await getAllCustomers();
      const t = await getAllTransactions();
      const r = await getRecentTransactions(5);

      setCustomers(c);
      setTransactions(t);
      setRecent(r);
    }

    load();
  }, []);

  /* ================= CUSTOMER MAP (ID → NAME) ================= */

  const customerMap = useMemo(() => {
    const map = {};
    customers.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [customers]);

  /* ================= DASHBOARD STATS ================= */

  const stats = useMemo(() => {
    let credit = 0;
    let debit = 0;
    let todayCredit = 0;
    let todayDebit = 0;

    const today = new Date().toDateString();

    transactions.forEach((t) => {
      const d = new Date(t.date).toDateString();

      if (t.type === "CREDIT") {
        credit += t.amount;
        if (d === today) todayCredit += t.amount;
      } else {
        debit += t.amount;
        if (d === today) todayDebit += t.amount;
      }
    });

    return {
      totalCustomers: customers.length,
      totalCredit: credit,
      totalDebit: debit,
      todayCredit,
      todayDebit,
      balance: credit - debit,
    };
  }, [customers, transactions]);

  /* ================= CARD CONFIG ================= */

  const cards = [
    { label: "Total Customers", value: stats.totalCustomers },
    { label: "Total Credit", value: `₹ ${stats.totalCredit}`, color: "green" },
    { label: "Total Debit", value: `₹ ${stats.totalDebit}`, color: "red" },
    {
      label: "Per-day Credit",
      value: `₹ ${stats.todayCredit}`,
      color: "green",
    },
    {
      label: "Per-day Debit",
      value: `₹ ${stats.todayDebit}`,
      color: "red",
    },
    {
      label: "Net Balance",
      value: `₹ ${stats.balance}`,
      highlight: true,
    },
  ];

  /* ================= UI ================= */

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Dashboard
        </Typography>

        <Select
          size="small"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <MenuItem value="ALL">All Time</MenuItem>
        </Select>
      </Box>

      {/* STAT CARDS */}
      <Grid container spacing={2}>
        {cards.map((c, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                background: c.highlight
                  ? "linear-gradient(135deg, #1976d2, #42a5f5)"
                  : "#fff",
                color: c.highlight ? "#fff" : "#000",
                boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
              }}
            >
              <Typography fontSize={13}>{c.label}</Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: c.color }}
              >
                {c.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* RECENT ACTIVITY */}
      <Paper sx={{ mt: 4 }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">Recent Transactions</Typography>
          <Chip size="small" label={`Showing ${recent.length}`} />
        </Box>

        <Divider />

        <List>
          {recent.map((e, index) => (
            <React.Fragment key={e.id}>
              <ListItem>
                <ListItemText
                  primary={customerMap[e.customerId] || "Unknown Customer"}
                  secondary={`${e.type} • ${new Date(
                    e.date
                  ).toDateString()}`}
                />
                <Typography
                  fontWeight={700}
                  color={e.type === "CREDIT" ? "green" : "red"}
                >
                  {e.type === "CREDIT" ? "+" : "-"}₹{e.amount}
                </Typography>
              </ListItem>

              {index < recent.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
}
