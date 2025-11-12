import { Sequelize } from "sequelize";

export const sequelize = new Sequelize("logikal", "root", "Mohan@234", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

try {
  await sequelize.authenticate();
  console.log("✅ Connected to MySQL via Sequelize");
} catch (error) {
  console.error("❌ Unable to connect:", error);
}
