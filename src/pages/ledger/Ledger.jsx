import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePagination } from "../../hooks/usePagination";
import {
  sendSMS,
  generateTransactionSMS,
  getSMSBalance,
} from "../../utils/sms.service";
import BufferIcon from "../../components/BufferIcon";
import { BufferIconInline } from "../../components/BufferIcon";
import Pagination from "../../components/Pagination";
import styles from "./Ledger.module.css";

export default function Ledger({ customer, entries, onTransaction }) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [transactionType, setTransactionType] = useState("CREDIT");
  const [loading, setLoading] = useState(false);
  const [sendSMSNotification, setSendSMSNotification] = useState(false);
  const chatRef = useRef(null);

  /* ================= LOADING ================= */
  if (!customer) {
    return (
      <div className={styles.page}>
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <BufferIcon size="medium" color="green" text="Loading..." />
        </div>
      </div>
    );
  }

  /* ================= HELPERS ================= */
  function formatDate(date) {
    if (!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(date) {
    if (!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /* ================= SUBMIT ================= */
  async function handleSubmit(e) {
    e.preventDefault();

    const value = Number(amount);
    if (!value || value <= 0) {
      alert("Please enter valid amount");
      return;
    }

    try {
      setLoading(true);

      // ✅ FIX: customer.id পাঠানো হচ্ছে
      await onTransaction(
        customer.id,        // 🔥 THIS WAS MISSING
        transactionType,
        value,
        note
      );

      const newBalance =
        transactionType === "CREDIT"
          ? summary.balance + value
          : summary.balance - value;

      // SMS
      if (sendSMSNotification && customer.phone) {
        const smsBalance = getSMSBalance();
        if (smsBalance <= 0) {
          alert("Transaction added but SMS balance insufficient");
        } else {
          const message = generateTransactionSMS(
            customer.name,
            transactionType,
            value,
            newBalance,
            note
          );
          await sendSMS(customer.phone, message);
        }
      }

      setAmount("");
      setNote("");
      setTransactionType("CREDIT");
      setSendSMSNotification(false);
    } catch (err) {
      console.error("Transaction error:", err);
      alert("Failed to add transaction");
    } finally {
      setLoading(false);
    }
  }

  /* ================= SUMMARY ================= */
  const summary = useMemo(() => {
    let credit = 0;
    let debit = 0;

    entries.forEach((e) => {
      if (e.type === "CREDIT") credit += e.amount;
      else debit += e.amount;
    });

    return {
      credit,
      debit,
      balance: credit - debit,
    };
  }, [entries]);

  /* ================= PAGINATION ================= */
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedEntries,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(entries, 20);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    if (chatRef.current && entries.length > 0) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [entries.length]);

  const avatarLetter = customer.name
    ? customer.name.charAt(0).toUpperCase()
    : "?";

  /* ================= UI ================= */
  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.chatHeader}>
        <div className={styles.user}>
          <div className={styles.avatar}>{avatarLetter}</div>
          <div className={styles.userInfo}>
            <h2>{customer.name}</h2>
            <small className={styles.phone}>☎ {customer.phone}</small>
            {customer.address && (
              <small className={styles.address}>{customer.address}</small>
            )}
          </div>
        </div>

        <div className={styles.headerRight}>
          <button
            className={styles.smsPageBtn}
            onClick={() => navigate(`/sms?customer=${customer.id}`)}
          >
            📱 SMS
          </button>
          <div
            className={`${styles.balance} ${
              summary.balance >= 0 ? styles.green : styles.red
            }`}
          >
            ₹{summary.balance.toLocaleString("en-IN")}
            <span>Balance</span>
          </div>
        </div>
      </header>

      {/* CHAT */}
      <section className={styles.chat} ref={chatRef}>
        {entries.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
            No transactions yet
          </div>
        )}

        {paginatedEntries.map((e) => {
          const isReceived = e.type === "CREDIT";
          return (
            <div
              key={e.id}
              className={`${styles.msg} ${
                isReceived ? styles.received : styles.paid
              }`}
            >
              <div className={styles.bubble}>
                <p className={styles.amount}>
                  ₹{e.amount.toLocaleString("en-IN")}
                </p>
                {e.note && <p className={styles.note}>{e.note}</p>}
                <span className={styles.time}>
                  {formatDate(e.createdAt)} {formatTime(e.createdAt)}
                </span>
              </div>
            </div>
          );
        })}

        {entries.length > 20 && (
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
      </section>

      {/* INPUT */}
      <footer className={styles.chatInput}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
        />
        <select
          value={transactionType}
          onChange={(e) => setTransactionType(e.target.value)}
        >
          <option value="CREDIT">Received</option>
          <option value="DEBIT">Paid</option>
        </select>
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <label className={styles.smsCheckbox}>
          <input
            type="checkbox"
            checked={sendSMSNotification}
            onChange={(e) => setSendSMSNotification(e.target.checked)}
            disabled={!customer.phone}
          />
          <span>📱 SMS</span>
        </label>
        <button onClick={handleSubmit} disabled={loading || !amount}>
          {loading ? <BufferIconInline size="small" /> : "Add"}
        </button>
      </footer>
    </div>
  );
}
