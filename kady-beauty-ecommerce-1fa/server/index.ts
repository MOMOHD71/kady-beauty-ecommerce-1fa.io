import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  register, login, logout, me, adminStats, myOrders, contact, getMessages, replyMessage, myMessages,
  getProducts, addProduct, deleteProduct,
  getServices, addService, deleteService,
  createBooking, getBookings, getPublicBookings,
  createOrder, getReviews, postReview, getPublicStats, updateProfile,
  updateBooking, deleteBooking, updateOrderDetails, updateOrderTracking, confirmOrderDelivery,
  getDeliveryRates, updateDeliveryRates, getAllOrders, getUsers, myBookings, updateSiteSettings,
  cancelOrder, deleteUser, getAllReviews, resetDemoData, resetRevenue
} from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  // API Routes
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.post("/api/auth/logout", logout);
  app.get("/api/auth/me", me);

  // Admin Routes
  app.get("/api/admin/stats", adminStats);
  app.get("/api/admin/messages", getMessages);
  app.post("/api/admin/messages/:id/reply", replyMessage);
  app.get("/api/admin/products", getProducts);
  app.post("/api/admin/products", addProduct);
  app.delete("/api/admin/products/:id", deleteProduct);
  app.get("/api/admin/services", getServices);
  app.post("/api/admin/services", addService);
  app.delete("/api/admin/services/:id", deleteService);
  app.get("/api/admin/bookings", getBookings);
  app.put("/api/admin/bookings/:id", updateBooking);
  app.delete("/api/admin/bookings/:id", deleteBooking);
  app.put("/api/admin/orders/tracking", updateOrderTracking);
  app.post("/api/admin/orders/cancel", cancelOrder);
  app.get("/api/admin/delivery-rates", getDeliveryRates);
  app.put("/api/admin/delivery-rates", updateDeliveryRates);
  app.get("/api/admin/orders", getAllOrders);
  app.get("/api/admin/users", getUsers);
  app.delete("/api/admin/users/:email", deleteUser);
  app.get("/api/admin/reviews", getAllReviews);
  app.put("/api/admin/settings", updateSiteSettings);
  app.post("/api/admin/reset-demo", resetDemoData);
  app.post("/api/admin/reset-revenue", resetRevenue);

  // User Routes
  app.get("/api/me/orders", myOrders);
  app.get("/api/me/bookings", myBookings);
  app.get("/api/me/messages", myMessages);
  app.post("/api/orders", createOrder);
  app.put("/api/orders/details", updateOrderDetails);
  app.post("/api/orders/confirm", confirmOrderDelivery);
  app.get("/api/delivery-rates", getDeliveryRates);
  app.post("/api/bookings", createBooking);
  app.post("/api/contact", contact);
  app.put("/api/auth/profile", updateProfile);
  app.post("/api/auth/logout", logout);

  // Public Routes
  app.get("/api/services", getServices);
  app.get("/api/products", getProducts);
  app.get("/api/reviews/:itemId", getReviews);
  app.post("/api/reviews", postReview);
  app.get("/api/stats/public", getPublicStats);
  app.get("/api/bookings/public", getPublicBookings);

  return app;
}
