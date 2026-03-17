const Supplier = require('../models/Supplier');
const Transaction = require('../models/Transaction');

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: true }).sort('-createdAt');
    
    // Calculate balances for all suppliers
    const supplierIds = suppliers.map(s => s._id);
    const stats = await Transaction.aggregate([
      { $match: { supplierId: { $in: supplierIds } } },
      { 
        $group: { 
          _id: { supplierId: '$supplierId', type: '$type' }, 
          total: { $sum: '$amount' } 
        } 
      }
    ]);

    const formattedSuppliers = suppliers.map(supplier => {
      const formatted = supplier.toObject();
      formatted.id = formatted._id;
      delete formatted._id;

      let totalCredit = 0; // Purchase
      let totalDebit = 0;  // Return, Payment

      stats.forEach(stat => {
        if (stat._id.supplierId.toString() === formatted.id.toString()) {
          if (stat._id.type === 'PURCHASE') totalCredit += stat.total;
          if (stat._id.type === 'RETURN') totalDebit += stat.total;
          if (stat._id.type === 'PAYMENT') totalDebit += stat.total;
          // Also handle legacy or general types if needed
          if (stat._id.type === 'CREDIT') totalCredit += stat.total;
          if (stat._id.type === 'DEBIT') totalDebit += stat.total;
        }
      });

      formatted.totalCredit = totalCredit;
      formatted.totalDebit = totalDebit;
      formatted.outstandingBalance = formatted.openingBalance + (totalCredit - totalDebit);

      return formatted;
    });

    res.status(200).json(formattedSuppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ _id: req.params.id, isActive: true });
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const formatted = supplier.toObject();
    formatted.id = formatted._id;
    delete formatted._id;

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { name, phone, address, openingBalance, balanceDirection, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const supplier = await Supplier.create({
      name,
      phone,
      address,
      openingBalance: Number(openingBalance) || 0,
      balanceDirection,
      notes,
      createdBy: req.user ? req.user.id : null,
      updatedBy: req.user ? req.user.id : null
    });

    const formatted = supplier.toObject();
    formatted.id = formatted._id;
    delete formatted._id;

    res.status(201).json(formatted);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.user && req.user.id) {
       updateData.updatedBy = req.user.id;
    }

    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      updateData,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const formatted = supplier.toObject();
    formatted.id = formatted._id;
    delete formatted._id;

    res.status(200).json(formatted);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.softDeleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSupplierBalance = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ _id: req.params.id, isActive: true });
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const stats = await Transaction.aggregate([
      { $match: { supplierId: supplier._id } },
      { 
        $group: { 
          _id: '$type', 
          total: { $sum: '$amount' } 
        } 
      }
    ]);

    let totalCredit = 0; // Purchase
    let totalDebit = 0; // Return, Payment

    stats.forEach(stat => {
      if (stat._id === 'PURCHASE') totalCredit += stat.total;
      if (stat._id === 'RETURN') totalDebit += stat.total;
      if (stat._id === 'PAYMENT') totalDebit += stat.total;
      if (stat._id === 'CREDIT') totalCredit += stat.total;
      if (stat._id === 'DEBIT') totalDebit += stat.total;
    });

    const calculatedBalance = supplier.openingBalance + (totalCredit - totalDebit);

    res.status(200).json({
      balance: calculatedBalance,
      openingBalance: supplier.openingBalance,
      balanceDirection: supplier.balanceDirection,
      totalCredit,
      totalDebit
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
