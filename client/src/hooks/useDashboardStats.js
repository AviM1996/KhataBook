import { useState, useMemo } from 'react';

/**
 * useDashboardStats – provides all mock data for the LedgerFlow dashboard.
 * Every dataset responds to the selected time filter EXCEPT aging data.
 */
export function useDashboardStats() {
  const [timeFilter, setTimeFilter] = useState('today');

  const data = useMemo(() => {
    // ─── Summary card values by time filter ───
    const summaryByFilter = {
      today: {
        sales: 12450,
        salesGrowth: 8,
        credit: 3200,
        creditGrowth: -5,
        outstanding: 48750,
      },
      weekly: {
        sales: 87500,
        salesGrowth: 12,
        credit: 22400,
        creditGrowth: 3,
        outstanding: 48750,
      },
      monthly: {
        sales: 342000,
        salesGrowth: 15,
        credit: 89000,
        creditGrowth: -2,
        outstanding: 48750,
      },
      yearly: {
        sales: 4125000,
        salesGrowth: 22,
        credit: 1050000,
        creditGrowth: 10,
        outstanding: 48750,
      },
    };

    const s = summaryByFilter[timeFilter] || summaryByFilter.today;

    // ─── Summary cards ───
    const summaryCards = [
      { label: 'Total Customers', value: 124, color: '', icon: 'people' },
      { label: 'Total Suppliers', value: 38, color: '', icon: 'store' },
      { label: '90+ Days Due', value: 7, color: 'red', icon: 'warning' },
      {
        label: 'Sales',
        value: `₹${s.sales.toLocaleString('en-IN')}`,
        color: 'green',
        growth: s.salesGrowth,
        growthLabel: 'vs last period',
        icon: 'trending_up',
      },
      {
        label: 'Payments Received',
        value: `₹${s.credit.toLocaleString('en-IN')}`,
        color: 'green',
        growth: s.creditGrowth,
        growthLabel: 'vs last period',
        icon: 'account_balance_wallet',
      },
      {
        label: 'Outstanding',
        value: `₹${s.outstanding.toLocaleString('en-IN')}`,
        color: 'red',
        icon: 'pending',
      },
    ];

    // ─── Sales vs Payment line chart data ───
    const salesPaymentByFilter = {
      today: [
        { label: '6 AM', sales: 0, payment: 0 },
        { label: '8 AM', sales: 1200, payment: 500 },
        { label: '10 AM', sales: 3400, payment: 1200 },
        { label: '12 PM', sales: 5800, payment: 2100 },
        { label: '2 PM', sales: 8200, payment: 2800 },
        { label: '4 PM', sales: 10500, payment: 3000 },
        { label: '6 PM', sales: 12450, payment: 3200 },
      ],
      weekly: [
        { label: 'Mon', sales: 14200, payment: 3800 },
        { label: 'Tue', sales: 11800, payment: 4200 },
        { label: 'Wed', sales: 13500, payment: 2900 },
        { label: 'Thu', sales: 10200, payment: 3500 },
        { label: 'Fri', sales: 15800, payment: 4100 },
        { label: 'Sat', sales: 12500, payment: 2200 },
        { label: 'Sun', sales: 9500, payment: 1700 },
      ],
      monthly: [
        { label: 'Week 1', sales: 87500, payment: 22400 },
        { label: 'Week 2', sales: 92000, payment: 28000 },
        { label: 'Week 3', sales: 78500, payment: 19600 },
        { label: 'Week 4', sales: 84000, payment: 19000 },
      ],
      yearly: [
        { label: 'Jan', sales: 320000, payment: 85000 },
        { label: 'Feb', sales: 285000, payment: 78000 },
        { label: 'Mar', sales: 342000, payment: 89000 },
        { label: 'Apr', sales: 310000, payment: 92000 },
        { label: 'May', sales: 365000, payment: 95000 },
        { label: 'Jun', sales: 340000, payment: 88000 },
        { label: 'Jul', sales: 358000, payment: 91000 },
        { label: 'Aug', sales: 375000, payment: 97000 },
        { label: 'Sep', sales: 330000, payment: 82000 },
        { label: 'Oct', sales: 345000, payment: 90000 },
        { label: 'Nov', sales: 380000, payment: 98000 },
        { label: 'Dec', sales: 375000, payment: 165000 },
      ],
    };

    // ─── Customer retention donut data ───
    const retentionByFilter = {
      today: { returning: 65, new: 35 },
      weekly: { returning: 70, new: 30 },
      monthly: { returning: 72, new: 28 },
      yearly: { returning: 78, new: 22 },
    };

    const ret = retentionByFilter[timeFilter] || retentionByFilter.today;
    const customerRetention = [
      { name: 'Returning Customers', value: ret.returning },
      { name: 'New Customers', value: ret.new },
    ];

    // ─── Accounts aging (NOT affected by time filter) ───
    const receivableAging = [
      { bucket: '0–30 Days', amount: 18500 },
      { bucket: '31–60 Days', amount: 12000 },
      { bucket: '61–90 Days', amount: 8200 },
      { bucket: '90+ Days', amount: 10050 },
    ];

    const payableAging = [
      { bucket: '0–30 Days', amount: 9200 },
      { bucket: '31–60 Days', amount: 6500 },
      { bucket: '61–90 Days', amount: 3800 },
      { bucket: '90+ Days', amount: 2100 },
    ];

    // ─── Recent transactions (vary by filter) ───
    const transactionsByFilter = {
      today: [
        { party: 'Avishek Maity', type: 'Sale', amount: 5003, date: '15 Mar 2026' },
        { party: 'Avishek Maity', type: 'Payment', amount: 2000, date: '15 Mar 2026' },
        { party: 'Sharma Electronics', type: 'Sale', amount: 3200, date: '15 Mar 2026' },
        { party: 'ABC Traders', type: 'Purchase', amount: 8500, date: '15 Mar 2026' },
        { party: 'Gupta & Sons', type: 'Payment', amount: 1500, date: '15 Mar 2026' },
      ],
      weekly: [
        { party: 'Avishek Maity', type: 'Sale', amount: 5003, date: '15 Mar 2026' },
        { party: 'Sharma Electronics', type: 'Sale', amount: 3200, date: '14 Mar 2026' },
        { party: 'ABC Traders', type: 'Purchase', amount: 8500, date: '14 Mar 2026' },
        { party: 'Gupta & Sons', type: 'Payment', amount: 12000, date: '13 Mar 2026' },
        { party: 'Patel Distributors', type: 'Sale', amount: 15400, date: '12 Mar 2026' },
        { party: 'Metro Wholesale', type: 'Purchase', amount: 22000, date: '11 Mar 2026' },
        { party: 'Avishek Maity', type: 'Payment', amount: 2000, date: '10 Mar 2026' },
        { party: 'Kumar Store', type: 'Sale', amount: 4800, date: '09 Mar 2026' },
      ],
      monthly: [
        { party: 'Avishek Maity', type: 'Sale', amount: 5003, date: '15 Mar 2026' },
        { party: 'Sharma Electronics', type: 'Sale', amount: 18500, date: '12 Mar 2026' },
        { party: 'ABC Traders', type: 'Purchase', amount: 45000, date: '08 Mar 2026' },
        { party: 'Gupta & Sons', type: 'Payment', amount: 32000, date: '05 Mar 2026' },
        { party: 'Patel Distributors', type: 'Sale', amount: 28400, date: '01 Mar 2026' },
        { party: 'Metro Wholesale', type: 'Purchase', amount: 52000, date: '25 Feb 2026' },
        { party: 'Kumar Store', type: 'Sale', amount: 14800, date: '20 Feb 2026' },
        { party: 'Singh Traders', type: 'Payment', amount: 8500, date: '18 Feb 2026' },
        { party: 'Reddy Supplies', type: 'Sale', amount: 11200, date: '15 Feb 2026' },
        { party: 'Jain Brothers', type: 'Purchase', amount: 19500, date: '12 Feb 2026' },
      ],
      yearly: [
        { party: 'Avishek Maity', type: 'Sale', amount: 5003, date: '15 Mar 2026' },
        { party: 'Sharma Electronics', type: 'Sale', amount: 18500, date: '12 Mar 2026' },
        { party: 'ABC Traders', type: 'Purchase', amount: 125000, date: '01 Feb 2026' },
        { party: 'Gupta & Sons', type: 'Payment', amount: 98000, date: '15 Jan 2026' },
        { party: 'Patel Distributors', type: 'Sale', amount: 215000, date: '20 Dec 2025' },
        { party: 'Metro Wholesale', type: 'Purchase', amount: 180000, date: '10 Nov 2025' },
        { party: 'Kumar Store', type: 'Sale', amount: 85000, date: '05 Oct 2025' },
        { party: 'Singh Traders', type: 'Payment', amount: 42000, date: '20 Sep 2025' },
        { party: 'Reddy Supplies', type: 'Sale', amount: 67000, date: '15 Aug 2025' },
        { party: 'Jain Brothers', type: 'Purchase', amount: 95000, date: '01 Jul 2025' },
      ],
    };

    return {
      summaryCards,
      salesPayment: salesPaymentByFilter[timeFilter] || salesPaymentByFilter.today,
      customerRetention,
      receivableAging,
      payableAging,
      recentTransactions: transactionsByFilter[timeFilter] || transactionsByFilter.today,
    };
  }, [timeFilter]);

  return { timeFilter, setTimeFilter, ...data };
}
