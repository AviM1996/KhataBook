import { useMemo } from "react";

/**
 * useCustomersAnalytics
 * ---------------------
 * Combines:
 *  - customer balances
 *  - summary stats
 *  - defaulters
 *  - reminders
 */
export function useCustomersAnalytics(customers = [], transactions = []) {
  return useMemo(() => {
    const balances = {};
    let totalCredit = 0;
    let totalDebit = 0;

    // -------- Transactions aggregation --------
    for (const tx of transactions) {
      if (!tx.customerId) continue;

      const amount = Number(tx.amount) || 0;
      const type = tx.type?.toUpperCase();

      if (!balances[tx.customerId]) {
        balances[tx.customerId] = 0;
      }

      if (type === "CREDIT") {
        balances[tx.customerId] += amount;
        totalCredit += amount;
      }

      if (type === "DEBIT") {
        balances[tx.customerId] -= amount;
        totalDebit += amount;
      }
    }

    // -------- Defaulters & reminders --------
    let defaulters = 0;
    const reminders = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const c of customers) {
      const bal = balances[c.id] || 0;
      if (bal < 0) defaulters++;

      if (c.reminderDate) {
        const d = new Date(c.reminderDate);
        d.setHours(0, 0, 0, 0);
        if (d <= today) reminders.push(c);
      }
    }

    return {
      balances,

      summary: {
        totalCustomers: customers.length,
        defaulters,
        totalCredit,
        totalDebit,
        outstanding: totalCredit - totalDebit,
      },

      reminders,
    };
  }, [customers, transactions]);
}
