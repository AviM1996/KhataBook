import React, { useState } from 'react';
import styles from './TransactionForm.module.css';

export default function TransactionForm({ activeTab, onAdd }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: activeTab === 'customer' ? 'SALE' : 'PURCHASE',
    amount: '',
    paymentMethod: 'CASH',
    date: new Date().toISOString().slice(0, 10),
    description: '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return;
    setLoading(true);
    try {
      await onAdd(form);
      setForm({
        type: activeTab === 'customer' ? 'SALE' : 'PURCHASE',
        amount: '',
        paymentMethod: 'CASH',
        date: new Date().toISOString().slice(0, 10),
        description: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const customerTypes = [
    { value: 'SALE',    label: 'Sale' },
    { value: 'PAYMENT', label: 'Payment Received' },
    { value: 'RETURN',  label: 'Return' },
  ];
  const supplierTypes = [
    { value: 'PURCHASE', label: 'Purchase' },
    { value: 'PAYMENT',  label: 'Payment Made' },
    { value: 'RETURN',   label: 'Return' },
  ];
  const types = activeTab === 'customer' ? customerTypes : supplierTypes;

  return (
    <div className={styles.formBar}>
      <form className={styles.row} onSubmit={handleSubmit}>

        {/* Type */}
        <div className={`${styles.field} ${styles.typeField}`}>
          <label>Type</label>
          <select value={form.type} onChange={(e) => set('type', e.target.value)}>
            {types.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div className={`${styles.field} ${styles.amtField}`}>
          <label>Amount (₹)</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
          />
        </div>

        {/* Payment Method */}
        <div className={`${styles.field} ${styles.methodField}`}>
          <label>Method</label>
          <select value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CHEQUE">Cheque</option>
            <option value="N/A">N/A</option>
          </select>
        </div>

        {/* Date */}
        <div className={`${styles.field} ${styles.dateField}`}>
          <label>Date</label>
          <input
            required
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </div>

        {/* Note */}
        <div className={`${styles.field} ${styles.noteField}`}>
          <label>Note</label>
          <input
            type="text"
            placeholder="Optional…"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        {/* Submit */}
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? '…' : '✓ Add'}
        </button>

      </form>
    </div>
  );
}
