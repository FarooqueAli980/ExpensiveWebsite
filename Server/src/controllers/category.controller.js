import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";

// ==============================
// Create Category
// ==============================
export const createCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Name and Type are required.",
      });
    }

    // Check duplicate category for same user
    const existingCategory = await Category.findOne({
      name,
      type,
      user: req.user._id,
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists.",
      });
    }

    const category = await Category.create({
      name,
      type,
      icon,
      color,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get All Categories
// ==============================
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get Single Category
// ==============================
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Update Category
// ==============================
export const updateCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    const category = await Category.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        name,
        type,
        icon,
        color,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Delete Category
// ==============================
export const deleteCategory = async (req, res) => {
  try {
    // Debug log: record incoming delete request
    console.log(`DELETE /api/categories/${req.params.id} requested by user ${req.user?._id}`);

    // Find the category first and verify ownership explicitly
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    // Ensure the category belongs to the authenticated user
    if (String(category.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this category." });
    }

    // Delete the category
    await Category.deleteOne({ _id: category._id });

    // Unset category reference from transactions that used this category
    await Transaction.updateMany({ category: category._id }, { $unset: { category: "" } });

    res.status(200).json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};