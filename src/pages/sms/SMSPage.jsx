import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCustomers } from "../../hooks/useCustomers";
import { useTransactions } from "../../hooks/useTransactions";
import { sendSMS, generateReminderSMS, generateTransactionSMS, getSMSBalance, setSMSBalance } from "../../utils/sms.service";
import BufferIcon from "../../components/BufferIcon";
import { BufferIconInline } from "../../components/BufferIcon";
import styles from "./SMSPage.module.css";

export default function SMSPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerIdFromUrl = searchParams.get("customer");
  const { customers, loading: customersLoading } = useCustomers();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const [selectedCustomer, setSelectedCustomer] = useState(customerIdFromUrl || "");
  const [smsType, setSmsType] = useState("reminder"); // reminder, transaction, custom
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [smsBalance, setSmsBalanceState] = useState(getSMSBalance());

  // Set customer from URL parameter
  useEffect(() => {
    if (customerIdFromUrl && customers.length > 0) {
      const customerExists = customers.find((c) => c.id === customerIdFromUrl);
      if (customerExists) {
        setSelectedCustomer(customerIdFromUrl);
      }
    }
  }, [customerIdFromUrl, customers]);

  // Calculate customer balances
  const customerBalances = useMemo(() => {
    const balances = {};
    if (transactions && transactions.length > 0) {
      transactions.forEach((tx) => {
        if (!tx.customerId) return;
        if (!balances[tx.customerId]) {
          balances[tx.customerId] = 0;
        }
        if (tx.type === "CREDIT") {
          balances[tx.customerId] += tx.amount || 0;
        } else if (tx.type === "DEBIT") {
          balances[tx.customerId] -= tx.amount || 0;
        }
      });
    }
    return balances;
  }, [transactions]);

  // Get customers with reminders
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

  // Get defaulters (negative balance)
  const defaulters = useMemo(() => {
    return customers.filter((customer) => {
      const balance = customerBalances[customer.id] || 0;
      return balance < 0;
    });
  }, [customers, customerBalances]);

  const selectedCustomerData = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomer);
  }, [customers, selectedCustomer]);

  const selectedCustomerBalance = selectedCustomerData
    ? customerBalances[selectedCustomerData.id] || 0
    : 0;

  const handleSendSMS = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }

    const customer = selectedCustomerData;
    if (!customer.phone) {
      alert("Customer phone number is missing");
      return;
    }

    const balance = getSMSBalance();
    if (balance <= 0) {
      alert("Insufficient SMS balance. Please recharge.");
      return;
    }

    if (!window.confirm(`Send SMS to ${customer.name}? (Balance: ${balance} SMS)`)) {
      return;
    }

    try {
      setLoading(true);
      let message = "";

      if (smsType === "reminder") {
        message = generateReminderSMS(
          customer.name,
          selectedCustomerBalance,
          customer.reminderDate
        );
      } else if (smsType === "transaction") {
        // For transaction, we'll use the last transaction or show a generic message
        const lastTransaction = transactions
          .filter((tx) => tx.customerId === customer.id)
          .sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          })[0];

        if (lastTransaction) {
          message = generateTransactionSMS(
            customer.name,
            lastTransaction.type,
            lastTransaction.amount,
            selectedCustomerBalance,
            lastTransaction.note
          );
        } else {
          message = generateReminderSMS(customer.name, selectedCustomerBalance, null);
        }
      } else {
        // Custom message
        if (!customMessage.trim()) {
          alert("Please enter a custom message");
          return;
        }
        message = customMessage;
      }

      await sendSMS(customer.phone, message);
      // Update balance after SMS is sent (balance is deducted in sendSMS)
      const newBalance = getSMSBalance();
      setSmsBalanceState(newBalance);
      alert(`SMS sent to ${customer.name} successfully!\nRemaining balance: ${newBalance} SMS`);
      
      // Reset form
      setSelectedCustomer("");
      setCustomMessage("");
    } catch (error) {
      console.error("SMS Error:", error);
      alert(`Failed to send SMS: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulkReminders = async () => {
    const customersToRemind = customersWithReminders.length > 0 
      ? customersWithReminders 
      : defaulters;

    if (customersToRemind.length === 0) {
      alert("No customers to send reminders to");
      return;
    }

    const balance = getSMSBalance();
    if (balance < customersToRemind.length) {
      alert(`Insufficient SMS balance. Need ${customersToRemind.length} SMS, have ${balance}`);
      return;
    }

    if (!window.confirm(`Send reminder SMS to ${customersToRemind.length} customers?`)) {
      return;
    }

    try {
      setLoading(true);
      let successCount = 0;
      let failCount = 0;

      for (const customer of customersToRemind) {
        if (!customer.phone) {
          failCount++;
          continue;
        }

        try {
          const balance = customerBalances[customer.id] || 0;
          const message = generateReminderSMS(
            customer.name,
            balance,
            customer.reminderDate
          );
          await sendSMS(customer.phone, message);
          successCount++;
          // Small delay to avoid overwhelming
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`Failed to send SMS to ${customer.name}:`, err);
          failCount++;
        }
      }

      // Update balance after bulk SMS
      const newBalance = getSMSBalance();
      setSmsBalanceState(newBalance);
      alert(`Bulk SMS completed!\nSuccess: ${successCount}\nFailed: ${failCount}\nRemaining balance: ${newBalance} SMS`);
    } catch (error) {
      console.error("Bulk SMS Error:", error);
      alert(`Bulk SMS failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = () => {
    const amount = prompt("Enter SMS balance to add:");
    if (amount && !isNaN(amount) && parseInt(amount) > 0) {
      const newBalance = smsBalance + parseInt(amount);
      setSMSBalance(newBalance);
      setSmsBalanceState(newBalance);
      alert(`SMS balance updated to ${newBalance}`);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2>Send SMS</h2>
        <div className={styles.balanceInfo}>
          <span>SMS Balance: {smsBalance}</span>
          <button className={styles.rechargeBtn} onClick={handleRecharge}>
            Recharge
          </button>
        </div>
      </div>

      {customersLoading || transactionsLoading ? (
        <div className={styles.loadingContainer}>
          <BufferIcon size="medium" color="green" text="Loading..." />
        </div>
      ) : (
        <div className={styles.content}>
          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <h3>Quick Actions</h3>
            <div className={styles.actionButtons}>
              <button
                className={styles.bulkBtn}
                onClick={handleSendBulkReminders}
                disabled={loading || (customersWithReminders.length === 0 && defaulters.length === 0)}
              >
                📱 Send Reminders to All
                <small>
                  ({customersWithReminders.length > 0 
                    ? customersWithReminders.length 
                    : defaulters.length} customers)
                </small>
              </button>
            </div>
          </div>

          {/* SMS Form */}
          <div className={styles.smsForm}>
            <h3>Send Individual SMS</h3>

            <div className={styles.formGroup}>
              <label>Select Customer</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className={styles.select}
              >
                <option value="">-- Select Customer --</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.phone || "No phone"})
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className={styles.customerInfo}>
                <div className={styles.infoRow}>
                  <span>Name:</span>
                  <strong>{selectedCustomerData?.name}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Phone:</span>
                  <strong>{selectedCustomerData?.phone || "N/A"}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Balance:</span>
                  <strong className={selectedCustomerBalance >= 0 ? styles.green : styles.red}>
                    ₹{Math.abs(selectedCustomerBalance).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label>SMS Type</label>
              <div className={styles.radioGroup}>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name="smsType"
                    value="reminder"
                    checked={smsType === "reminder"}
                    onChange={(e) => setSmsType(e.target.value)}
                  />
                  <span>Reminder</span>
                </label>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name="smsType"
                    value="transaction"
                    checked={smsType === "transaction"}
                    onChange={(e) => setSmsType(e.target.value)}
                  />
                  <span>Transaction Update</span>
                </label>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name="smsType"
                    value="custom"
                    checked={smsType === "custom"}
                    onChange={(e) => setSmsType(e.target.value)}
                  />
                  <span>Custom Message</span>
                </label>
              </div>
            </div>

            {smsType === "custom" && (
              <div className={styles.formGroup}>
                <label>Custom Message</label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter your custom message..."
                  className={styles.textarea}
                  rows={5}
                />
              </div>
            )}

            {smsType !== "custom" && selectedCustomer && (
              <div className={styles.preview}>
                <h4>Message Preview:</h4>
                <div className={styles.previewContent}>
                  {smsType === "reminder" && selectedCustomerData && (
                    <pre>
                      {generateReminderSMS(
                        selectedCustomerData.name,
                        selectedCustomerBalance,
                        selectedCustomerData.reminderDate
                      )}
                    </pre>
                  )}
                  {smsType === "transaction" && selectedCustomerData && (
                    <pre>
                      {(() => {
                        const lastTx = transactions
                          .filter((tx) => tx.customerId === selectedCustomerData.id)
                          .sort((a, b) => {
                            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                            return dateB.getTime() - dateA.getTime();
                          })[0];
                        return lastTx
                          ? generateTransactionSMS(
                              selectedCustomerData.name,
                              lastTx.type,
                              lastTx.amount,
                              selectedCustomerBalance,
                              lastTx.note
                            )
                          : generateReminderSMS(selectedCustomerData.name, selectedCustomerBalance, null);
                      })()}
                    </pre>
                  )}
                </div>
              </div>
            )}

            <button
              className={styles.sendBtn}
              onClick={handleSendSMS}
              disabled={loading || !selectedCustomer || smsBalance <= 0}
            >
              {loading ? (
                <>
                  <BufferIconInline size="small" color="white" />
                  Sending...
                </>
              ) : (
                "📱 Send SMS"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

