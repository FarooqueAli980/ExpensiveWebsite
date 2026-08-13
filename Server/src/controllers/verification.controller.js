import crypto from "crypto";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required.",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token.",
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified.",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex");
    const verificationExpires = Date.now() + 60 * 60 * 1000;

    user.emailVerificationToken = verificationTokenHash;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    const verifyUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email/${verificationToken}`;
    const message = `Please verify your email by clicking the link below:\n\n${verifyUrl}\n\nIf you did not request this, ignore this email.`;

    await sendEmail({
      to: user.email,
      subject: "Resend email verification",
      text: message,
      html: `<p>Please verify your email by clicking the link below.</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>If you did not request this, ignore this email.</p>`,
    });

    res.status(200).json({
      success: true,
      message: "Verification email resent successfully.",
      resetUrl: verifyUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
