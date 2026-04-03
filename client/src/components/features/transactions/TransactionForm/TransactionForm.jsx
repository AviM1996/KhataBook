import React, { useState, useRef, useEffect } from "react";
import styles from "./TransactionForm.module.css";
import { usePartyQuery } from "../../../hooks/usePartyQuery";
import Button from "../../../components/ui/Button/Button";
import { MdSearch, MdAdd, MdCheckCircle, MdPayment, MdReceipt } from "react-icons/md";
import { LuIndianRupee } from "react-icons/lu";

/**
 * TransactionForm Component
 * Optimized for minimal clicks (4-5) and mobile-first UX.
 * Uses "Stitch" design tokens (glassmorphism, Manrope font).
 */
export default function TransactionForm({ onSubmit, initialType = "SALE", recordType = "CUSTOMER" }) {
  // --- Form State ---
  const [party, setParty] = useState(null); // { _id, name }
  const [search, setSearch] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState(initialType);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [description, setDescription] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);

  // --- Refs for Auto-Focus ---
  const amountRef = useRef(null);
  const searchRef = useRef(null);
  const submitRef = useRef(null);

  // --- Data Fetching ---
  const { data: parties, loading: partiesLoading } = usePartyQuery({
    recordType,
    search,
    limit: 10,
  });

  // --- Handlers ---
  const handleSelectParty = (p) => {
    setParty(p);
    setSearch(p.name);
    setShowPartyDropdown(false);
    // 💡 Auto-focus next field
    setTimeout(() => amountRef.current?.focus(), 100);
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setAmount(val);
    }
  };

  const handleAmountKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // 💡 If all valid, focus submit
      if (party && amount && parseFloat(amount) > 0) {
        // We'll give it a small timeout to let the state settle
        setTimeout(() => {
          const btn = document.querySelector(`.${styles.submitBtn}`);
          btn?.focus();
        }, 50);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!party || !amount || parseFloat(amount) <= 0) return;

    const payload = {
      partyId: party._id,
      amount: parseFloat(amount),
      type,
      paymentMethod,
      ...(description.trim() && { description: description.trim() }),
    };
    onSubmit?.(payload);
  };

  // --- Render ---
  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.formCard}>
        {/* 🏢 Party Selector (Searchable) */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Select Party</label>
          <div className={styles.searchWrapper}>
            <MdSearch className={styles.searchIcon} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search customer..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowPartyDropdown(true);
              }}
              onFocus={() => setShowPartyDropdown(true)}
            />
          </div>

          {showPartyDropdown && search.length > 0 && (
            <div className={styles.dropdown}>
              {partiesLoading ? (
                <div className={styles.dropdownItem}>Loading...</div>
              ) : parties.length > 0 ? (
                parties.map((p) => (
                  <div
                    key={p._id}
                    className={styles.dropdownItem}
                    onClick={() => handleSelectParty(p)}
                  >
                    <span className={styles.partyName}>{p.name}</span>
                    <span className={styles.partyPhone}>{p.phone}</span>
                  </div>
                ))
              ) : (
                <div className={styles.dropdownItem}>No party found</div>
              )}
            </div>
          )}
        </div>

        {/* 💰 Amount Input */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Amount</label>
          <div className={styles.amountWrapper}>
            <LuIndianRupee className={styles.rupeeIcon} />
            <input
              ref={amountRef}
              type="text"
              placeholder="0.00"
              className={styles.amountInput}
              value={amount}
              onChange={handleAmountChange}
              onKeyDown={handleAmountKeyDown}
              inputMode="decimal"
            />
          </div>
        </div>

        {/* 🔄 Transaction Type (Toggle) */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Transaction Type</label>
          <div className={styles.toggleRow}>
            {["SALE", "PURCHASE", "PAYMENT", "RETURN"].map((t) => (
              <button
                key={t}
                type="button"
                className={`${styles.toggleBtn} ${type === t ? styles.active : ""}`}
                onClick={() => setType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 💳 Payment Method (Quick Buttons) */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Payment Method</label>
          <div className={styles.methodRow}>
            {["CASH", "UPI", "BANK_TRANSFER"].map((m) => (
              <button
                key={m}
                type="button"
                className={`${styles.methodBtn} ${paymentMethod === m ? styles.activeMethod : ""}`}
                onClick={() => setPaymentMethod(m)}
              >
                {m.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* 📝 Notes (Expandable) */}
        <div className={styles.notesSection}>
          {!showNotes ? (
            <button
              type="button"
              className={styles.addNoteBtn}
              onClick={() => setShowNotes(true)}
            >
              <MdAdd /> Add Note
            </button>
          ) : (
            <div className={styles.notesWrapper}>
              <textarea
                placeholder="Enter transaction details..."
                className={styles.notesTextarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoFocus
              />
            </div>
          )}
        </div>

        {/* 📋 Summary (Small) */}
        {(party || amount) && (
          <div className={styles.summaryBar}>
            <div className={styles.summaryItem}>
              <span className={styles.sumLabel}>Party:</span>
              <span className={styles.sumVal}>{party?.name || "—"}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.sumLabel}>Amount:</span>
              <span className={styles.sumVal}>₹{amount || "0"}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.sumLabel}>Type:</span>
              <span className={styles.sumVal}>{type}</span>
            </div>
          </div>
        )}

        {/* 🔥 Submit */}
        <Button
          type="submit"
          fullWidth
          disabled={!party || !amount || parseFloat(amount) <= 0}
          className={styles.submitBtn}
          icon={<MdCheckCircle />}
        >
          Confirm Transaction
        </Button>
      </form>
    </div>
  );
}
