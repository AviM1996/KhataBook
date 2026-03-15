import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCustomers } from "../../hooks/useCustomers";
import { Page, Loader, Button } from "../../components";
import styles from "./editCustomerPage.module.css";

export default function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    loading,
  } = useCustomers();

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    currentBalance: "",
    balanceDirection: "Receivable",
    reminderDate: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 🔹 wait until customers loaded
  useEffect(() => {
    if (loading) return;

    const customer = getCustomerById(id);

    if (!customer) {
      navigate("/customers");
      return;
    }

    setForm({
      name: customer.name || "",
      address: customer.address || "",
      phone: customer.phone || "",
      currentBalance: customer.currentBalance || "",
      balanceDirection: customer.balanceDirection || "Receivable",
      reminderDate: customer.reminderDate ? new Date(customer.reminderDate).toISOString().split('T')[0] : "",
      notes: customer.notes || "",
    });
  }, [id, loading, getCustomerById, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Update all fields
      await updateCustomer(id, {
        name: form.name,
        address: form.address,
        phone: form.phone,
        reminderDate: form.reminderDate || null,
        notes: form.notes || "",
      });
      navigate("/customers");
    } catch (err) {
      setError("Failed to update customer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${form.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteCustomer(id);
      navigate("/customers");
    } catch (err) {
      setError("Failed to delete customer");
    }
  };

  return (
    <Page
      title="Edit Customer"
      subtitle={`Update details for ${form.name || 'customer'}`}
      showBack
      onBack={() => navigate("/customers")}
      loading={loading && "Loading customer data..."}
    >
      {/* FORM */}
      <form className={styles.card} onSubmit={handleSubmit}>
        {/* BASIC INFO */}
        <div className={styles.section}>
          <h4>Basic Information</h4>

          <label className={styles.label}>
            Customer Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </label>

          <label className={styles.label}>
            Phone Number
            <input
              type="tel"
              name="phone"
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
            Current Balance
            <input
              type="number"
              name="currentBalance"
              value={form.currentBalance}
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
              value={form.notes}
              onChange={handleChange}
              className={styles.textarea}
            />
          </label>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {/* ACTIONS */}
        <div className={`${styles.actions} ${styles.space}`}>
          <Button
            variant="outline"
            onClick={handleDelete}
            className={styles.dangerBtn}
          >
            Delete Customer
          </Button>
          <div className={styles.rightActions}>
            <Button
              variant="secondary"
              onClick={() => navigate("/customers")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting ? "Updating..." : false}
            >
              Update
            </Button>
          </div>
        </div>
      </form>
    </Page>
  );
}
