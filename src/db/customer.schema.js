export const customerSchema = {
  title: 'customer schema',
  version: 0,
  description: 'Customer details',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    name: {
      type: 'string',
    },
     address: {
      type: 'string',
    },
    phone: {
      type: 'string',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
  },
  required: ['id', 'name'],
};
