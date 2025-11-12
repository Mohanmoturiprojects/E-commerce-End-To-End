import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import { Role } from "./roles.js";

export const User = sequelize.define(
  "usercredentials",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    mobile: DataTypes.STRING,
    address: DataTypes.STRING,
    gender: DataTypes.STRING,
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "USER",
    },

    // ✅ New fields for Forgot Password feature
  
  },
  {
    timestamps: false,
    tableName: "usercredentials",
  }
);

// ✅ Associations
//Role.hasMany(User, { sourceKey: "role_name", foreignKey: "role",  as: "users",});
//User.belongsTo(Role, {targetKey: "role_name",foreignKey: "role",as: "roleInfo",});
