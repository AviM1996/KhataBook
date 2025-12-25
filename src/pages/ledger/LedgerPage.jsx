import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography } from "@mui/material";

import Ledger from "./Ledger";
import { getCustomerById } from "../../db/customer.service";
import {
  addTransaction,
  getTransactionsByCustomer,
} from "../../db/transaction.service";

export default function LedgerPage() {
  const { id } = useParams();

  const [customer, setCustomer] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const c = await getCustomerById(id);
        const txns = await getTransactionsByCustomer(id);

        setCustomer(c);
        setEntries(txns);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (id) load();
  }, [id]);

  // ✅ CREDIT / DEBIT HERE
  async function handleTransaction(type, amount) {
    await addTransaction({
      customerId: id,
      amount,
      type, // CREDIT | DEBIT
    });

    const txns = await getTransactionsByCustomer(id);
    setEntries(txns);
  }

  if (loading) {
    return <Container sx={{ mt: 3 }}>Loading...</Container>;
  }

  if (!customer) {
    return (
      <Container sx={{ mt: 3 }}>
        <Typography color="error">Customer not found</Typography>
      </Container>
    );
  }

  return (
    <Ledger
      customer={customer}
      entries={entries}
      onTransaction={handleTransaction}
    />
  );
}
