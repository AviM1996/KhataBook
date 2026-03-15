import { useParams } from "react-router-dom";

import Ledger from "./Ledger";
import { useLedger } from "../../hooks/useLedger";
import { Page, Loader } from "../../components";

export default function LedgerPage() {
  const { id: customerId } = useParams();

  const { customer, entries, loading, error, addEntry, editEntry, removeEntry } = useLedger(customerId);

  if (loading) {
    return (
      <Page title="Ledger" loading="Loading ledger..." />
    );
  }

  if (error) {
    return (
      <Page title="Ledger" error="Something went wrong" />
    );
  }

  if (!customer) {
    return (
      <Page title="Ledger" error="Customer not found" />
    );
  }

  // Render without Page wrapper so Ledger owns the full layout height
  // This ensures the Sale/Payment footer is always fixed at the bottom
  // and the transaction list scrolls independently.
  return (
    <Ledger
      customer={customer}
      entries={entries}
      onAddEntry={addEntry}
      onEditEntry={editEntry}
      onRemoveEntry={removeEntry}
    />
  );
}
