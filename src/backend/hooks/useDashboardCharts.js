import { useMemo } from "react";

/**
 * useDashboardCharts
 * ------------------
 * Handles:
 *  - Weekly Sales & Credit (Bar chart)
 *  - Cash Flow (Credit vs Debit)
 *  - Credit percentage
 */
export function useDashboardCharts(transactions = []) {
  const getTxDate = (createdAt) => {
    if (!createdAt) return null;
    if (createdAt.toDate) return createdAt.toDate(); // Firestore Timestamp
    if (createdAt instanceof Date) return createdAt;
    if (typeof createdAt === "number") return new Date(createdAt);
    return null;
  };

  return useMemo(() => {
    /** -------------------------
     * Init weekly structure
     * ------------------------- */
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyMap = {};

    days.forEach((d) => {
      weeklyMap[d] = {
        day: d,
        sales: 0,  // DEBIT
        credit: 0, // CREDIT
      };
    });

    let totalCredit = 0;
    let totalDebit = 0;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return {
        weeklySalesData: days.map((d) => weeklyMap[d]),
        cashFlowData: [
          { name: "Credit", amount: 0 },
          { name: "Debit", amount: 0 },
        ],
        totalCredit: 0,
        totalDebit: 0,
        creditPercentage: 0,
      };
    }

    /** -------------------------
     * Get current week range
     * (Monday → Sunday)
     * ------------------------- */
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd =
      weekStart.getTime() + 7 * 24 * 60 * 60 * 1000;

    /** -------------------------
     * Aggregate transactions
     * ------------------------- */
    for (const tx of transactions) {
      const date = getTxDate(tx.createdAt);
      if (!date) continue;

      const amount = tx.amount || 0;
      const time = date.getTime();

      if (tx.type === "CREDIT") totalCredit += amount;
      if (tx.type === "DEBIT") totalDebit += amount;

      // weekly range check
      if (time < weekStart.getTime() || time >= weekEnd) continue;

      const index = date.getDay() === 0 ? 6 : date.getDay() - 1;
      const dayName = days[index];

      if (tx.type === "DEBIT") {
        weeklyMap[dayName].sales += amount;
      } else if (tx.type === "CREDIT") {
        weeklyMap[dayName].credit += amount;
      }
    }

    const totalAmount = totalCredit + totalDebit;

    return {
      weeklySalesData: days.map((d) => weeklyMap[d]),
      cashFlowData: [
        { name: "Credit", amount: totalCredit },
        { name: "Debit", amount: totalDebit },
      ],
      totalCredit,
      totalDebit,
      creditPercentage:
        totalAmount > 0
          ? Math.round((totalCredit / totalAmount) * 100)
          : 0,
    };
  }, [transactions]);
}
