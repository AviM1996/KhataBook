import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCustomer } from "../../api/customer";
import { Page, Button } from "../../components";
import styles from "./AddCustomerPage.module.css";

export default function AddCustomer() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    openingBalance: "",
    balanceDirection: "Receivable",
    reminderDate: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.phone) {
      setError("Name and phone are required");
      return;
    }

    try {
      setLoading(true);

      // Node backend add
      await createCustomer({
        name: form.name,
        address: form.address,
        phone: form.phone,
        reminderDate: form.reminderDate || null,
        notes: form.notes || "",
      });

      // ✅ back to list
      navigate("/customers");
    } catch (err) {
      setError("Failed to add customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page
      title="Add Customer"
      subtitle="Create a new customer profile"
      showBack
      onBack={() => navigate("/customers")}
    >
      {/* FORM */}
      <form className={styles.card} onSubmit={handleSubmit}>
        {/* BASIC INFO */}
        <div className={styles.section}>
          <h4>Basic Information</h4>

          <label className={styles.label}>
            Customer Name *
            <input
              type="text"
              name="name"
              placeholder="e.g. Ravi Store"
              value={form.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </label>

          <label className={styles.label}>
            Phone Number *
            <input
              type="tel"
              name="phone"
              placeholder="10 digit mobile number"
              value={form.phone}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </label>

          <label className={styles.label}>
            Address
            <textarea
              name="address"
              placeholder="Street, area, city (optional)"
              value={form.address}
              onChange={handleChange}
              className={styles.textarea}
            />
          </label>
        </div>

        {/* FINANCIAL INFO */}
        <div className={styles.section}>
          <h4>Financial Details</h4>

          <label className={styles.label}>
            Opening Balance
            <input
              type="number"
              name="openingBalance"
              placeholder="0"
              value={form.openingBalance}
              onChange={handleChange}
              className={styles.input}
            />
          </label>

          <div className={styles.toggle}>
            <span>Balance Direction</span>
            <div className={styles.options}>
              <label className={`${styles.opt} ${styles.green}`}>
                <input
                  type="radio"
                  name="balanceDirection"
                  value="Receivable"
                  checked={form.balanceDirection === "Receivable"}
                  onChange={handleChange}
                />
                <span>Receivable</span>
              </label>
              <label className={`${styles.opt} ${styles.red}`}>
                <input
                  type="radio"
                  name="balanceDirection"
                  value="Payable"
                  checked={form.balanceDirection === "Payable"}
                  onChange={handleChange}
                />
                <span>Payable</span>
              </label>
            </div>
          </div>
        </div>

        {/* EXTRA */}
        <div className={styles.section}>
          <h4>Additional Info</h4>

          <label className={styles.label}>
            Reminder Date
            <input
              type="date"
              name="reminderDate"
              value={form.reminderDate}
              onChange={handleChange}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Notes
            <textarea
              name="notes"
              placeholder="Internal notes (optional)"
              value={form.notes}
              onChange={handleChange}
              className={styles.textarea}
            />
          </label>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {/* ACTIONS */}
        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => navigate("/customers")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading ? "Saving..." : false}
          >
            Save Customer
          </Button>
        </div>
      </form>
    </Page>
  );
}
