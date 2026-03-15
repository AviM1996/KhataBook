import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomers } from "../../hooks/useCustomers";
import { useTransactions } from "../../hooks/useTransactions";
import { usePagination } from "../../hooks/usePagination";
import { Page, Loader, Pagination, Button, SummaryCard, EmptyState } from "../../components";
import { useAuth } from "../../context/AuthContext";
import styles from "./CustomersPage.module.css";

export default function Customers() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { customers, loading, deleteCustomer } = useCustomers({ role });
  const { transactions, loading: transactionsLoading } = useTransactions("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const customerBalances = useMemo(() => {
    if (transactionsLoading) return {};

    const balances = {};

    if (Array.isArray(transactions) && transactions.length > 0) {
      transactions.forEach((tx) => {
        const cid = tx.customerId?._id || tx.customerId?.id || tx.customerId;
        if (!cid) return;

        const amount = Number(tx.amount) || 0;
        const type = tx.type?.toUpperCase();

        if (!balances[cid]) {
          balances[cid] = 0;
        }

        if (type === "CREDIT") {
          balances[cid] += amount;
        } else if (type === "DEBIT") {
          balances[cid] -= amount;
        }
      });
    }

    return balances;
  }, [transactions, transactionsLoading]);

  const summaryStats = useMemo(() => {
    let totalCredit = 0;
    let totalDebit = 0;
    let defaultersCount = 0;

    if (transactions && Array.isArray(transactions) && transactions.length > 0) {
      transactions.forEach((tx) => {
        if (tx.type === "CREDIT") {
          totalCredit += tx.amount || 0;
        } else if (tx.type === "DEBIT") {
          totalDebit += tx.amount || 0;
        }
      });
    }

    // Count defaulters (customers with negative balance)
    if (Array.isArray(customers) && customers.length > 0) {
      customers.forEach((customer) => {
        const txBalance = customerBalances[customer.id] || 0;
        const opening = customer.openingBalance || 0;
        const isReceivable = customer.balanceDirection === 'Receivable';
        const balance = opening + (isReceivable ? txBalance : -txBalance);

        if (balance < 0) {
          defaultersCount++;
        }
      });
    }

    return {
      totalCustomers: Array.isArray(customers) ? customers.length : 0,
      defaulters: defaultersCount,
      totalCredit,
      totalDebit,
      outstanding: totalCredit - totalDebit,
    };
  }, [customers, transactions, customerBalances]);

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!Array.isArray(customers)) return [];
    if (!searchQuery.trim()) return customers;

    const query = searchQuery.toLowerCase();
    return customers.filter(
      (c) => c.name?.toLowerCase().includes(query) || c.phone?.includes(query)
    );
  }, [customers, searchQuery]);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedCustomers,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(filteredCustomers, 10);

  const pageActions = (
    <Button
      onClick={() => navigate("/customers/add")}
      icon="＋"
    >
      Add Customer
    </Button>
  );

  return (
    <Page
      title="Customers"
      subtitle={`Manage your clients and their balances (${totalItems} total)`}
      actions={pageActions}
      loading={loading && "Loading customers..."}
      error={null} // Handle error if available from hook
    >
      {/* Summary Cards */}
      <section className={styles.summary}>
        <SummaryCard
          label="Total Customers"
          value={loading || transactionsLoading ? "..." : summaryStats.totalCustomers}
        />
        <SummaryCard
          label="Defaulters"
          value={loading || transactionsLoading ? "..." : summaryStats.defaulters}
          color="danger"
        />
        <SummaryCard
          label="Total Credit"
          value={loading || transactionsLoading ? "..." : `₹${summaryStats.totalCredit.toLocaleString("en-IN")}`}
          color="green"
        />
        <SummaryCard
          label="Total Debit"
          value={loading || transactionsLoading ? "..." : `₹${summaryStats.totalDebit.toLocaleString("en-IN")}`}
          color="red"
        />
        <SummaryCard
          label="Outstanding"
          value={loading || transactionsLoading ? "..." : `₹${Math.abs(summaryStats.outstanding).toLocaleString("en-IN")}`}
          color="blue"
        />
      </section>

      {/* Toolbar - Search only as Add is now in Page Header */}
      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Search customer name or phone…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Customer List */}
      <section className={styles.list}>
        {loading || transactionsLoading ? (
          <div className={styles.loadingContainer}>
            <Loader size="medium" color="green" text="Loading data..." />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <EmptyState
            title={searchQuery ? "No customers found" : "No customers"}
            description={searchQuery ? "No matches for your search." : "Add a customer to get started."}
          />
        ) : (
          <>
            {paginatedCustomers.map((customer) => {
              const txBalance = customerBalances[customer.id] || 0;
              const opening = customer.openingBalance || 0;
              const isReceivable = customer.balanceDirection === 'Receivable';
              const balance = opening + (isReceivable ? txBalance : -txBalance);
              
              return (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  balance={balance}
                  onEdit={() => navigate(`/customers/edit/${customer.id}`)}
                  onView={() => navigate(`/ledger/${customer.id}`)}
                  onDelete={() => {
                    if (window.confirm(`Delete ${customer.name}?`)) {
                      deleteCustomer(customer.id);
                    }
                  }}
                />
              );
            })}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              onNext={nextPage}
              onPrev={prevPage}
              hasNext={hasNextPage}
              hasPrev={hasPrevPage}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={totalItems}
            />
          </>
        )}
      </section>
    </Page>
  );
}

/* Customer Row Component */
function CustomerRow({
  customer,
  balance,
  onEdit,
  onView,
  onDelete,
}) {
  const isDefaulter = balance < 0;
  const initial = customer.name?.charAt(0)?.toUpperCase() || "?";

  const handleRowClick = (e) => {
    // Don't navigate if clicking on buttons
    if (e.target.closest("button")) {
      return;
    }
    onView();
  };

  return (
    <div
      className={`${styles.row} ${isDefaulter ? styles.defaulter : ""}`}
      onClick={handleRowClick}
    >
      <div className={styles.user}>
        <div className={`${styles.avatar} ${isDefaulter ? styles.def : ""}`}>
          {initial}
          {isDefaulter && <span className={styles.warnIcon}>⚠️</span>}
        </div>
        <div>
          <div className={styles.customerInfo}>
            <strong>{customer.name}</strong>
            {customer.address && (
              <span className={styles.address}>{customer.address}</span>
            )}
          </div>
          <small className={styles.phone}>☎ {customer.phone || "-"}</small>
        </div>
      </div>

      <div
        className={`${styles.amount} ${styles.amountBox} ${
          balance >= 0 ? styles.green : styles.red
        }`}
      >
        ₹{Math.abs(balance).toLocaleString("en-IN")}
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.edit}`}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          Edit
        </button>
        <button
          className={`${styles.btn} ${styles.delete}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
