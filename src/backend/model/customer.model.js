export const CustomerModel = {
  name: "",
  phone: "",
  address: "",
  notes: "",
  ownerId: "",
  isDeleted: false,
  createdAt: null,
  deletedAt: null,
  reminderDate: null,
};

export function validateCustomerUpdate(payload) {
  if (payload.name !== undefined && !payload.name.trim()) {
    throw new Error("CUSTOMER_NAME_INVALID");
  }

  if (payload.phone !== undefined && !payload.phone.trim()) {
    throw new Error("CUSTOMER_PHONE_INVALID");
  }

  return true;
}

export function buildCustomer(payload, ownerId) {
  return {
    name: payload.name?.trim() || "",
    phone: payload.phone?.trim() || "",
    ownerId,
    isDeleted: false,

     ...(payload.address && { address: payload.address.trim() }),
    ...(payload.notes && { notes: payload.notes.trim() }),
    ...(payload.reminderDate && { reminderDate: payload.reminderDate }),
  };
}

export function validateCustomer(payload) {
  if (!payload.name || !payload.name.trim()) {
    throw new Error("CUSTOMER_NAME_REQUIRED");
  }

  if (!payload.phone || !payload.phone.trim()) {
    throw new Error("CUSTOMER_PHONE_REQUIRED");
  }

  return true;
}
