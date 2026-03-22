const mongoose = require('mongoose');
const partyModel = require('../models/party.schema');
const genericPagination = require('../utils/pagination');


const createParty = async (req, res) => {
    try {
        const {
            name,
            phone,
            address,
            recordType,
            notes
        } = req.body;

        if (!name || !phone || !recordType) {
            throw new Error("Name, phone and recordType are required");
        }

        const formattedRecordType = recordType.toUpperCase();

        if (!["CUSTOMER", "SUPPLIER"].includes(formattedRecordType)) {
            throw new Error("Invalid recordType");
        }

        const existing = await partyModel.findOne({ phone })
        if (existing) {
            throw new Error("Party with this phone already exists");
        }

        const phoneStr = String(phone).trim();

        const partyPayload = {
            name: name.trim(),
            phone: phoneStr,
            address,
            recordType: formattedRecordType,
            notes,
            createdBy: req.user?.id || null,
            updatedBy: req.user?.id || null
        };

        const party = await partyModel.create(partyPayload);

        return res.status(201).json({ success: true, data: party });

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const viewAllParty = async (req, res) => {
    try {
        const { search = '', recordType, page, limit } = req.query;
        const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
        const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 10;

        let matchStage = {
            isActive: true
        };

        if (recordType) {
            matchStage.recordType = recordType.toUpperCase();
        }

        if (search && search.trim() !== '') {
            matchStage.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await partyModel.countDocuments(matchStage);

        const data = await partyModel.aggregate([
            { $match: matchStage },

            {
                $lookup: {
                    from: "transactions",
                    localField: "_id",
                    foreignField: "partyId",
                    as: "transactions"
                }
            },
            {
                $addFields: {
                    totalSales: {
                        $sum: {
                            $map: {
                                input: "$transactions",
                                as: "t",
                                in: {
                                    $cond: [
                                        { $eq: ["$$t.type", "SALE"] },
                                        "$$t.amount",
                                        0
                                    ]
                                }
                            }
                        }
                    },
                    totalPurchase: {
                        $sum: {
                            $map: {
                                input: "$transactions",
                                as: "t",
                                in: {
                                    $cond: [
                                        { $eq: ["$$t.type", "PURCHASE"] },
                                        "$$t.amount",
                                        0
                                    ]
                                }
                            }
                        }
                    },
                    totalPayment: {
                        $sum: {
                            $map: {
                                input: "$transactions",
                                as: "t",
                                in: {
                                    $cond: [
                                        { $eq: ["$$t.type", "PAYMENT"] },
                                        "$$t.amount",
                                        0
                                    ]
                                }
                            }
                        }
                    }
                }
            },

            {
                $addFields: {
                    outstanding: {
                        $cond: [
                            { $eq: ["$recordType", "CUSTOMER"] },
                            { $subtract: ["$totalSales", "$totalPayment"] },
                            { $subtract: ["$totalPurchase", "$totalPayment"] }
                        ]
                    }
                }
            },
            {
                $addFields: {
                    lastTxn: {
                        $arrayElemAt: [
                            {
                                $sortArray: {
                                    input: "$transactions",
                                    sortBy: { date: -1, createdAt: -1 }
                                }
                            },
                            0
                        ]
                    }
                }
            },

            {
                $project: {
                    name: 1,
                    phone: 1,
                    address: 1,
                    recordType: 1,

                    totalSales: 1,
                    totalPurchase: 1,
                    totalPayment: 1,
                    outstanding: 1,

                    lastTxnType: "$lastTxn.type",
                    lastTxnAmount: "$lastTxn.amount",
                    lastTxnDate: "$lastTxn.date"
                }
            },

            { $sort: { createdAt: -1 } },

            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum }
        ]);

        const response = genericPagination({
            page: pageNum,
            limit: limitNum,
            total,
            data
        });

        return res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const viewPartyCard = async (req, res) => {
    try {
        const { recordType } = req.query;

        if (!recordType) {
            return res.status(400).json({
                success: false,
                message: "recordType is required (CUSTOMER / SUPPLIER)"
            });
        }

        const type = recordType.toUpperCase();

        const result = await partyModel.aggregate([
            {
                $match: {
                    recordType: type,
                    isActive: true
                }
            },

            {
                $lookup: {
                    from: "transactions",
                    localField: "_id",
                    foreignField: "partyId",
                    as: "transactions"
                }
            },

            {
                $unwind: {
                    path: "$transactions",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $group: {
                    _id: null,
                    parties: { $addToSet: "$_id" },

                    totalSales: {
                        $sum: {
                            $cond: [
                                { $eq: ["$transactions.type", "SALE"] },
                                "$transactions.amount",
                                0
                            ]
                        }
                    },

                    totalPurchase: {
                        $sum: {
                            $cond: [
                                { $eq: ["$transactions.type", "PURCHASE"] },
                                "$transactions.amount",
                                0
                            ]
                        }
                    },

                    totalPayment: {
                        $sum: {
                            $cond: [
                                { $eq: ["$transactions.type", "PAYMENT"] },
                                "$transactions.amount",
                                0
                            ]
                        }
                    }
                }
            },

            {
                $project: {
                    _id: 0,
                    totalCount: { $size: "$parties" },
                    totalSales: 1,
                    totalPurchase: 1,
                    totalPayment: 1
                }
            }
        ]);

        const raw = result[0] || {
            totalCount: 0,
            totalSales: 0,
            totalPurchase: 0,
            totalPayment: 0
        };

        const mapper = {
            CUSTOMER: (r) => ({
                totalCustomers: r.totalCount,
                totalGoodsSales: r.totalSales,
                totalPaymentReceived: r.totalPayment,
                totalOutstanding: r.totalSales - r.totalPayment
            }),
            SUPPLIER: (r) => ({
                totalSuppliers: r.totalCount,
                totalGoodsPurchase: r.totalPurchase,
                totalPaymentPaid: r.totalPayment,
                totalOutstanding: r.totalPurchase - r.totalPayment
            })
        };

        const data = mapper[type]?.(raw);

        if (!data) {
            return res.status(400).json({
                success: false,
                message: "Invalid recordType"
            });
        }

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updateParty = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, address, recordType, notes } = req.body;

        const existingParty = await partyModel.findById(id);
        if (!existingParty) {
            return res.status(404).json({
                success: false,
                message: "Party not found"
            });
        }

        let formattedRecordType = existingParty.recordType;
        if (recordType) {
            formattedRecordType = recordType.toUpperCase();

            if (!["CUSTOMER", "SUPPLIER"].includes(formattedRecordType)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid recordType"
                });
            }
        }

        if (phone && phone !== existingParty.phone) {
            const phoneStr = String(phone).trim();

            const duplicate = await partyModel.findOne({ phone: phoneStr });
            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: "Phone already exists"
                });
            }

            existingParty.phone = phoneStr;
        }

        if (name) existingParty.name = name.trim();
        if (address !== undefined) existingParty.address = address?.trim() || "";
        if (notes !== undefined) existingParty.notes = notes?.trim() || "";
        if (recordType) existingParty.recordType = formattedRecordType;

        existingParty.updatedBy = req.user?.id || null;

        const updated = await existingParty.save();

        return res.status(200).json({
            success: true,
            data: updated
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const viewSingleParty = async (req, res) => {
    try {
        const { id } = req.params;
        // const { recordType } = req.query;

        // ✅ validate id
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid party id is required"
            });
        }

        // ✅ validate recordType
        // if (!recordType) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "recordType is required (CUSTOMER / SUPPLIER)"
        //     });
        // }

        // const type = recordType.toUpperCase();

        // if (!["CUSTOMER", "SUPPLIER"].includes(type)) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Invalid recordType"
        //     });
        // }

        const pipeline = [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                    // recordType: type,
                    isActive: true
                }
            },
            {
                $lookup: {
                    from: "transactions",
                    localField: "_id",
                    foreignField: "partyId",
                    as: "transactions"
                }
            },

            // 🔥 totals
            {
                $addFields: {
                    totalSales: {
                        $sum: {
                            $map: {
                                input: "$transactions",
                                as: "t",
                                in: {
                                    $cond: [
                                        { $eq: ["$$t.type", "SALE"] },
                                        "$$t.amount",
                                        0
                                    ]
                                }
                            }
                        }
                    },
                    totalPurchase: {
                        $sum: {
                            $map: {
                                input: "$transactions",
                                as: "t",
                                in: {
                                    $cond: [
                                        { $eq: ["$$t.type", "PURCHASE"] },
                                        "$$t.amount",
                                        0
                                    ]
                                }
                            }
                        }
                    },
                    totalPayment: {
                        $sum: {
                            $map: {
                                input: "$transactions",
                                as: "t",
                                in: {
                                    $cond: [
                                        { $eq: ["$$t.type", "PAYMENT"] },
                                        "$$t.amount",
                                        0
                                    ]
                                }
                            }
                        }
                    }
                }
            },

            // 🔥 outstanding
            {
                $addFields: {
                    outstanding: {
                        $cond: [
                            { $eq: ["$recordType", "CUSTOMER"] },
                            { $subtract: ["$totalSales", "$totalPayment"] },
                            { $subtract: ["$totalPurchase", "$totalPayment"] }
                        ]
                    }
                }
            },

            // 🔥 last transaction (SAFE VERSION)
            {
                $addFields: {
                    lastTxn: {
                        $cond: [
                            { $gt: [{ $size: "$transactions" }, 0] },
                            {
                                $arrayElemAt: [
                                    {
                                        $sortArray: {
                                            input: "$transactions",
                                            sortBy: { date: -1, createdAt: -1 }
                                        }
                                    },
                                    0
                                ]
                            },
                            null
                        ]
                    }
                }
            },

            // 🔥 clean response
            {
                $project: {
                    name: 1,
                    phone: 1,
                    address: 1,
                    notes: 1,
                    recordType: 1,
                    createdAt: 1,

                    totalSales: 1,
                    totalPurchase: 1,
                    totalPayment: 1,
                    outstanding: 1,

                    lastTxnType: "$lastTxn.type",
                    lastTxnAmount: "$lastTxn.amount",
                    lastTxnDate: "$lastTxn.date",

                    // ❗ optional (heavy data)
                    // transactions: 1
                }
            }
        ];

        const result = await partyModel.aggregate(pipeline);

        if (!result.length) {
            return res.status(404).json({
                success: false,
                message: "Party not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: result[0]
        });

    } catch (error) {
        console.error("viewSingleParty error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    createParty,
    viewAllParty,
    viewPartyCard,
    updateParty,
    viewSingleParty
}