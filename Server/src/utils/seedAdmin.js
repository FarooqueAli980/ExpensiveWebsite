import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const ensureAdminAccount = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
  const adminName = process.env.ADMIN_NAME || "Administrator";

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    if (existingAdmin.role !== "admin" || existingAdmin.isActive === false) {
      existingAdmin.role = "admin";
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log(`Verified built-in admin account: ${adminEmail}`);
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await User.create({
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: "admin",
    isActive: true,
  });

  console.log(`Built-in admin account created: ${adminEmail}`);
};
