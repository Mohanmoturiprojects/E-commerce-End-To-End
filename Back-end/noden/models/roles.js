// models/roles.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Role = sequelize.define(
  "roles",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ex: 'USER', 'SELLER', 'MANAGER', 'DELIVERY'
    },
  },
  { timestamps: false }
);
