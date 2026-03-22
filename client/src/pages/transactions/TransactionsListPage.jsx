import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTransactions } from "../../hooks/useTransactions";
import { usePartyQuery } from "../../hooks/usePartyQuery";
import { usePagination } from "../../hooks/usePagination";
import { Page, Loader, Pagination } from "../../components";
import styles from "./TransactionsListPage.module.css";

export default function TransactionsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterType = searchParams.get("type") || "all"; // CREDIT, DEBIT, or all
  const filterDate = searchParams.get("date") || "all"; // today, all
  const { transactions, loading } = useTransactions("ALL");
  const { data: customers, loading: customersLoading } = usePartyQuery({ recordType: 'CUSTOMER', limit: 1000 });

  // Get customer name helper
  const getCustomerName = (customerId) => {
    const customer = customers?.find((c) => c.id === customerId);
    return customer?.name || "Unknown";
  };

  // Filter transactions based on type and date
  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    let filtered = transactions;

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
        const txDateRaw = tx.date || tx.createdAt;
        if (!txDateRaw) return false;
        let txDate;
        if (typeof txDateRaw === "object" && txDateRaw.toDate) {
          txDate = txDateRaw.toDate();
        } else if (txDateRaw instanceof Date) {
          txDate = txDateRaw;
        } else if (typeof txDateRaw === "string" || typeof txDateRaw === "number") {
          txDate = new Date(txDateRaw);
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
    if (!Array.isArray(filteredTransactions)) return [];
    const groups = {};
    filteredTransactions.forEach((tx) => {
      const txDateRaw = tx.date || tx.createdAt;
      if (!txDateRaw) return;
      let txDate;
      if (typeof txDateRaw === "object" && txDateRaw.toDate) {
        txDate = txDateRaw.toDate();
      } else if (txDateRaw instanceof Date) {
        txDate = txDateRaw;
      } else if (typeof txDateRaw === "string" || typeof txDateRaw === "number") {
        txDate = new Date(txDateRaw);
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
        const aRaw = a.date || a.createdAt;
        const bRaw = b.date || b.createdAt;
        let dateA, dateB;
        if (aRaw?.toDate) dateA = aRaw.toDate();
        else if (aRaw instanceof Date) dateA = aRaw;
        else if (typeof aRaw === "string" || typeof aRaw === "number") dateA = new Date(aRaw);
        else return 1;

        if (bRaw?.toDate) dateB = bRaw.toDate();
        else if (bRaw instanceof Date) dateB = bRaw;
        else if (typeof bRaw === "string" || typeof bRaw === "number") dateB = new Date(bRaw);
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
    } else if (typeof createdAt === "string" || typeof createdAt === "number") {
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
    <Page
      title={getPageTitle()}
      showBack
      onBack={() => navigate("/dashboard")}
    >

      {loading || customersLoading ? (
        <Loader text="Loading transactions..." />
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
                      onClick={() => navigate(`/ledger/${tx.customerId?._id || tx.customerId?.id || tx.customerId}`)}
                    >
                      <div className={styles.customerInfo}>
                        <strong>{tx.customerId?.name || getCustomerName(tx.customerId)}</strong>
                        {tx.note && <span className={styles.note}>{tx.note}</span>}
                      </div>
                      <div className={styles.transactionDetails}>
                        <span className={styles.time}>{formatDateTime(tx.date || tx.createdAt)}</span>
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
    </Page>
  );
}

