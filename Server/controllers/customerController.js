const Customer = require('../models/Customer');

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ isActive: true }).sort('-createdAt');
    const Transaction = require('../models/Transaction');
    
    // Aggregation to sum credits and debits for all active customers
    const customerIds = customers.map(c => c._id);
    const stats = await Transaction.aggregate([
      { $match: { customerId: { $in: customerIds } } },
      { 
        $group: { 
          _id: { customerId: '$customerId', type: '$type' }, 
          total: { $sum: '$amount' } 
        } 
      }
    ]);

    // Map _id to id to match frontend expectations
    const formattedCustomers = customers.map(customer => {
      const formatted = customer.toObject();
      formatted.id = formatted._id;
      delete formatted._id;

      let totalCredit = 0; // Return, Payment (for customers, these decrease what they owe)
      let totalDebit = 0;  // Sale (increases what they owe)

      stats.forEach(stat => {
        if (stat._id.customerId.toString() === formatted.id.toString()) {
          // New universal types
          if (stat._id.type === 'SALE') totalDebit += stat.total;
          if (stat._id.type === 'RETURN') totalCredit += stat.total;
          if (stat._id.type === 'PAYMENT') totalCredit += stat.total;
          
          // Legacy types
          if (stat._id.type === 'CREDIT') totalCredit += stat.total;
          if (stat._id.type === 'DEBIT') totalDebit += stat.total;
        }
      });

      formatted.totalCredit = totalCredit;
      formatted.totalDebit = totalDebit;
      
      // If Receivable: Debit increases balance, Credit decreases.
      // If Payable: Credit increases balance, Debit decreases.
      const outstanding = formatted.balanceDirection === 'Receivable' 
        ? formatted.openingBalance + (totalDebit - totalCredit)
        : formatted.openingBalance + (totalCredit - totalDebit);

      formatted.outstandingBalance = outstanding;

      return formatted;
    });

    res.status(200).json(formattedCustomers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Public
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, isActive: true });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const formatted = customer.toObject();
    formatted.id = formatted._id;
    delete formatted._id;

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Public
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, address, openingBalance, balanceDirection, reminderDate, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const customer = await Customer.create({
      name,
      phone,
      address,
      openingBalance: Number(openingBalance) || 0,
      balanceDirection,
      reminderDate,
      notes,
      createdBy: req.user ? req.user.id : null,
      updatedBy: req.user ? req.user.id : null
    });

    const formatted = customer.toObject();
    formatted.id = formatted._id;
    delete formatted._id;

    res.status(201).json(formatted);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Public
exports.updateCustomer = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.user && req.user.id) {
       updateData.updatedBy = req.user.id;
    }

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      updateData,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const formatted = customer.toObject();
    formatted.id = formatted._id;
    delete formatted._id;

    res.status(200).json(formatted);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Soft delete a customer
// @route   DELETE /api/customers/:id
// @access  Public
exports.softDeleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single customer's balance calculation
// @route   GET /api/customers/:id/balance
// @access  Public
exports.getCustomerBalance = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, isActive: true });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const Transaction = require('../models/Transaction');
    
    // Aggregation to sum credits and debits
    const stats = await Transaction.aggregate([
      { $match: { customerId: customer._id } },
      { 
        $group: { 
          _id: '$type', 
          total: { $sum: '$amount' } 
        } 
      }
    ]);

    let totalCredit = 0;
    let totalDebit = 0;

    stats.forEach(stat => {
      if (stat._id === 'CREDIT') totalCredit = stat.total;
      if (stat._id === 'DEBIT') totalDebit = stat.total;
    });

    const calculatedBalance = customer.openingBalance 
        + (customer.balanceDirection === 'Receivable' ? totalCredit - totalDebit : totalDebit - totalCredit);

    res.status(200).json({
      balance: calculatedBalance,
      openingBalance: customer.openingBalance,
      balanceDirection: customer.balanceDirection,
      totalCredit,
      totalDebit
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
