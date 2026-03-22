/**
 * Calculates financial statistics for a specific entity based on their transaction history.
 * Isolates the business logic out of the component lifecycle for strict O(1) testability.
 * 
 * @param {Array} txList - Array of transactions
 * @param {String} activeTab - 'customer' | 'supplier'
 * @param {Object} entity - The entity object to gather opening balances
 * @returns {Object|null} { totalCredit, totalDebit, outstanding, lastTxDate }
 */
export function calculateEntityStats(txList, activeTab, entity) {
  if (!txList || !entity) return null;

  let tc = 0;
  let td = 0;

  for(let i = 0; i < txList.length; i++) {
    const t = txList[i];
    if (activeTab === 'customer') {
      if (t.type === 'SALE') td += t.amount;
      if (t.type === 'RETURN' || t.type === 'PAYMENT') tc += t.amount;
    } else {
      if (t.type === 'PURCHASE') tc += t.amount;
      if (t.type === 'RETURN' || t.type === 'PAYMENT') td += t.amount;
    }
  }

  const ob = entity.openingBalance || 0;
  const bd = entity.balanceDirection;
  
  let outstanding = 0;
  if (activeTab === 'customer') {
    outstanding = bd === 'Receivable' ? ob + (td - tc) : ob + (tc - td);
  } else {
    outstanding = bd === 'Payable' ? ob + (tc - td) : ob + (td - tc);
  }

  const lastTx = txList[txList.length - 1];

  return { 
    totalCredit: tc, 
    totalDebit: td, 
    outstanding, 
    lastTxDate: lastTx?.date || null 
  };
}
