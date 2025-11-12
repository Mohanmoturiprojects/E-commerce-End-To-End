import { Role } from "./roles.js";
import { User } from "./user.js";
import { Product } from "./product.js";
import { Order } from "./orders.js";


Role.hasMany(User, {
  sourceKey: "role_name",
  foreignKey: "role",
  as: "users", 
});

User.belongsTo(Role, {
  targetKey: "role_name",
  foreignKey: "role",
  as: "roleInfo", 
});


User.hasMany(Order, {
  foreignKey: "user_id",
  as: "userOrders", 
});

Order.belongsTo(User, {
  foreignKey: "user_id",
  as: "orderUser",
});

Product.hasMany(Order, {
  foreignKey: "product_id", 
});

Order.belongsTo(Product, {
  foreignKey: "product_id",
  as: "orderProduct", 
});


export { Role, User, Product, Order };
