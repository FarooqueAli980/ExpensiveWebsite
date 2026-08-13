import Transaction from "../models/Transaction.js";

const buildReportQuery = ({ startDate, endDate, category, type, minAmount, maxAmount, reportType, keyword }, userId) => {
  const query = { user: userId };

  if (startDate) query.date = { ...query.date, $gte: new Date(startDate) };
  if (endDate) query.date = { ...query.date, $lte: new Date(endDate) };
  if (category) query.category = category;
  if (type) query.type = type;
  if (minAmount) query.amount = { ...query.amount, $gte: Number(minAmount) };
  if (maxAmount) query.amount = { ...query.amount, $lte: Number(maxAmount) };
  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { note: { $regex: keyword, $options: 'i' } },
    ];
  }

  const now = new Date();
  switch (reportType) {
    case 'income':
      query.type = 'Income';
      break;
    case 'expense':
      query.type = 'Expense';
      break;
    case 'monthly':
      query.date = {
        ...query.date,
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      };
      break;
    case 'yearly':
      query.date = {
        ...query.date,
        $gte: new Date(now.getFullYear(), 0, 1),
        $lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
      };
      break;
    case 'category':
      if (category) query.category = category;
      break;
    case 'all':
    default:
      break;
  }

  return query;
};

// ============================================
// Get All Reports (Pagination + Sorting)
// ============================================
export const getAllReports = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortField = req.query.sort || "date";

    const query = buildReportQuery(req.query, req.user._id);

    const total = await Transaction.countDocuments(query);

    const transactions = await Transaction.find(query)
      .populate("category", "name icon color")
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalRecords: total,
      totalPages: Math.ceil(total / limit),
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// Search Transactions
// ============================================
export const searchTransactions = async (req, res) => {
  try {
    const keyword = req.query.keyword;

    const transactions = await Transaction.find({
      user: req.user._id,
      $or: [
        {
          title: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          note: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    }).populate("category");

    res.status(200).json({
      success: true,
      total: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// Filter By Category
// ============================================
export const filterByCategory = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
      category: req.params.id,
    }).populate("category");

    res.status(200).json({
      success: true,
      total: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// Filter By Type
// ============================================
export const filterByType = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
      type: req.params.type,
    }).populate("category");

    res.status(200).json({
      success: true,
      total: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// Filter By Date
// ============================================
export const filterByDate = async (req, res) => {
  try {
    const { start, end } = req.query;

    const transactions = await Transaction.find({
      user: req.user._id,
      date: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    }).populate("category");

    res.status(200).json({
      success: true,
      total: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};