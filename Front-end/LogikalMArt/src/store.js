import { configureStore, createSlice } from "@reduxjs/toolkit";

/* ---------------------- Helper Functions ---------------------- */
const getActiveUser = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    return storedUser?.username || storedUser?.email || "guest";
  } catch {
    return "guest";
  }
};

const getUserData = (key, username) => {
  try {
    const savedData = localStorage.getItem(`${key}_${username}`);
    return savedData ? JSON.parse(savedData) : [];
  } catch {
    return [];
  }
};

/* ---------------------- CART SLICE ---------------------- */
const username = getActiveUser();
const localCart = getUserData("cart", username);

const cartSlice = createSlice({
  name: "cart",
  initialState: localCart,
  reducers: {
    AddToCart: (state, action) => {
      const item = state.find((i) => i.name === action.payload.name);
      if (item) item.quantity += 1;
      else state.push({ ...action.payload, quantity: 1 });
    },
    IncCart: (state, action) => {
      const item = state.find((i) => i.name === action.payload.name);
      if (item) item.quantity += 1;
    },
    DecCart: (state, action) => {
      const item = state.find((i) => i.name === action.payload.name);
      if (item.quantity > 1) item.quantity -= 1;
      else return state.filter((i) => i.name !== action.payload.name);
    },
    RemoveFromCart: (state, action) =>
      state.filter((i) => i.name !== action.payload.name),
    ClearCart: () => [],
    SetCart: (state, action) => action.payload,
  },
});

/* ---------------------- ORDERS SLICE ---------------------- */
const localOrders = getUserData("orders", username);

const ordersSlice = createSlice({
  name: "orders",
  initialState: localOrders,
  reducers: {
    AddOrder: (state, action) => {
      state.push(action.payload);
    },
    SetOrders: (state, action) => action.payload,
    ClearOrders: () => [],
  },
});

/* ---------------------- Exports ---------------------- */
export const { AddToCart, IncCart, DecCart, RemoveFromCart, ClearCart, SetCart,} = cartSlice.actions;

export const { AddOrder, SetOrders, ClearOrders } = ordersSlice.actions;

/* ---------------------- Store Config ---------------------- */
const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
    orders: ordersSlice.reducer,
  },
});

/* ---------------------- Persist to LocalStorage ---------------------- */
store.subscribe(() => {
  const state = store.getState();
  const currentUser = getActiveUser();

  // ✅ Save cart for current user
  localStorage.setItem(`cart_${currentUser}`, JSON.stringify(state.cart));

  // ✅ Save orders for current user (isolated)
  localStorage.setItem(`orders_${currentUser}`, JSON.stringify(state.orders));
});

/* ---------------------- Restore on Load ---------------------- */
window.addEventListener("load", () => {
  const currentUser = getActiveUser();
  const storedCart = getUserData("cart", currentUser);
  const storedOrders = getUserData("orders", currentUser);

  if (storedCart.length > 0)
    store.dispatch(cartSlice.actions.SetCart(storedCart));

  if (storedOrders.length > 0)
    store.dispatch(ordersSlice.actions.SetOrders(storedOrders));
});

/* ---------------------- Clear old data on user switch ---------------------- */
window.addEventListener("storage", (event) => {
  if (event.key === "user") {
    const newUser = getActiveUser();
    const userCart = getUserData("cart", newUser);
    const userOrders = getUserData("orders", newUser);

    store.dispatch(SetCart(userCart));
    store.dispatch(SetOrders(userOrders));
  }
});

export default store;
