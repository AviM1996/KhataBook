// src/pages/ledger/LedgerPage.jsx
import { useParams } from "react-router-dom";
import { Container, Typography } from "@mui/material";

import Ledger from "./Ledger";
import { useLedger } from "../../hooks/useLedger";

export default function LedgerPage() {
  const { id } = useParams();

  const { customer, entries, loading, error, addEntry } = useLedger(id);

  if (loading) {
    return <Container sx={{ mt: 3 }}>Loading...</Container>;
  }

  if (error) {
    return (
      <Container sx={{ mt: 3 }}>
        <Typography color="error">Something went wrong</Typography>
      </Container>
    );
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
      onTransaction={addEntry} // ✅ direct hook function
    />
  );
}
