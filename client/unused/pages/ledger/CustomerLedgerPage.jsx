import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Loader, Pagination } from "../../components";
import { useCustomers } from "../../hooks/useCustomers";
import { useTransactions } from "../../hooks/useTransactions";
import styles from "./CustomerLedger.module.css";
import { useAuth } from "../../context/AuthContext";

export default function CustomerLedgerPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { customers, loading: customersLoading } = useCustomers({ role });
  const { transactions, loading: txLoading } = useTransactions("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Compute Balances
  const customerStats = useMemo(() => {
    if (txLoading || !transactions) return {};
    const stats = {};

    transactions.forEach((tx) => {
      const cid = tx.customerId?._id || tx.customerId?.id || tx.customerId;
      if (!cid) return;

      if (!stats[cid]) {
        stats[cid] = { totalPaid: 0, totalPurchased: 0 };
      }

      const amt = Number(tx.amount) || 0;
      if (tx.type?.toUpperCase() === "CREDIT") {
        stats[cid].totalPaid += amt; // Received from customer
      } else if (tx.type?.toUpperCase() === "DEBIT") {
        stats[cid].totalPurchased += amt; // Given to customer
      }
    });

    return stats;
  }, [transactions, txLoading]);

  // Aggregate stats
  const aggregateStats = useMemo(() => {
    let totalPurchased = 0;
    let totalPaid = 0;

    if (transactions) {
      transactions.forEach(tx => {
        const amt = Number(tx.amount) || 0;
        if (tx.type === "CREDIT") totalPaid += amt;
        else if (tx.type === "DEBIT") totalPurchased += amt;
      });
    }

    return {
      totalCustomers: customers?.length || 0,
      totalPurchased,
      totalPaid,
      outstanding: totalPurchased - totalPaid
    };
  }, [customers, transactions]);

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(c => c.name?.toLowerCase().includes(q) || c.phone?.includes(q));
  }, [customers, searchQuery]);

  const loading = customersLoading || txLoading;

  return (
    <Page
      title="Customer Ledger"
      subtitle={`Manage your clients' balances and record transactions`}
    >
      {/* Aggregate Summary */}
      <section className={styles.summary}>
        <div className={styles.summaryCard}>
          <p>Total Customers</p>
          <h3>{loading ? "..." : aggregateStats.totalCustomers}</h3>
        </div>
        <div className={`${styles.summaryCard} ${styles.red}`}>
          <p>Total Sales (Given)</p>
          <h3>{loading ? "..." : `₹${aggregateStats.totalPurchased.toLocaleString("en-IN")}`}</h3>
        </div>
        <div className={`${styles.summaryCard} ${styles.green}`}>
          <p>Total Payments (Received)</p>
          <h3>{loading ? "..." : `₹${aggregateStats.totalPaid.toLocaleString("en-IN")}`}</h3>
        </div>
        <div className={`${styles.summaryCard} ${styles.blue}`}>
          <p>Net Outstanding</p>
          <h3>{loading ? "..." : `₹${aggregateStats.outstanding.toLocaleString("en-IN")}`}</h3>
        </div>
      </section>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* List */}
      <section className={styles.list}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Loader size="medium" color="green" text="Loading ledger..." />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className={styles.emptyState}>No customers found.</div>
        ) : (
          filteredCustomers.map(customer => {
            const stats = customerStats[customer.id] || { totalPaid: 0, totalPurchased: 0 };
            const opening = customer.openingBalance || 0;
            const isReceivable = customer.balanceDirection === 'Receivable';
            const baseOpening = isReceivable ? opening : -opening;
            const balance = baseOpening + stats.totalPurchased - stats.totalPaid;

            const initial = customer.name?.charAt(0)?.toUpperCase() || "?";
            const balanceText = balance >= 0 ? "To collect" : "To pay";

            return (
              <div
                key={customer.id}
                className={styles.row}
                onClick={() => navigate(`/ledger/${customer.id}`)}
                style={{ cursor: "pointer" }}
              >
                {/* User Info */}
                <div className={styles.user}>
                  <div className={styles.avatar}>{initial}</div>
                  <div className={styles.customerInfo}>
                    <strong>{customer.name}</strong>
                    <small>☎ {customer.phone || "-"}</small>
                  </div>
                </div>

                {/* Purchased */}
                <div className={styles.amountCol}>
                  <span>Total Purchased</span>
                  <strong className={styles.redText}>₹{stats.totalPurchased.toLocaleString("en-IN")}</strong>
                </div>

                {/* Paid */}
                <div className={styles.amountCol}>
                  <span>Total Paid</span>
                  <strong className={styles.greenText}>₹{stats.totalPaid.toLocaleString("en-IN")}</strong>
                </div>

                {/* Final Balance */}
                <div className={styles.amountCol}>
                  <span>Balance ({balanceText})</span>
                  <strong className={balance >= 0 ? styles.greenText : styles.redText}>
                    ₹{Math.abs(balance).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className={styles.actions}>
                  <span style={{ color: "var(--text-tertiary)", fontSize: "1.2rem", alignSelf: "center", marginRight: "10px" }}>
                    ➔
                  </span>
                </div>
              </div>
            );
          })
        )}
      </section>
    </Page>
  );
}
