import { useMemo } from "react";

export function useDashboardData(transactions = []) {
  const getTxDate = (tx) => {
    // Backend might return "date" or "createdAt"
    const tz = tx.date || tx.createdAt;
    if (!tz) return null;
    if (tz.toDate) return tz.toDate();
    if (tz instanceof Date) return tz;
    if (typeof tz === "string") return new Date(tz);
    if (typeof tz === "number") return new Date(tz);
    return null;
  };

  return useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const emptyResult = {
      todaySales: 0,
      todayCredit: 0,
      totalCredit: 0,
      totalDebit: 0,
      outstandingBalance: 0,
      weeklySalesData: days.map((d) => ({ day: d, sales: 0, credit: 0 })),
      cashFlowData: [
        { name: "Credit", amount: 0 },
        { name: "Debit", amount: 0 },
      ],
      creditPercentage: 0,
    };

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return emptyResult;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    const tomorrowStart = todayStart + 24 * 60 * 60 * 1000;

    const weeklyMap = {};
    days.forEach((d) => {
      weeklyMap[d] = { day: d, sales: 0, credit: 0 };
    });

    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(today);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = weekStart.getTime() + 7 * 24 * 60 * 60 * 1000;

    let todaySales = 0;
    let todayCredit = 0;
    let totalCredit = 0;
    let totalDebit = 0;

    for (const tx of transactions) {
      const date = getTxDate(tx);
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

      if (time >= weekStart.getTime() && time < weekEnd) {
        const index = date.getDay() === 0 ? 6 : date.getDay() - 1;
        const dayName = days[index];

        if (tx.type === "DEBIT") {
          weeklyMap[dayName].sales += amount;
        } else if (tx.type === "CREDIT") {
          weeklyMap[dayName].credit += amount;
        }
      }
    }

    const totalAmount = totalCredit + totalDebit;

    return {
      todaySales,
      todayCredit,
      totalCredit,
      totalDebit,
      outstandingBalance: totalCredit - totalDebit,
      weeklySalesData: days.map((d) => weeklyMap[d]),
      cashFlowData: [
        { name: "Credit", amount: totalCredit },
        { name: "Debit", amount: totalDebit },
      ],
      creditPercentage: totalAmount > 0 ? Math.round((totalCredit / totalAmount) * 100) : 0,
    };
  }, [transactions]);
}
