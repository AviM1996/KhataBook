// src/pages/ledger/LedgerPage.jsx
import { useParams } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";

import Ledger from "./Ledger";
import { useLedger } from "../../hooks/useLedger";
import BufferIcon from "../../components/BufferIcon";

export default function LedgerPage() {
  const { id:customerId  } = useParams();

  const { customer, entries, loading, error, addEntry } = useLedger(customerId);

  if (loading) {
    return (
      <Container sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <BufferIcon size="medium" color="green" text="Loading ledger..." />
      </Container>
    );
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
