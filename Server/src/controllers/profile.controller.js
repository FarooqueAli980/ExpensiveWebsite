import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const getServerUrl = () => process.env.SERVER_URL || 'http://localhost:5000';
const getClientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  isOnline: user.isOnline,
  emailVerified: user.emailVerified,
  profileImage: user.profileImage || '',
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = req.user;

    if (!name && !email && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update.',
      });
    }

    let emailMessage = '';

    if (name) {
      user.name = name.trim();
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'This email is already in use by another account.',
        });
      }

      user.email = email.trim().toLowerCase();
      user.emailVerified = true; // No verification required for updated email
      emailMessage = '';
    }

    if (req.file) {
      const fileUrl = `${getServerUrl()}/uploads/${req.file.filename}`;
      user.profileImage = fileUrl;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Profile updated successfully.${emailMessage}`,
      user: buildUserPayload(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current and new passwords are required.',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Your account has been deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
