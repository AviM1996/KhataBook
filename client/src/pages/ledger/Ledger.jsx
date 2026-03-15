import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePagination } from "../../hooks/usePagination";
import { Loader, LoaderInline, Pagination } from "../../components";
import styles from "./Ledger.module.css";

export default function Ledger({ customer, entries, onAddEntry, onEditEntry, onRemoveEntry }) {
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Edit State
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");

  const chatRef = useRef(null);

  /* ================= LOADING ================= */
  if (!customer) {
    return (
      <div className={styles.page}>
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <Loader size="medium" color="green" text="Loading..." />
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

  /* ================= EDIT / DELETE ================= */
  const startEdit = (txn) => {
    setEditingTransaction(txn);
    setEditAmount(txn.amount);
    setEditNote(txn.note || "");
  };

  const cancelEdit = () => {
    setEditingTransaction(null);
    setEditAmount("");
    setEditNote("");
  };

  const handleSaveEdit = async () => {
    if (!editAmount || Number(editAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    try {
      setLoading(true);
      await onEditEntry(editingTransaction.id, {
        amount: Number(editAmount),
        note: editNote
      });
      cancelEdit();
    } catch (err) {
      alert("Failed to update transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        setLoading(true);
        await onRemoveEntry(id);
      } catch (err) {
        alert("Failed to delete transaction");
      } finally {
        setLoading(false);
      }
    }
  };

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

      await onAddEntry(
        customer.id,
        transactionType,
        value,
        note
      );

      setAmount("");
      setNote("");
      setTransactionType("CREDIT");
    } catch (err) {
      alert("Failed to add transaction");
    } finally {
      setLoading(false);
    }
  }

  /* ================= SUMMARY ================= */
  const summary = useMemo(() => {
    let credit = 0;
    let debit = 0;

    if (Array.isArray(entries) && entries.length > 0) {
      entries.forEach((e) => {
        if (e.type === "CREDIT") credit += e.amount || 0;
        else debit += e.amount || 0;
      });
    }

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
    if (chatRef.current && Array.isArray(entries) && entries.length > 0) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [entries]);

  const avatarLetter = customer.name
    ? customer.name.charAt(0).toUpperCase()
    : "?";

  /* ================= NEW MODALS LOGIC ================= */
  const [modalState, setModalState] = useState({ isOpen: false, type: null });
  // Sale Type inputs
  const [saleCategory, setSaleCategory] = useState("");
  const [saleProduct, setSaleProduct] = useState("");
  const [salePrice, setSalePrice] = useState("");
  // Payment Type inputs
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const openModal = (type) => {
    setModalState({ isOpen: true, type });
    // reset form fields
    setSaleCategory("");
    setSaleProduct("");
    setSalePrice("");
    setNote("");
    setPaymentAmount("");
    setPaymentMethod("CASH");
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null });
    setSaleCategory("");
    setSaleProduct("");
    setSalePrice("");
    setNote("");
    setPaymentAmount("");
    setPaymentMethod("CASH");
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();

    let finalAmount = 0;
    let finalNote = note;
    let finalPaymentMethod = paymentMethod;

    if (modalState.type === "DEBIT") {
      // Sale Submission
      finalAmount = Number(salePrice);
      if (!finalAmount || finalAmount <= 0) {
        alert("Please enter a valid price for the sale.");
        return;
      }
      const productNote = saleProduct ? `Product: ${saleProduct}` : "";
      const catNote = saleCategory ? `Category: ${saleCategory}` : "";
      finalNote = [catNote, productNote, note].filter(Boolean).join(" | ");
      finalPaymentMethod = "CASH"; // Assuming Sales are recorded as DEBITS, payment comes later or now.
    } else {
      // Payment Submission
      finalAmount = Number(paymentAmount);
      if (!finalAmount || finalAmount <= 0) {
        alert("Please enter a valid payment amount.");
        return;
      }
    }

    try {
      setLoading(true);

      // We need to pass paymentMethod down to addEntry
      await onAddEntry(
        customer.id,
        modalState.type, // DEBIT for Sale, CREDIT for Payment
        finalAmount,
        finalNote,       // Our constructed or raw note
        finalPaymentMethod
      );

      closeModal();
    } catch (err) {
      alert("Failed to submit transaction");
    } finally {
      setLoading(false);
    }
  };

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
        {(!Array.isArray(entries) || entries.length === 0) && (
          <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
            No transactions yet
          </div>
        )}

        {Array.isArray(paginatedEntries) && paginatedEntries.length > 0 && paginatedEntries.map((e) => {
          const isReceived = e.type === "CREDIT";
          const isEditing = editingTransaction?.id === e.id;

          return (
            <div
              key={e.id}
              className={`${styles.msg} ${
                isReceived ? styles.received : styles.paid
              }`}
            >
              <div className={styles.bubble}>
                {isEditing ? (
                  <div className={styles.editForm}>
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(ev) => setEditAmount(ev.target.value)}
                      className={styles.editInput}
                      min="1"
                    />
                    <input
                      type="text"
                      value={editNote}
                      onChange={(ev) => setEditNote(ev.target.value)}
                      className={styles.editInput}
                      placeholder="Note"
                    />
                    <div className={styles.editActions}>
                      <button onClick={handleSaveEdit} className={styles.saveBtn}>Save</button>
                      <button onClick={cancelEdit} className={styles.cancelBtn}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={styles.amount}>
                      ₹{e.amount.toLocaleString("en-IN")}
                    </p>
                    {e.note && <p className={styles.note}>{e.note}</p>}
                    <div className={styles.metaRow}>
                      <span className={styles.time}>
                        {formatDate(e.createdAt)} {formatTime(e.createdAt)}
                      </span>
                      <div className={styles.actionIcons}>
                        <button 
                          className={styles.iconBtn} 
                          onClick={() => startEdit(e)}
                          title="Edit Transaction"
                        >
                          ✎
                        </button>
                        <button 
                          className={styles.iconBtn} 
                          onClick={() => handleDelete(e.id)}
                          title="Delete Transaction"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {Array.isArray(entries) && entries.length > 20 && (
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

      {/* ACTION BAR */}
      <footer className={styles.actionBar}>
        <button className={`${styles.actionBtn} ${styles.sale}`} onClick={() => openModal("DEBIT")}>
          Sale
        </button>
        <button className={`${styles.actionBtn} ${styles.payment}`} onClick={() => openModal("CREDIT")}>
          Payment
        </button>
      </footer>

      {/* MODALS */}
      {modalState.isOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{modalState.type === "DEBIT" ? "Record Sale" : "Record Payment"}</h2>
              <button className={styles.closeBtn} onClick={closeModal}>&times;</button>
            </div>
            
            <form className={styles.modalBody} onSubmit={handleModalSubmit}>
              {modalState.type === "DEBIT" ? (
                <>
                  {/* SALE FIELDS */}
                  <div className={styles.inputGroup}>
                    <label>Product Category</label>
                    <input 
                      type="text" 
                      value={saleCategory} 
                      onChange={e => setSaleCategory(e.target.value)} 
                      placeholder="e.g. Electronics, Groceries"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Product (Optional)</label>
                    <input 
                      type="text" 
                      value={saleProduct} 
                      onChange={e => setSaleProduct(e.target.value)} 
                      placeholder="e.g. Wire, Rice"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Notes</label>
                    <textarea 
                      rows={2}
                      value={note} 
                      onChange={e => setNote(e.target.value)} 
                      placeholder="Additional details..."
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Price (₹)</label>
                    <input 
                      type="number" 
                      min="1" 
                      required 
                      value={salePrice} 
                      onChange={e => setSalePrice(e.target.value)} 
                      placeholder="Enter price"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* PAYMENT FIELDS */}
                  <div className={styles.inputGroup}>
                    <label>Amount (₹)</label>
                    <input 
                      type="number" 
                      min="1" 
                      autoFocus
                      required 
                      value={paymentAmount} 
                      onChange={e => setPaymentAmount(e.target.value)} 
                      placeholder="Enter payment amount"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Payment Method</label>
                    <select 
                      value={paymentMethod} 
                      onChange={e => setPaymentMethod(e.target.value)}
                    >
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Notes (Optional)</label>
                    <textarea 
                      rows={2}
                      value={note} 
                      onChange={e => setNote(e.target.value)} 
                      placeholder="Enter details about this payment..."
                    />
                  </div>
                </>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className={`${styles.submitBtn} ${modalState.type === "DEBIT" ? styles.sale : styles.payment}`}
              >
                {loading ? "Saving..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
