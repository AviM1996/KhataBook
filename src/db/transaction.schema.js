export const transactionSchema = {
  title: 'transaction schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    customerId: {
      type: 'string',
    },
    amount: {
      type: 'number',
    },
    type: {
      type: 'string', // CREDIT | DEBIT
    },
    date: {
      type: 'string',
      format: 'date-time',
    },
    synced: {
      type: 'boolean',
      default: false,
    },
  },
  required: ['id', 'customerId', 'amount', 'type'],
};
