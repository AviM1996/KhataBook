
export const getTodayStats = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return { todaySales: 0, todayCredit: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  const tomorrowStart = new Date(today.getTime() + 24 * 60 * 60 * 1000).getTime();

  const todayTxns = transactions.filter((tx) => {
    if (!tx.createdAt) {
      return false;
    }

    let txDate;
    if (typeof tx.createdAt === "object" && tx.createdAt.toDate) {
      // Firestore Timestamp
      txDate = tx.createdAt.toDate();
    } else if (tx.createdAt instanceof Date) {
      txDate = tx.createdAt;
    } else if (typeof tx.createdAt === "number") {
      txDate = new Date(tx.createdAt);
    } else {
      return false;
    }

    const txTime = txDate.getTime();
    return txTime >= todayStart && txTime < tomorrowStart;
  });

  const todaySales = todayTxns
    .filter((tx) => tx.type === "DEBIT")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const todayCredit = todayTxns
    .filter((tx) => tx.type === "CREDIT")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  return { 
    todaySales: todaySales || 0, 
    todayCredit: todayCredit || 0 
  };
};
const getTxDate = (createdAt) => {
  if (!createdAt) return null;

  if (createdAt?.toDate) return createdAt.toDate();
  if (createdAt instanceof Date) return createdAt;
  if (typeof createdAt === "number") return new Date(createdAt);

  return null;
};

export const getOverallStats = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return { totalCredit: 0, totalDebit: 0, outstandingBalance: 0 };
  }

  const totalCredit = transactions
    .filter((tx) => tx.type === "CREDIT")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const totalDebit = transactions
    .filter((tx) => tx.type === "DEBIT")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  // Outstanding Balance = Total Credit - Total Debit
  const outstandingBalance = totalCredit - totalDebit;

  return { 
    totalCredit: totalCredit || 0, 
    totalDebit: totalDebit || 0, 
    outstandingBalance: outstandingBalance || 0 
  };
};
