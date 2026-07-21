import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { logger } from "../lib/logger.js";
import { UserModel } from "../models/user.model.js";

const name = process.env.SEED_SUPER_ADMIN_NAME?.trim() || "Test Super Admin";
const email =
  process.env.SEED_SUPER_ADMIN_EMAIL?.trim().toLowerCase() ||
  "superadmin@medisync.test";
const password =
  process.env.SEED_SUPER_ADMIN_PASSWORD || "MediSync@Test2026!";

const seedSuperAdmin = async (): Promise<void> => {
  await connectDatabase();

  const existing = await UserModel.findOne({ email }).select("+password");

  if (existing) {
    existing.name = name;
    existing.password = password;
    existing.role = "SUPER_ADMIN";
    existing.status = "ACTIVE";
    existing.refreshToken = null;
    await existing.save();
    logger.info({ email }, "Super admin updated");
  } else {
    await UserModel.create({
      name,
      email,
      password,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    });
    logger.info({ email }, "Super admin created");
  }
};

const printSuccessMessage = (): void => {
  console.log("");
  console.log("\u2714 Super Admin is ready");
  console.log("");
  console.log("Login Credentials:");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("Role: SUPER_ADMIN");
  console.log("");
};

seedSuperAdmin()
  .then(() => {
    printSuccessMessage();
  })
  .catch((error) => {
    logger.error({ error }, "Failed to seed super admin");
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
