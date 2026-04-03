export const formatCurrency = (val) =>
  `₹${Math.abs(val || 0).toLocaleString('en-IN')}`;

export const TRANSACTION_FIELDS = [
  { name: 'amount', label: 'Amount', type: 'number', required: true },
  {
    name: 'paymentMethod', label: 'Payment Method', type: 'select',
    options: [
      { value: 'CASH', label: 'Cash' },
      { value: 'UPI', label: 'UPI' },
      { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
      { value: 'CHEQUE', label: 'Cheque' },
      { value: 'N/A', label: 'N/A' },
    ],
  },
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'note', label: 'Note', type: 'textarea' },
];

const PARTY_FIELDS = [
  { name: 'name',    label: 'Name',         type: 'text',     required: true },
  { name: 'phone',   label: 'Phone Number',  type: 'text',     required: true },
  { name: 'address', label: 'Address',       type: 'text'                     },
  { name: 'notes',   label: 'Notes',         type: 'textarea'                 },
];

export const ENTITY_CONFIG = {
  CUSTOMER: {
    label:       'Customer',
    pluralLabel: 'Customers',
    tabId:       'customer',   // matches useMastersStore.activeTab
    apiKey:      'CUSTOMER',

    fields: PARTY_FIELDS,

    summary: {
      total:       'Total Customers',
      sales:       'Total Goods Sales',
      payment:     'Total Payment Received',
      outstanding: 'Total Outstanding',
    },

    summaryMapper: (data) => ({
      totalCount:           data.totalCustomers        || 0,
      totalSalesOrPurchase: data.totalGoodsSales        || 0,
      totalPayment:         data.totalPaymentReceived   || 0,
      totalOutstanding:     data.totalOutstanding       || 0,
    }),
  },

  SUPPLIER: {
    label:       'Supplier',
    pluralLabel: 'Suppliers',
    tabId:       'supplier',
    apiKey:      'SUPPLIER',

    fields: PARTY_FIELDS,

    summary: {
      total:       'Total Suppliers',
      sales:       'Total Goods Purchase',
      payment:     'Total Payment Made',
      outstanding: 'Total Outstanding',
    },

    summaryMapper: (data) => ({
      totalCount:           data.totalSuppliers     || 0,
      totalSalesOrPurchase: data.totalGoodsPurchase  || 0,
      totalPayment:         data.totalPaymentPaid    || 0,
      totalOutstanding:     data.totalOutstanding    || 0,
    }),
  },
};

/** Helper: get config by tabId ('customer' | 'supplier') */
export const getConfigByTab = (tabId) =>
  Object.values(ENTITY_CONFIG).find((c) => c.tabId === tabId) ?? ENTITY_CONFIG.CUSTOMER;
