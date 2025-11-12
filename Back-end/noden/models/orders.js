// models/orders.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import { User } from "./user.js";
import { Product } from "./product.js";

export const Order = sequelize.define(
  "orders",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Shipped", "Delivered"),
      defaultValue: "Pending",
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

// ✅ Associations (MUST be declared after model definitions)
User.hasMany(Order, { foreignKey: "user_id", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "user_id" });

Product.hasMany(Order, { foreignKey: "product_id", onDelete: "CASCADE" });
Order.belongsTo(Product, { foreignKey: "product_id" });
