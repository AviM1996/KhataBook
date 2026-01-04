import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTransactions } from "../../hooks/useTransactions";
import { useCustomers } from "../../hooks/useCustomers";
import { usePagination } from "../../hooks/usePagination";
import BufferIcon from "../../components/BufferIcon";
import Pagination from "../../components/Pagination";
import styles from "./TransactionsListPage.module.css";

export default function TransactionsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterType = searchParams.get("type") || "all"; // CREDIT, DEBIT, or all
  const filterDate = searchParams.get("date") || "all"; // today, all
  const { transactions, loading } = useTransactions();
  const { customers } = useCustomers();

  // Get customer name helper
  const getCustomerName = (customerId) => {
    const customer = customers?.find((c) => c.id === customerId);
    return customer?.name || "Unknown";
  };

  // Filter transactions based on type and date
  const filteredTransactions = useMemo(() => {
    let filtered = transactions || [];

    // Filter by type
    if (filterType === "CREDIT") {
      filtered = filtered.filter((tx) => tx.type === "CREDIT");
    } else if (filterType === "DEBIT") {
      filtered = filtered.filter((tx) => tx.type === "DEBIT");
    }

    // Filter by date
    if (filterDate === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.getTime();
      const tomorrowStart = new Date(today.getTime() + 24 * 60 * 60 * 1000).getTime();

      filtered = filtered.filter((tx) => {
        if (!tx.createdAt) return false;
        let txDate;
        if (typeof tx.createdAt === "object" && tx.createdAt.toDate) {
          txDate = tx.createdAt.toDate();
        } else if (tx.createdAt instanceof Date) {
          txDate = tx.createdAt;
        } else if (typeof tx.createdAt === "number") {
          txDate = new Date(tx.createdAt);
        } else {
          return false;
        }
        const txTime = txDate.getTime();
        return txTime >= todayStart && txTime < tomorrowStart;
      });
    }

    return filtered;
  }, [transactions, filterType, filterDate]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach((tx) => {
      if (!tx.createdAt) return;
      let txDate;
      if (typeof tx.createdAt === "object" && tx.createdAt.toDate) {
        txDate = tx.createdAt.toDate();
      } else if (tx.createdAt instanceof Date) {
        txDate = tx.createdAt;
      } else if (typeof tx.createdAt === "number") {
        txDate = new Date(tx.createdAt);
      } else {
        return;
      }

      const dateKey = txDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(tx);
    });

    // Sort dates descending (most recent first)
    const sortedDates = Object.keys(groups).sort((a, b) => {
      // Parse dates like "3 Jan 2026" to Date objects
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB.getTime() - dateA.getTime();
    });

    return sortedDates.map((date) => ({
      date,
      transactions: groups[date].sort((a, b) => {
        let dateA, dateB;
        if (a.createdAt?.toDate) dateA = a.createdAt.toDate();
        else if (a.createdAt instanceof Date) dateA = a.createdAt;
        else if (typeof a.createdAt === "number") dateA = new Date(a.createdAt);
        else return 1;

        if (b.createdAt?.toDate) dateB = b.createdAt.toDate();
        else if (b.createdAt instanceof Date) dateB = b.createdAt;
        else if (typeof b.createdAt === "number") dateB = new Date(b.createdAt);
        else return -1;

        return dateB.getTime() - dateA.getTime();
      }),
    }));
  }, [filteredTransactions]);

  const formatDateTime = (createdAt) => {
    if (!createdAt) return "";
    let date;
    if (typeof createdAt === "object" && createdAt.toDate) {
      date = createdAt.toDate();
    } else if (createdAt instanceof Date) {
      date = createdAt;
    } else if (typeof createdAt === "number") {
      date = new Date(createdAt);
    } else {
      return "";
    }
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination for grouped transactions
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedGroups,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(groupedTransactions, 5);

  const getPageTitle = () => {
    if (filterDate === "today" && filterType === "DEBIT") return "Today Sales";
    if (filterDate === "today" && filterType === "CREDIT") return "Today Credit";
    if (filterType === "CREDIT") return "All Credit Transactions";
    if (filterType === "DEBIT") return "All Debit Transactions";
    return "Transactions";
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate("/dashboard")}>
          ← Back
        </button>
        <h2>{getPageTitle()}</h2>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <BufferIcon size="medium" color="green" text="Loading transactions..." />
        </div>
      ) : groupedTransactions.length === 0 ? (
        <div className={styles.emptyState}>
          No transactions found for the selected filter.
        </div>
      ) : (
        <>
          <div className={styles.transactionsList}>
            {paginatedGroups.map((group) => (
              <div key={group.date} className={styles.dateGroup}>
                <h3 className={styles.dateHeader}>{group.date}</h3>
                <div className={styles.transactions}>
                  {group.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className={`${styles.transactionItem} ${
                        tx.type === "CREDIT" ? styles.credit : styles.debit
                      }`}
                      onClick={() => navigate(`/ledger/${tx.customerId}`)}
                    >
                      <div className={styles.customerInfo}>
                        <strong>{getCustomerName(tx.customerId)}</strong>
                        {tx.note && <span className={styles.note}>{tx.note}</span>}
                      </div>
                      <div className={styles.transactionDetails}>
                        <span className={styles.time}>{formatDateTime(tx.createdAt)}</span>
                        <span
                          className={`${styles.amount} ${
                            tx.type === "CREDIT" ? styles.green : styles.red
                          }`}
                        >
                          {tx.type === "CREDIT" ? "+" : "-"}₹
                          {(tx.amount || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {groupedTransactions.length > 5 && (
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
          )}
        </>
      )}
    </div>
  );
}

