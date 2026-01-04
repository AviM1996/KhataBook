/**
 * 📊 Get Weekly Sales & Credit Data
 * Calculate sales (DEBIT) and credit (CREDIT) for each day of the current week
 */

export const getWeeklySalesData = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  // Get current week's start date (Monday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(today.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  // Days of week
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekData = {};

  // Initialize all days with 0
  days.forEach((day, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    weekData[day] = {
      day,
      sales: 0,  // DEBIT
      credit: 0, // CREDIT
      date: date.toISOString().split("T")[0],
    };
  });

  // Calculate sales and credit for each day
  transactions.forEach((tx) => {
    if (!tx.createdAt) return;

    let txDate;
    if (typeof tx.createdAt === "object" && tx.createdAt.toDate) {
      txDate = tx.createdAt.toDate();
    } else if (tx.createdAt instanceof Date) {
      txDate = tx.createdAt;
    } else if (typeof tx.createdAt === "number") {
      txDate = new Date(tx.createdAt);
    } else {
      return;
    }

    // Check if transaction is in current week
    const txTime = txDate.getTime();
    const weekEndTime = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).getTime();

    if (txTime >= weekStart.getTime() && txTime < weekEndTime) {
      const dayIndex = txDate.getDay() === 0 ? 6 : txDate.getDay() - 1;
      const dayName = days[dayIndex];
      
      if (weekData[dayName]) {
        if (tx.type === "DEBIT") {
          weekData[dayName].sales += tx.amount || 0;
        } else if (tx.type === "CREDIT") {
          weekData[dayName].credit += tx.amount || 0;
        }
      }
    }
  });

  return days.map((day) => weekData[day]);
};
