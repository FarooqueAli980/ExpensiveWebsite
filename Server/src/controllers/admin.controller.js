import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";

// ===============================
// Admin dashboard stats
// ===============================
export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, activeUsers, inactiveUsers, adminUsers, onlineUsers, totalTransactions, totalCategories] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ isOnline: true }),
      Transaction.countDocuments(),
      Category.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        onlineUsers,
        totalTransactions,
        totalCategories,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Admin users list
// ===============================
export const getAdminUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Update user role or activation
// ===============================
export const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot modify your own admin account from this panel.",
      });
    }

    const updates = {};

    if (role) {
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Role must be either 'user' or 'admin'.",
        });
      }
      updates.role = role;
    }

    if (typeof isActive === "boolean") {
      updates.isActive = isActive;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
