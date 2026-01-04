import { useMemo } from "react";

export function useDashboardStats(transactions = []) {
  const getTxDate = (createdAt) => {
    if (!createdAt) return null;
    if (createdAt.toDate) return createdAt.toDate();
    if (createdAt instanceof Date) return createdAt;
    if (typeof createdAt === "number") return new Date(createdAt);
    return null;
  };

  return useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return {
        todaySales: 0,
        todayCredit: 0,
        totalCredit: 0,
        totalDebit: 0,
        outstandingBalance: 0,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    const tomorrowStart = todayStart + 24 * 60 * 60 * 1000;

    let todaySales = 0;
    let todayCredit = 0;
    let totalCredit = 0;
    let totalDebit = 0;

    for (const tx of transactions) {
      const date = getTxDate(tx.createdAt);
      if (!date) continue;

      const amount = tx.amount || 0;
      const time = date.getTime();

      if (tx.type === "CREDIT") {
        totalCredit += amount;
        if (time >= todayStart && time < tomorrowStart) {
          todayCredit += amount;
        }
      }

      if (tx.type === "DEBIT") {
        totalDebit += amount;
        if (time >= todayStart && time < tomorrowStart) {
          todaySales += amount;
        }
      }
    }

    return {
      todaySales,
      todayCredit,
      totalCredit,
      totalDebit,
      outstandingBalance: totalCredit - totalDebit,
    };
  }, [transactions]);
}
