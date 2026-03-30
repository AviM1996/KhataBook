const mongoose = require("mongoose");
const partyModel = require("../models/party.schema");
const transectionModel = require("../models/Transaction");
const {createPartySchema,updatePartySchema} = require("../libs/validator/party.validator");
const genericPagination = require("../utils/pagination");
const { sendTransectionCreated } = require("../libs/kafka/service/api-service/kafka.producer");


const createParty = async (req, res) => {
  try {
    const { error, value } = createPartySchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.validationError({
        message: error.details.map((e) => e.message),
      });
    }
    const { name, phone, address, recordType, notes } = value;

    const formattedRecordType = recordType.toUpperCase();
    const phoneStr = String(phone).trim();

    const existing = await partyModel.findOne({
      phone,
      recordType,
      isActive: true,
    });

    if (existing) {
      return res.accepted({
        message: `${req.body.recordType} with this phone already exists`,
      });
    }

    const partyPayload = {
      name: name.trim(),
      phone: phoneStr,
      address,
      recordType: formattedRecordType,
      notes,
      createdBy: req.user?.id || null,
    };
    await sendTransectionCreated(partyPayload)
    // await partyModel.create(partyPayload);
    return res.success({
      message: `${req.body.recordType} created successfully`,
    });
  } catch (error) {
    console.error('Party creation error:', error);
    return res.serverError({ message: error.message || 'An error occurred' });
  }
};

const updateParty = async (req, res) => {
  try {
    const { id } = req.params;

    const { error, value } = updatePartySchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.validationError({
        message: error.details.map((e) => e.message),
      });
    }

    if (value.recordType) {
      value.recordType = value.recordType.toUpperCase();
    }
    if (value.name) value.name = value.name.trim();
    if (value.phone) value.phone = String(value.phone).trim();

    const { name, phone, address, recordType, notes } = value;

    const existingParty = await partyModel.findById(id);

    if (!existingParty) {
      return res.accepted({ message: `${req.body.recordType} Not Found` });
    }

    let formattedRecordType = existingParty.recordType;

    if (recordType) {
      formattedRecordType = recordType.toUpperCase();
    }

    if (value.phone) {
      const exists = await partyModel.findOne({
        phone: value.phone,
        recordType: value.recordType || "CUSTOMER", // fallback
        _id: { $ne: id },
      });

      if (exists) {
        return res.validationError({
          message: `${value.recordType || "Party"} already exists`,
        });
      }
    }

    const updated = await partyModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...value,
          updatedBy: req.user?.id || null,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updated) {
      return res.serverError({ message: "Something Went Wrong" });
    }

    return res.success({
      message: `${value.recordType || "Party"} Update Successfully`,
    });
  } catch (error) {
    return res.serverError({ message: error.message });
  }
};
const getRiskBadge = (score) => {
  if (score >= 90) return { label: "EXTREME", color: "#ff0000" };
  if (score >= 40) return { label: "HIGH", color: "#ff6b00" };
  if (score >= 10) return { label: "MEDIUM", color: "#f1c40f" };
  return { label: "LOW", color: "#2ecc71" };
};

const calcuateRisklevel = async (req, res) => {
  try {
    const { partyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(partyId)) {
      return res.status(400).json({ message: "Invalid partyId" });
    }

    const objectId = new mongoose.Types.ObjectId(partyId);

    const result = await transectionModel.aggregate([
      {
        $match: {
          partyId: objectId,
          type: { $in: ["SALE", "PAYMENT"] },
        },
      },

      // 🔥 sort by date
      {
        $sort: { date: 1 },
      },

      // 🔥 window function (previous date)
      {
        $setWindowFields: {
          partitionBy: "$partyId",
          sortBy: { date: 1 },
          output: {
            prevDate: {
              $shift: {
                output: "$date",
                by: -1,
              },
            },
          },
        },
      },

      // 🔥 gap calculation
      {
        $addFields: {
          gapDays: {
            $cond: [
              {
                $and: [
                  { $eq: ["$type", "PAYMENT"] },
                  { $ne: ["$prevDate", null] },
                ],
              },
              {
                $divide: [
                  { $subtract: ["$date", "$prevDate"] },
                  1000 * 60 * 60 * 24,
                ],
              },
              0,
            ],
          },
        },
      },

      // 🔥 lookup broken promises
      {
        $lookup: {
          from: "promises", // collection name
          let: { partyId: "$partyId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$partyId", "$$partyId"] },
                    { $eq: ["$status", "BROKEN"] },
                  ],
                },
              },
            },
            {
              $count: "brokenCount",
            },
          ],
          as: "brokenData",
        },
      },

      // 🔥 group everything
      {
        $group: {
          _id: null,

          totalTaken: {
            $sum: {
              $cond: [{ $eq: ["$type", "SALE"] }, "$amount", 0],
            },
          },

          totalPaid: {
            $sum: {
              $cond: [{ $eq: ["$type", "PAYMENT"] }, "$amount", 0],
            },
          },

          oldestSaleDate: {
            $min: {
              $cond: [{ $eq: ["$type", "SALE"] }, "$date", null],
            },
          },

          totalGap: { $sum: "$gapDays" },

          paymentCount: {
            $sum: {
              $cond: [{ $eq: ["$type", "PAYMENT"] }, 1, 0],
            },
          },

          brokenPromises: {
            $sum: {
              $ifNull: [
                { $arrayElemAt: ["$brokenData.brokenCount", 0] },
                0,
              ],
            },
          },
        },
      },

      // 🔥 derived values
      {
        $addFields: {
          totalOutstanding: {
            $subtract: ["$totalTaken", "$totalPaid"],
          },

          paymentRatio: {
            $cond: [
              { $gt: ["$totalTaken", 0] },
              { $divide: ["$totalPaid", "$totalTaken"] },
              1,
            ],
          },

          oldestDueDays: {
            $cond: [
              { $ifNull: ["$oldestSaleDate", false] },
              {
                $ceil: {
                  $divide: [
                    { $subtract: [new Date(), "$oldestSaleDate"] },
                    1000 * 60 * 60 * 24,
                  ],
                },
              },
              0,
            ],
          },

          avgGap: {
            $cond: [
              { $gt: ["$paymentCount", 1] },
              {
                $divide: [
                  "$totalGap",
                  { $subtract: ["$paymentCount", 1] },
                ],
              },
              0,
            ],
          },
        },
      },

      // 🔥 risk score
      {
        $addFields: {
          score: {
            $round: [
              {
                $add: [
                  { $multiply: ["$oldestDueDays", 0.5] },
                  {
                    $multiply: [
                      { $subtract: [1, "$paymentRatio"] },
                      50,
                    ],
                  },
                  { $multiply: ["$avgGap", 0.3] },
                  { $multiply: ["$brokenPromises", 15] },
                ],
              },
              0,
            ],
          },
        },
      },

      // 🔥 risk level
      {
        $addFields: {
          riskLevel: {
            $switch: {
              branches: [
                { case: { $gte: ["$score", 90] }, then: "EXTREME" },
                { case: { $gte: ["$score", 40] }, then: "HIGH" },
                { case: { $gte: ["$score", 10] }, then: "MEDIUM" },
              ],
              default: "LOW",
            },
          },
        },
      },

      {
        $project: { _id: 0 },
      },
    ]);

    return res.json(result[0] || {});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const viewAllParty = async (req, res) => {
  try {
    const { search = "", recordType, page, limit } = req.query;
    const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
    const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 10;

    let matchStage = {
      isActive: true,
    };

    if (recordType) {
      matchStage.recordType = recordType.toUpperCase();
    }

    if (search && search.trim() !== "") {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
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
          as: "transactions",
        },
      },
      {
        $addFields: {
          totalSales: {
            $sum: {
              $map: {
                input: "$transactions",
                as: "t",
                in: {
                  $cond: [{ $eq: ["$$t.type", "SALE"] }, "$$t.amount", 0],
                },
              },
            },
          },
          totalPurchase: {
            $sum: {
              $map: {
                input: "$transactions",
                as: "t",
                in: {
                  $cond: [{ $eq: ["$$t.type", "PURCHASE"] }, "$$t.amount", 0],
                },
              },
            },
          },
          totalPayment: {
            $sum: {
              $map: {
                input: "$transactions",
                as: "t",
                in: {
                  $cond: [{ $eq: ["$$t.type", "PAYMENT"] }, "$$t.amount", 0],
                },
              },
            },
          },
        },
      },

      {
        $addFields: {
          outstanding: {
            $cond: [
              { $eq: ["$recordType", "CUSTOMER"] },
              { $subtract: ["$totalSales", "$totalPayment"] },
              { $subtract: ["$totalPurchase", "$totalPayment"] },
            ],
          },
        },
      },
      {
        $addFields: {
          lastTxn: {
            $arrayElemAt: [
              {
                $sortArray: {
                  input: "$transactions",
                  sortBy: { date: -1, createdAt: -1 },
                },
              },
              0,
            ],
          },
        },
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
          lastTxnDate: "$lastTxn.date",
        },
      },

      { $sort: { createdAt: -1 } },

      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
    ]);

    const response = genericPagination({
      page: pageNum,
      limit: limitNum,
      total,
      data,
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
        message: "recordType is required (CUSTOMER / SUPPLIER)",
      });
    }

    const type = recordType.toUpperCase();

    const result = await partyModel.aggregate([
      {
        $match: {
          recordType: type,
          isActive: true,
        },
      },

      {
        $lookup: {
          from: "transactions",
          localField: "_id",
          foreignField: "partyId",
          as: "transactions",
        },
      },

      {
        $unwind: {
          path: "$transactions",
          preserveNullAndEmptyArrays: true,
        },
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
                0,
              ],
            },
          },

          totalPurchase: {
            $sum: {
              $cond: [
                { $eq: ["$transactions.type", "PURCHASE"] },
                "$transactions.amount",
                0,
              ],
            },
          },

          totalPayment: {
            $sum: {
              $cond: [
                { $eq: ["$transactions.type", "PAYMENT"] },
                "$transactions.amount",
                0,
              ],
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          totalCount: { $size: "$parties" },
          totalSales: 1,
          totalPurchase: 1,
          totalPayment: 1,
        },
      },
    ]);

    const raw = result[0] || {
      totalCount: 0,
      totalSales: 0,
      totalPurchase: 0,
      totalPayment: 0,
    };

    const mapper = {
      CUSTOMER: (r) => ({
        totalCustomers: r.totalCount,
        totalGoodsSales: r.totalSales,
        totalPaymentReceived: r.totalPayment,
        totalOutstanding: r.totalSales - r.totalPayment,
      }),
      SUPPLIER: (r) => ({
        totalSuppliers: r.totalCount,
        totalGoodsPurchase: r.totalPurchase,
        totalPaymentPaid: r.totalPayment,
        totalOutstanding: r.totalPurchase - r.totalPayment,
      }),
    };

    const data = mapper[type]?.(raw);

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Invalid recordType",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
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
        message: "Valid party id is required",
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
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "transactions",
          localField: "_id",
          foreignField: "partyId",
          as: "transactions",
        },
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
                  $cond: [{ $eq: ["$$t.type", "SALE"] }, "$$t.amount", 0],
                },
              },
            },
          },
          totalPurchase: {
            $sum: {
              $map: {
                input: "$transactions",
                as: "t",
                in: {
                  $cond: [{ $eq: ["$$t.type", "PURCHASE"] }, "$$t.amount", 0],
                },
              },
            },
          },
          totalPayment: {
            $sum: {
              $map: {
                input: "$transactions",
                as: "t",
                in: {
                  $cond: [{ $eq: ["$$t.type", "PAYMENT"] }, "$$t.amount", 0],
                },
              },
            },
          },
        },
      },

      // 🔥 outstanding
      {
        $addFields: {
          outstanding: {
            $cond: [
              { $eq: ["$recordType", "CUSTOMER"] },
              { $subtract: ["$totalSales", "$totalPayment"] },
              { $subtract: ["$totalPurchase", "$totalPayment"] },
            ],
          },
        },
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
                      sortBy: { date: -1, createdAt: -1 },
                    },
                  },
                  0,
                ],
              },
              null,
            ],
          },
        },
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
        },
      },
    ];

    const result = await partyModel.aggregate(pipeline);

    if (!result.length) {
      return res.status(404).json({
        success: false,
        message: "Party not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("viewSingleParty error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createParty,
  viewAllParty,
  viewPartyCard,
  updateParty,
  viewSingleParty,
  calcuateRisklevel,
};
