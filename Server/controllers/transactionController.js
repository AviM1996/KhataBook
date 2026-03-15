const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');

// @desc    Get transactions
// @route   GET /api/transactions
// @access  Public
exports.getTransactions = async (req, res) => {
  try {
    const { customerId, supplierId, recordType } = req.query;
    
    let query = {};
    if (recordType) query.recordType = recordType;
    if (customerId && customerId !== 'ALL') query.customerId = customerId;
    if (supplierId && supplierId !== 'ALL') query.supplierId = supplierId;

    const transactions = await Transaction.find(query)
      .sort('-createdAt')
      .populate('customerId', 'name phone')
      .populate('supplierId', 'name phone');

    // Map _id -> id and description -> note
    const formatted = transactions.map(tx => {
      const formattedTx = tx.toObject();
      formattedTx.id = formattedTx._id;
      formattedTx.note = formattedTx.description;
      delete formattedTx._id;
      return formattedTx;
    });

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Public
exports.createTransaction = async (req, res) => {
  try {
    const { customerId, supplierId, recordType, type, amount, description, paymentMethod, date } = req.body;

    if (!recordType || (!customerId && !supplierId) || !type || amount === undefined) {
      return res.status(400).json({ message: 'Record type, Customer/Supplier ID, transaction type, and amount are required' });
    }

    const transaction = await Transaction.create({
      customerId: customerId || undefined,
      supplierId: supplierId || undefined,
      recordType,
      type,
      amount: Number(amount),
      description: req.body.note || description,
      paymentMethod,
      date: date || Date.now(),
      createdBy: req.user ? req.user.id : null,
      updatedBy: req.user ? req.user.id : null
    });

    // We can also potentially update the customer's balance here if we want 
    // to maintain a real-time 'cached' balance on the Customer model, but 
    // typically we calculate it dynamically or update it here.
    
    const formatted = transaction.toObject();
    formatted.id = formatted._id;
    delete formatted._id;

    res.status(201).json(formatted);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Public
exports.updateTransaction = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Map frontend 'note' to backend 'description'
    if (updateData.note !== undefined) {
      updateData.description = updateData.note;
      delete updateData.note;
    }

    if (req.user && req.user.id) {
       updateData.updatedBy = req.user.id;
    }

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const formatted = transaction.toObject();
    formatted.id = formatted._id;
    delete formatted._id;

    res.status(200).json(formatted);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Public
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
