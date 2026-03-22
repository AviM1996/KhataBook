const mongoose = require('mongoose');

const Transaction = require('../models/Transaction');

exports.getTransactions = async (req, res) => {
  try {
    const { partyId } = req.query;

    if (!partyId) {
      return res.status(400).json({
        message: 'partyId is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(partyId)) {
      return res.status(400).json({
        message: 'Invalid partyId'
      });
    }

    const pipeline = [
      {
        $match: {
          partyId: new mongoose.Types.ObjectId(partyId)
        }
      },

      {
        $sort: { createdAt: -1 }
      },

      {
        $project: {
          id: '$_id',
          partyId: 1,
          amount: 1,
          type: 1,
          note: '$description',
          paymentMethod: 1,
          date: 1,
          createdAt: 1,
          align: {
            $switch: {
              branches: [
                { case: { $in: ['$type', ['SALE', 'PURCHASE']] }, then: 'right' },
                { case: { $eq: ['$type', 'PAYMENT'] }, then: 'left' },
                { case: { $eq: ['$type', 'RETURN'] }, then: 'center' }
              ],
              default: 'left'
            }
          },
          label: {
            $switch: {
              branches: [
                { case: { $eq: ['$type', 'SALE'] }, then: 'Sale' },
                { case: { $eq: ['$type', 'PURCHASE'] }, then: 'Purchase' },
                { case: { $eq: ['$type', 'PAYMENT'] }, then: 'Payment' },
                { case: { $eq: ['$type', 'RETURN'] }, then: 'Return' }
              ],
              default: '$type'
            }
          },
          colorType: {
            $switch: {
              branches: [
                { case: { $in: ['$type', ['SALE', 'PURCHASE']] }, then: 'blue' },
                { case: { $eq: ['$type', 'PAYMENT'] }, then: 'green' },
                { case: { $eq: ['$type', 'RETURN'] }, then: 'red' }
              ],
              default: 'default'
            }
          }
        }
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%d %b %Y', date: '$date' } 
          },
          transactions: { $push: '$$ROOT' }
        }
      },
      {
        $sort: { '_id': -1 } // Sort the date groups
      }
    ];

    const groupedTransactions = await Transaction.aggregate(pipeline);

    res.status(200).json({ data: groupedTransactions });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { partyId, amount, type, description, paymentMethod,date } = req.body;

    if (!partyId || !type || amount === undefined) {
      return res.status(400).json({ message: 'Party ID, transaction type, and amount are required' });
    }

    const transaction = await Transaction.create({
      partyId,
      amount: Number(amount),
      type,
      description: req.body.note || description,
      paymentMethod,
      date: date || Date.now(),
      createdBy: req.user ? req.user.id : null,
      updatedBy: req.user ? req.user.id : null
    });
    
    const formatted = transaction.toObject();
    formatted.id = formatted._id;
    delete formatted._id;

    res.status(201).json(formatted);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
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
