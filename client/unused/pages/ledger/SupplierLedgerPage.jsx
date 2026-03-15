import { useState } from "react";
import { Page, Button } from "../../components";
import styles from "./LedgerSystem.module.css";

export default function SupplierLedgerPage() {
  const [loading, setLoading] = useState(false);

  const pageActions = (
    <Button
      onClick={() => alert("Add Supplier Ledger Entry feature coming soon!")}
      icon="＋"
    >
      New Entry
    </Button>
  );

  return (
    <Page
      title="Supplier Ledger"
      subtitle="View and manage supplier transaction records"
      actions={pageActions}
      loading={loading && "Loading ledger..."}
    >
      <section className={styles.emptyState}>
        <h3>Supplier Ledger feature is under construction</h3>
        <p>You will be able to view detailed supplier balances here.</p>
      </section>
    </Page>
  );
}
