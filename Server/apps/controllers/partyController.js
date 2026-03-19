const mongoose = require('mongoose');
const partyModel = require('../models/party.schema');
const transactionModel = require('../models/Transaction');


function getOpeningTxnType(recordType, balanceDirection) {
    if (recordType === 'CUSTOMER') {
        return balanceDirection === 'Receivable' ? 'SALE' : 'PAYMENT';
    }

    if (recordType === 'SUPPLIER') {
        return balanceDirection === 'Receivable' ? 'PAYMENT' : 'PURCHASE';
    }
}

const createParty = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {
            name,
            phone,
            address,
            recordType,
            openingBalance = 0,
            balanceDirection,
            reminderDate,
            notes
        } = req.body;

        const txnType = getOpeningTxnType(recordType, balanceDirection);

        let partyPayload = {
            name,
            phone,
            address,
            recordType,
            openingBalance: Number(openingBalance) || 0,
            balanceDirection,
            reminderDate,
            notes,
            createdBy: req.user?.id || null,
            updatedBy: req.user?.id || null
        };

        if (openingBalance > 0) {
            partyPayload.lastTransaction = {
                amount: openingBalance,
                type: txnType,
                date: new Date()
            };

            if (txnType === 'SALE' || txnType === 'PURCHASE') {
                partyPayload.totalSales = openingBalance;
                partyPayload.totalDue = openingBalance;
            }

            if (txnType === 'PAYMENT') {
                partyPayload.totalPaid = openingBalance;
                partyPayload.totalDue = -openingBalance;
            }
        }

        const party = await partyModel.create([partyPayload], { session });

        if (openingBalance > 0) {
            await transactionModel.create(
                [
                    {
                        partyId: party[0]._id,
                        amount: openingBalance,
                        type: txnType,
                        date: new Date(),
                        createdBy: req.user?.id || null
                    }
                ],
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({ success: true, data: party[0] });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        return res.status(500).json({ message: error.message });
    }

}

const viewAllParty = async (req, res) => {
    try {
        const { recordType } = req.query;
        let matchStage = { isActive: true };

        if (recordType) {
            matchStage.recordType = recordType.toUpperCase();
        }

        const data = await partyModel.aggregate([
            // {
            //     $match: matchStage
            // },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        return res.status(200).json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports={
    createParty,
    viewAllParty
}