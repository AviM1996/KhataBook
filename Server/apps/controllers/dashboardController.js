const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Party = require("../models/party.schema");

exports.getDashboardData = async (req, res) => {
  try {
    const [salesPayment, retentionByFilter, agingReport, summaryByFilter, partyCounts] =
      await Promise.all([
        getDashboardSalesPayment(),
        getCustomerRetention(),
        getAgingReport(),
        getSummaryByFilter(),
        getPartyCounts(),
      ]);

    const data = {
      salesPayment,
      retentionByFilter,
      receivableAging: agingReport.receivableAging,
      payableAging: agingReport.payableAging,
      summaryByFilter,
      partyCounts,
    };

    res.json({ data });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: 'Dashboard error' });
  }
};


const getDashboardSalesPayment = async () => {
  const now = new Date();

  // 🔹 Time ranges
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const end = new Date();

  // 🔥 Common pipeline function
  const basePipeline = (start, groupStage) => ([
    {
      $match: {
        date: { $gte: start, $lte: end }
      }
    },
    {
      $lookup: {
        from: 'parties',
        localField: 'partyId',
        foreignField: '_id',
        as: 'party'
      }
    },
    { $unwind: '$party' },
    {
      $match: {
        'party.recordType': 'CUSTOMER'
      }
    },
    {
      $group: {
        _id: groupStage,
        sales: {
          $sum: {
            $cond: [{ $eq: ['$type', 'SALE'] }, '$amount', 0]
          }
        },
        payment: {
          $sum: {
            $cond: [{ $eq: ['$type', 'PAYMENT'] }, '$amount', 0]
          }
        }
      }
    }
  ]);

  // 🔥 Run all aggregations in parallel
  const tz = 'Asia/Kolkata';

  const [todayData, weeklyData, monthlyData, yearlyData] = await Promise.all([

    Transaction.aggregate(basePipeline(startOfDay, { $hour: { date: '$date', timezone: tz } })),

    Transaction.aggregate(basePipeline(startOfWeek, { $dayOfWeek: { date: '$date', timezone: tz } })),

    Transaction.aggregate(basePipeline(startOfMonth, {
      $ceil: { $divide: [{ $dayOfMonth: { date: '$date', timezone: tz } }, 7] }
    })),

    Transaction.aggregate(basePipeline(startOfYear, { $month: { date: '$date', timezone: tz } }))
  ]);

  const format = (labels, data, getKey) =>
    labels.map((label, i) => {
      const key = getKey(i);
      const found = data.find(d => d._id === key);
      return {
        label,
        sales: found?.sales || 0,
        payment: found?.payment || 0
      };
    });

  return {
    today: format(
      ['6 AM','8 AM','10 AM','12 PM','2 PM','4 PM','6 PM'],
      todayData,
      i => i * 2 + 6
    ),

    weekly: format(
      ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
      weeklyData,
      i => i + 1
    ),

    monthly: format(
      ['Week 1','Week 2','Week 3','Week 4','Week 5'],
      monthlyData,
      i => i + 1
    ),

    yearly: format(
      ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      yearlyData,
      i => i + 1
    )
  };
};

const getCustomerRetention = async () => {
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const end = new Date();

  // 🔥 pipeline (only SALE count per customer)
  const pipeline = (start) => ([
    {
      $match: {
        date: { $gte: start, $lte: end },
        type: 'SALE' // 🔥 IMPORTANT
      }
    },
    {
      $lookup: {
        from: 'parties',
        localField: 'partyId',
        foreignField: '_id',
        as: 'party'
      }
    },
    { $unwind: '$party' },
    {
      $match: {
        'party.recordType': 'CUSTOMER'
      }
    },

    // 👉 group by customer
    {
      $group: {
        _id: '$partyId',
        salesCount: { $sum: 1 }
      }
    }
  ]);

  // 🔥 fetch all filters
  const [todayData, weeklyData, monthlyData, yearlyData] =
    await Promise.all([
      Transaction.aggregate(pipeline(startOfDay)),
      Transaction.aggregate(pipeline(startOfWeek)),
      Transaction.aggregate(pipeline(startOfMonth)),
      Transaction.aggregate(pipeline(startOfYear)),
    ]);

  // 🎯 classify function
  const classify = (data) => {
    let returning = 0;
    let newCustomer = 0;

    data.forEach(c => {
      if (c.salesCount > 1) {
        returning++;
      } else {
        newCustomer++;
      }
    });

    const total = newCustomer + returning || 1;

    return {
      returning: Math.round((returning / total) * 100),
      new: Math.round((newCustomer / total) * 100)
    };
  };

  return {
    today: classify(todayData),
    weekly: classify(weeklyData),
    monthly: classify(monthlyData),
    yearly: classify(yearlyData)
  };
};

const getAgingReport = async () => {
  const now = new Date();

  const pipeline = (recordType, mainType) => ([
    {
      $lookup: {
        from: 'parties',
        localField: 'partyId',
        foreignField: '_id',
        as: 'party'
      }
    },
    { $unwind: '$party' },

    // 👉 Filter CUSTOMER / SUPPLIER
    {
      $match: {
        'party.recordType': recordType
      }
    },

    // 👉 Calculate age (in days)
    {
      $addFields: {
        age: {
          $dateDiff: {
            startDate: "$date",
            endDate: now,
            unit: "day"
          }
        }
      }
    },

    // 👉 Assign bucket
    {
      $addFields: {
        bucket: {
          $switch: {
            branches: [
              { case: { $lte: ["$age", 30] }, then: "0–30 Days" },
              { case: { $lte: ["$age", 60] }, then: "31–60 Days" },
              { case: { $lte: ["$age", 90] }, then: "61–90 Days" },
            ],
            default: "90+ Days"
          }
        }
      }
    },

    // 👉 Group by party + bucket
    {
      $group: {
        _id: {
          partyId: "$partyId",
          bucket: "$bucket"
        },

        mainAmount: {
          $sum: {
            $cond: [{ $eq: ['$type', mainType] }, '$amount', 0]
          }
        },

        payment: {
          $sum: {
            $cond: [{ $eq: ['$type', 'PAYMENT'] }, '$amount', 0]
          }
        }
      }
    },

    // 👉 Outstanding = main - payment
    {
      $project: {
        bucket: "$_id.bucket",
        outstanding: {
          $subtract: ["$mainAmount", "$payment"]
        }
      }
    },

    // 👉 Ignore negative / zero
    {
      $match: {
        outstanding: { $gt: 0 }
      }
    },

    // 👉 Final group by bucket
    {
      $group: {
        _id: "$bucket",
        amount: { $sum: "$outstanding" }
      }
    }
  ]);

  // 🔥 Run both in parallel
  const [receivableRaw, payableRaw] = await Promise.all([
    Transaction.aggregate(pipeline('CUSTOMER', 'SALE')),
    Transaction.aggregate(pipeline('SUPPLIER', 'PURCHASE'))
  ]);

  // 🎯 Format to OBJECT (NOT array)
  const formatToObject = (data) => {
    const buckets = ['0–30 Days','31–60 Days','61–90 Days','90+ Days'];

    const result = {};

    buckets.forEach(bucket => {
      const found = data.find(d => d._id === bucket);
      result[bucket] = found?.amount || 0;
    });

    return result;
  };

  return {
    receivableAging: formatToObject(receivableRaw),
    payableAging: formatToObject(payableRaw)
  };
};

const getSummaryByFilter = async () => {
  const now = new Date();

  // 🧠 Helper: get date ranges
  const getRanges = () => {
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const yearStart = new Date(now.getFullYear(), 0, 1);
    const prevYearStart = new Date(now.getFullYear() - 1, 0, 1);

    return {
      today: { start: todayStart, prevStart: yesterdayStart },
      weekly: { start: weekStart, prevStart: prevWeekStart },
      monthly: { start: monthStart, prevStart: prevMonthStart },
      yearly: { start: yearStart, prevStart: prevYearStart }
    };
  };

  const ranges = getRanges();

  // 🔥 Common aggregation
  const getData = async (start, end) => {
    const result = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'parties',
          localField: 'partyId',
          foreignField: '_id',
          as: 'party'
        }
      },
      { $unwind: '$party' },
      {
        $match: {
          'party.recordType': 'CUSTOMER'
        }
      },
      {
        $group: {
          _id: null,
          sales: {
            $sum: {
              $cond: [{ $eq: ['$type', 'SALE'] }, '$amount', 0]
            }
          },
          payment: {
            $sum: {
              $cond: [{ $eq: ['$type', 'PAYMENT'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    const data = result[0] || { sales: 0, payment: 0 };

    return {
      sales: data.sales,
      credit: data.payment,
      outstanding: data.sales - data.payment
    };
  };

  // 🧠 Growth calculator
  const calcGrowth = (current, previous) => {
    if (!previous) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const build = async ({ start, prevStart }, type) => {
    const end = new Date();

    let prevEnd;

    // 🔥 define previous period end
    if (type === 'today') {
      prevEnd = start;
    } else if (type === 'weekly') {
      prevEnd = start;
    } else if (type === 'monthly') {
      prevEnd = start;
    } else {
      prevEnd = start;
    }

    const current = await getData(start, end);
    const previous = await getData(prevStart, prevEnd);

    return {
      sales: current.sales,
      salesGrowth: calcGrowth(current.sales, previous.sales),

      credit: current.credit,
      creditGrowth: calcGrowth(current.credit, previous.credit),

      outstanding: current.outstanding,
      outstandingGrowth: calcGrowth(
        current.outstanding,
        previous.outstanding
      )
    };
  };

  return {
    today: await build(ranges.today, 'today'),
    weekly: await build(ranges.weekly, 'weekly'),
    monthly: await build(ranges.monthly, 'monthly'),
    yearly: await build(ranges.yearly, 'yearly')
  };
};

const calculateFIFOOutstanding = (transactions) => {
  // sort by date ASC (oldest first)
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  const salesQueue = [];

  for (const tx of transactions) {
    if (tx.type === "SALE") {
      salesQueue.push({
        amount: tx.amount,
        date: tx.date,
        remaining: tx.amount,
      });
    }

    if (tx.type === "PAYMENT") {
      let payment = tx.amount;

      // apply payment FIFO
      for (let sale of salesQueue) {
        if (payment <= 0) break;

        if (sale.remaining > 0) {
          const used = Math.min(sale.remaining, payment);
          sale.remaining -= used;
          payment -= used;
        }
      }
    }
  }

  const unpaid = salesQueue.filter(s => s.remaining > 0);

  const totalOutstanding = unpaid.reduce((sum, s) => sum + s.remaining, 0);

  const oldestUnpaidDate = unpaid.length
    ? unpaid[0].date
    : null;

  return {
    totalOutstanding,
    oldestUnpaidDate,
  };
};

const getPartyCountsFIFO = async () => {
  const now = new Date();
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(now.getDate() - 90);

  const parties = await Party.find({ isActive: true });

  let totalCustomers = 0;
  let totalSuppliers = 0;
  let overdue90 = 0;

  for (const party of parties) {
    if (party.recordType === "CUSTOMER") totalCustomers++;
    if (party.recordType === "SUPPLIER") totalSuppliers++;

    if (party.recordType !== "CUSTOMER") continue;

    const transactions = await Transaction.find({
      partyId: party._id,
    }).lean();

    const { totalOutstanding, oldestUnpaidDate } =
      calculateFIFOOutstanding(transactions);

    if (
      totalOutstanding > 0 &&
      oldestUnpaidDate &&
      new Date(oldestUnpaidDate) <= ninetyDaysAgo
    ) {
      overdue90++;
    }
  }

  return {
    totalCustomers,
    totalSuppliers,
    overdue90,
  };
};