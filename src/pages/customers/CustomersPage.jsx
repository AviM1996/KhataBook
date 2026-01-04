import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomers } from "../../backend/hooks/useCustomers";
import { useTransactions } from "../../hooks/useTransactions";
import { usePagination } from "../../hooks/usePagination";
import {
  sendSMS,
  generateReminderSMS,
  getSMSBalance,
} from "../../utils/sms.service";
import BufferIcon from "../../components/BufferIcon";
import { BufferIconInline } from "../../components/BufferIcon";
import Pagination from "../../components/Pagination";
import styles from "./CustomersPage.module.css";
import { useAuth } from "../../backend/context/authContext";

export default function Customers() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const customers = useCustomers({ role });
  console.log("Customers Hook:=======================", customers);

  // const { customers, loading, deleteCustomer } = useCustomers();
  // const { transactions } = useTransactions();
  const { transactions, loading: transactionsLoading } = useTransactions("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // const customerBalances = useMemo(() => {
  //   if (transactionsLoading) return {};
  //   const balances = {};
  //   if (transactions && transactions.length > 0) {
  //     transactions.forEach((tx) => {
  //       if (!tx.customerId) return;
  //       if (!balances[tx.customerId]) {
  //         balances[tx.customerId] = 0;
  //       }
  //       if (tx.type === "CREDIT") {
  //         balances[tx.customerId] += tx.amount || 0;
  //       } else if (tx.type === "DEBIT") {
  //         balances[tx.customerId] -= tx.amount || 0;
  //       }
  //     });
  //   }
  //   return balances;
  // }, [transactions]);
  const customerBalances = useMemo(() => {
    if (transactionsLoading) return {};

    const balances = {};

    transactions.forEach((tx) => {
      if (!tx.customerId) return;

      const amount = Number(tx.amount) || 0;
      const type = tx.type?.toUpperCase();

      if (!balances[tx.customerId]) {
        balances[tx.customerId] = 0;
      }

      if (type === "CREDIT") {
        balances[tx.customerId] += amount;
      } else if (type === "DEBIT") {
        balances[tx.customerId] -= amount;
      }
    });

    return balances;
  }, [transactions, transactionsLoading]);

  const summaryStats = useMemo(() => {
    let totalCredit = 0;
    let totalDebit = 0;
    let defaultersCount = 0;

    if (transactions && transactions.length > 0) {
      transactions.forEach((tx) => {
        if (tx.type === "CREDIT") {
          totalCredit += tx.amount || 0;
        } else if (tx.type === "DEBIT") {
          totalDebit += tx.amount || 0;
        }
      });
    }

    // Count defaulters (customers with negative balance)
    customers.forEach((customer) => {
      const balance = customerBalances[customer.id] || 0;
      if (balance < 0) {
        defaultersCount++;
      }
    });

    return {
      totalCustomers: customers.length,
      defaulters: defaultersCount,
      totalCredit,
      totalDebit,
      outstanding: totalCredit - totalDebit,
    };
  }, [customers, transactions, customerBalances]);

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
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

  // Get customers with reminders (reminderDate is today or past)
  const customersWithReminders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return customers.filter((customer) => {
      if (!customer.reminderDate) return false;
      const reminderDate = new Date(customer.reminderDate);
      reminderDate.setHours(0, 0, 0, 0);
      return reminderDate <= today;
    });
  }, [customers]);

  // Handle send reminder SMS
  const handleSendReminder = async (customer, balance) => {
    if (!customer.phone) {
      alert("Customer phone number is missing");
      return;
    }

    const smsBalance = getSMSBalance();
    if (smsBalance <= 0) {
      alert("Insufficient SMS balance. Please recharge.");
      return;
    }

    if (
      !window.confirm(
        `Send reminder SMS to ${customer.name}? (Balance: ${smsBalance} SMS)`
      )
    ) {
      return;
    }

    try {
      const message = generateReminderSMS(
        customer.name,
        balance,
        customer.reminderDate
      );
      await sendSMS(customer.phone, message);
      alert(`Reminder SMS sent to ${customer.name} successfully!`);
    } catch (error) {
      console.error("SMS Error:", error);
      alert(`Failed to send SMS: ${error.message}`);
    }
  };

  return (
    <div className={styles.page}>
      {/* Summary Cards */}
      <section className={styles.summary}>
        <div className={styles.summaryCard}>
          <p>Total Customers</p>
          <h3>
            {loading || transactionsLoading
              ? "..."
              : summaryStats.totalCustomers}
          </h3>
        </div>
        <div className={`${styles.summaryCard} ${styles.danger}`}>
          <p>Defaulters</p>
          <h3>
            {loading || transactionsLoading ? "..." : summaryStats.defaulters}
          </h3>
        </div>
        <div className={`${styles.summaryCard} ${styles.green}`}>
          <p>Total Credit</p>
          <h3>
            {loading || transactionsLoading
              ? "..."
              : `₹${summaryStats.totalCredit.toLocaleString("en-IN")}`}
          </h3>
        </div>
        <div className={`${styles.summaryCard} ${styles.red}`}>
          <p>Total Debit</p>
          <h3>
            {loading || transactionsLoading
              ? "..."
              : `₹${summaryStats.totalDebit.toLocaleString("en-IN")}`}
          </h3>
        </div>
        <div className={`${styles.summaryCard} ${styles.blue}`}>
          <p>Outstanding</p>
          <h3>
            {loading || transactionsLoading
              ? "..."
              : `₹${Math.abs(summaryStats.outstanding).toLocaleString(
                  "en-IN"
                )}`}
          </h3>
        </div>
      </section>

      {/* Reminder Card - Always show if there are reminders */}
      {customersWithReminders.length > 0 && (
        <div className={styles.reminderCard}>
          <div className={styles.reminderHeader}>
            <span className={styles.reminderIcon}>🔔</span>
            <h3>Reminders ({customersWithReminders.length})</h3>
            <span className={styles.smsBalance}>
              SMS Balance: {getSMSBalance()}
            </span>
          </div>
          <div className={styles.reminderList}>
            {customersWithReminders.slice(0, 5).map((customer) => {
              const balance = customerBalances[customer.id] || 0;
              return (
                <div key={customer.id} className={styles.reminderItem}>
                  <div className={styles.reminderInfo}>
                    <strong>{customer.name}</strong>
                    <span className={styles.reminderDate}>
                      {customer.reminderDate
                        ? new Date(customer.reminderDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )
                        : "No date"}
                    </span>
                  </div>
                  <button
                    className={styles.reminderSmsBtn}
                    onClick={() => navigate(`/sms?customer=${customer.id}`)}
                    title="Send reminder SMS"
                  >
                    📱 Send SMS
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Search customer name or phone…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className={styles.addBtn}
          onClick={() => navigate("/customers/add")}
        >
          ＋ Add Customer
        </button>
      </div>

      {/* Customer List */}
      <section className={styles.list}>
        {loading || transactionsLoading ? (
          <div className={styles.loadingContainer}>
            <BufferIcon
              size="medium"
              color="green"
              text="Loading customers..."
            />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className={styles.emptyState}>
            {searchQuery
              ? "No customers found matching your search."
              : "No customers found."}
          </div>
        ) : (
          <>
            {paginatedCustomers.map((customer) => {
              const balance = customerBalances[customer.id] || 0;
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
                  onSendSMS={() => navigate(`/sms?customer=${customer.id}`)}
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
    </div>
  );
}

/* Customer Row Component */
function CustomerRow({
  customer,
  balance,
  onEdit,
  onView,
  onDelete,
  onSendSMS,
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
          className={`${styles.btn} ${styles.smsBtn}`}
          onClick={(e) => {
            e.stopPropagation();
            onSendSMS();
          }}
          title="Send SMS"
        >
          📱
        </button>
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
