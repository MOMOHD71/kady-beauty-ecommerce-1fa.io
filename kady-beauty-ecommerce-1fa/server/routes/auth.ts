import { RequestHandler } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadDB, saveDB } from "../db";

const __filenameAuth = fileURLToPath(import.meta.url);
const __dirnameAuth = path.dirname(__filenameAuth);

const db = loadDB();

type Role = "admin" | "user";
interface UserData { password: string; role: Role; name?: string; phone?: string }

const SESSIONS = new Map<string, { email: string }>();

function parseCookies(header?: string) {
  const out: Record<string, string> = {};
  if (!header) return out;
  header.split(";").forEach((part) => {
    const [k, ...rest] = part.trim().split("=");
    out[k] = rest.join("=");
  });
  return out;
}

const registeredCount = () => Object.keys(db.users).length;
const activeSessionsCount = () => SESSIONS.size;

export const register: RequestHandler = (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "email et password requis" });
  }
  if (db.users[email]) {
    return res.status(409).json({ error: "utilisateur existe déjà" });
  }
  db.users[email] = { password, role: "user" };
  saveDB(db);
  return res.json({ ok: true });
};

export const login: RequestHandler = (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "email et password requis" });
  }
  const user = db.users[email];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "identifiants invalides" });
  }
  // Constraint: sessions <= registered users
  if (activeSessionsCount() >= registeredCount() && !SESSIONS.has(email)) {
    return res.status(429).json({ error: "nombre de sessions atteint" });
  }
  const token = crypto.randomBytes(24).toString("hex");
  SESSIONS.set(token, { email });
  res.cookie("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });
  return res.json({ ok: true, email, role: user.role, name: user.name, phone: user.phone });
};

export const me: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) {
    return res.status(401).json({ error: "non connecté" });
  }
  const user = db.users[session.email]!;
  return res.json({ email: session.email, role: user.role, name: user.name, phone: user.phone });
};

export const updateProfile: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });

  const { name, phone, password } = req.body;
  const user = db.users[session.email]!;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (password) user.password = password;

  db.users[session.email] = user;
  saveDB(db);
  return res.json({ ok: true });
};

export const logout: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  if (token) SESSIONS.delete(token);
  res.clearCookie("session", { path: "/" });
  return res.json({ ok: true });
};

// --- Stats Storage ---
export const adminStats: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });
  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  let totalRevenue = 0;
  let totalOrders = 0;
  Object.values(db.orders).forEach(orders => {
    totalOrders += orders.length;
    orders.forEach(o => totalRevenue += Math.abs(o.total || 0));
  });

  const offset = (db as any).revenueOffset || 0;
  const effectiveRevenue = Math.max(0, totalRevenue - offset);

  return res.json({
    registeredUsers: registeredCount(),
    onlineUsers: activeSessionsCount(),
    totalRevenue: effectiveRevenue,
    totalOrders,
    servicesCount: db.services.length,
    bookingsCount: db.bookings.length
  });
};

export const getUsers: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });
  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  const usersList: any[] = [];
  Object.entries(db.users).forEach(([email, data]) => {
    const userData = data as any;
    usersList.push({
      email,
      name: userData.name,
      phone: userData.phone,
      role: userData.role
    });
  });
  return res.json({ users: usersList });
};

export const getPublicStats: RequestHandler = (_req, res) => {
  let totalRating = 0;
  let reviewsCount = 0;

  Object.values(db.reviews).forEach(reviews => {
    reviews.forEach(r => {
      totalRating += r.rating;
      reviewsCount++;
    });
  });

  const satisfaction = reviewsCount > 0
    ? Math.round((totalRating / (reviewsCount * 5)) * 100)
    : 100;

  res.json({
    registeredUsers: registeredCount(),
    experienceYears: 5,
    satisfaction: `${satisfaction}%`,
    settings: db.siteSettings,
    models: db.models || []
  });
};

export const updateSiteSettings: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });
  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  const { ownerTitle, ownerImageBase64, logoBase64, newModelBase64, deleteModelId } = req.body;

  if (ownerTitle) {
    db.siteSettings.ownerTitle = ownerTitle;
  }

  if (ownerImageBase64) {
    try {
      const base64Data = ownerImageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const publicPath = path.join(__dirnameAuth, "../../public/owner.png");
      fs.writeFileSync(publicPath, buffer);
      db.siteSettings.ownerImage = "/owner.png";
    } catch (err) {
      console.error("Error saving owner image:", err);
    }
  }

  if (logoBase64) {
    try {
      const base64Data = logoBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const publicPath = path.join(__dirnameAuth, "../../public/logo.png");
      fs.writeFileSync(publicPath, buffer);
      db.siteSettings.siteLogo = "/logo.png";
    } catch (err) {
      console.error("Error saving site logo:", err);
    }
  }

  // Handle Models (Phase 14)
  if (!db.models) db.models = [];

  if (newModelBase64) {
    try {
      const id = `MOD-${Date.now()}`;
      const base64Data = newModelBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `${id}.png`;
      const publicPath = path.join(__dirnameAuth, `../../public/${filename}`);
      fs.writeFileSync(publicPath, buffer);
      db.models.push({ id, image: `/${filename}` });
    } catch (err) {
      console.error("Error saving model image:", err);
    }
  }

  if (deleteModelId) {
    db.models = db.models.filter((m: any) => m.id !== deleteModelId);
  }

  saveDB(db);
  res.json({ success: true, settings: db.siteSettings, models: db.models });
};

// --- Products Storage ---
export const getProducts: RequestHandler = (req, res) => {
  const products = db.products.map(p => ({ ...p, price: Math.abs(p.price || 0), discount: Math.abs(p.discount || 0) }));
  res.json({ products });
};

export const addProduct: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });
  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  const { name, price, discount, category, image, imageBase64 } = req.body;
  const id = Date.now();

  let finalImageUrl = image;

  if (imageBase64) {
    try {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `prod_${id}.png`;
      const publicPath = path.join(__dirnameAuth, `../../public/${filename}`);
      fs.writeFileSync(publicPath, buffer);
      finalImageUrl = `/${filename}`;
    } catch (err) {
      console.error("Error saving product image:", err);
    }
  }

  const product = { id, name, price: Math.abs(Number(price) || 0), discount: Math.abs(Number(discount) || 0), category, image: finalImageUrl };
  db.products.push(product);
  saveDB(db);
  res.json({ success: true, product });
};

export const deleteProduct: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });
  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  const { id } = req.params;
  db.products = db.products.filter(p => p.id !== parseInt(id as string));
  saveDB(db);
  res.json({ success: true });
};

// --- Services Storage ---
export const getServices: RequestHandler = (req, res) => {
  const services = db.services.map(s => ({ ...s, price: Math.abs(s.price || 0), discount: Math.abs(s.discount || 0) }));
  res.json({ services });
};

export const addService: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });
  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  const { name, price, discount, description, image, imageBase64 } = req.body;
  const id = Date.now();

  let finalImageUrl = image;

  if (imageBase64) {
    try {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `serv_${id}.png`;
      const publicPath = path.join(__dirnameAuth, `../../public/${filename}`);
      fs.writeFileSync(publicPath, buffer);
      finalImageUrl = `/${filename}`;
    } catch (err) {
      console.error("Error saving service image:", err);
    }
  }

  const service = { id, name, price: Math.abs(Number(price) || 0), discount: Math.abs(Number(discount) || 0), description, image: finalImageUrl };
  db.services.push(service);
  saveDB(db);
  res.json({ success: true, service });
};

export const deleteService: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });
  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  const { id } = req.params;
  db.services = db.services.filter(s => s.id !== parseInt(id as string));
  saveDB(db);
  res.json({ success: true });
};

// --- Orders & Bookings Storage ---
interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  items: any[];
  paymentMethod?: string;
  deliveryRegion?: string;
  deliveryFee?: number;
  receiptScreenshot?: string;
  location?: { lat: number; lng: number };
  tracking?: {
    driverName?: string;
    driverPlate?: string;
    driverPhone?: string;
    deliveryConfirmedAt?: string;
  };
}

const ORDERS = new Map<string, Array<Order>>();
let DELIVERY_RATES = {
  abidjan: 1500,
  near: 2000,
  rest: 3000
};
let BOOKINGS: Array<{ id: string; name: string; email: string; date: string; time: string; phone: string; service: string; status: string }> = [];

export const createOrder: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });

  const { items, total } = req.body;
  const order = {
    id: `CMD-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    total: Math.abs(Number(total) || 0),
    status: "En attente",
    items: (items || []).map((item: any) => ({ ...item, price: Math.abs(Number(item.price) || 0) }))
  };

  const userOrders = db.orders[session.email] || [];
  userOrders.push(order);
  db.orders[session.email] = userOrders;
  saveDB(db);

  res.json({ success: true, order });
};

export const updateOrderDetails: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });

  const { orderId, paymentMethod, deliveryRegion, receiptScreenshot, receiptFilename, location, paymentPreference } = req.body;
  const userOrders = db.orders[session.email] || [];
  const order = userOrders.find(o => o.id === orderId);

  if (!order) return res.status(404).json({ error: "Commande non trouvée" });

  if (paymentMethod) order.paymentMethod = paymentMethod;
  if (paymentPreference) (order as any).paymentPreference = paymentPreference;
  if (deliveryRegion) {
    order.deliveryRegion = deliveryRegion;
    order.deliveryFee = (db.deliveryRates as any)[deliveryRegion] || 0;
  }

  if (receiptScreenshot && receiptScreenshot.startsWith("data:image")) {
    try {
      const base64Data = receiptScreenshot.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const filename = `receipt_${orderId}_${Date.now()}.png`;
      const publicPath = path.join(__dirnameAuth, `../../public/${filename}`);
      fs.writeFileSync(publicPath, buffer);
      order.receiptScreenshot = `/${filename}`;
    } catch (err) {
      console.error("Error saving receipt screenshot:", err);
    }
  }

  if (location) order.location = location;

  db.orders[session.email] = userOrders;
  saveDB(db);
  res.json({ success: true, order });
};

// Annulation de commande par l'admin avec justification + notification client
export const cancelOrder: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });
  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  const { orderId, reason } = req.body ?? {};
  if (!orderId || !reason) return res.status(400).json({ error: "orderId et reason requis" });

  let found = false;
  let targetEmail: string | null = null;
  Object.entries(db.orders).forEach(([email, orders]) => {
    const idx = (orders as any[]).findIndex(o => o.id === orderId);
    if (idx !== -1) {
      (orders as any[]).splice(idx, 1);
      db.orders[email] = orders as any[];
      found = true;
      targetEmail = email;
    }
  });

  if (!found) return res.status(404).json({ error: "Commande non trouvée" });

  if (targetEmail) {
    const msg = {
      id: `MSG-${Date.now()}`,
      name: "Administration",
      email: targetEmail,
      subject: "Annulation de commande",
      message: `Votre commande ${orderId} a été annulée. Motif: ${reason}`,
      date: new Date().toISOString()
    };
    db.messages.push(msg);
  }

  saveDB(db);
  return res.json({ success: true });
};

// Suppression d'un utilisateur par email (et de ses commandes)
export const deleteUser: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });
  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  const emailParam = (req.params as any).email as string;
  if (!emailParam) return res.status(400).json({ error: "email requis" });
  if (!db.users[emailParam] && !db.orders[emailParam]) {
    return res.status(404).json({ error: "utilisateur introuvable" });
  }
  delete db.users[emailParam];
  delete db.orders[emailParam];
  saveDB(db);
  return res.json({ success: true });
};

// Retourner tous les avis pour l'admin
export const getAllReviews: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });
  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  return res.json({ reviews: db.reviews || {} });
};

// Réinitialiser les données (sauf produits/services)
export const resetDemoData: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });
  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  db.orders = {};
  db.bookings = [];
  db.messages = [];
  db.reviews = {};
  (db as any).revenueOffset = 0;
  saveDB(db);
  return res.json({ success: true });
};

export const resetRevenue: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });
  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  let totalRevenue = 0;
  Object.values(db.orders).forEach(orders => {
    orders.forEach(o => totalRevenue += Math.abs(o.total || 0));
  });
  (db as any).revenueOffset = totalRevenue;
  saveDB(db);
  return res.json({ success: true });
};
export const confirmOrderDelivery: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });

  const { orderId } = req.body;
  const userOrders = db.orders[session.email] || [];
  const order = userOrders.find(o => o.id === orderId);

  if (!order) return res.status(404).json({ error: "Commande non trouvée" });

  order.status = "Livré";
  if (!order.tracking) order.tracking = {};
  order.tracking.deliveryConfirmedAt = new Date().toISOString();

  db.orders[session.email] = userOrders;
  saveDB(db);
  res.json({ success: true, order });
};

export const updateOrderTracking: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });

  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  const { orderId, driverName, driverPlate, driverPhone, status } = req.body;
  let found = false;

  Object.entries(db.orders).forEach(([email, orders]) => {
    const order = (orders as any[]).find(o => o.id === orderId);
    if (order) {
      if (driverName || driverPlate || driverPhone) {
        order.tracking = { ...order.tracking, driverName, driverPlate, driverPhone };
      }
      if (status) {
        order.status = status;
        if (status === "Livré") {
          order.tracking = { ...order.tracking, deliveryConfirmedAt: new Date().toISOString() };
        }
      }
      found = true;
    }
  });

  if (found) saveDB(db);
  if (!found) return res.status(404).json({ error: "Commande non trouvée" });
  res.json({ success: true });
};

export const getDeliveryRates: RequestHandler = (req, res) => {
  res.json(db.deliveryRates);
};

export const updateDeliveryRates: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });
  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  const { abidjan, near, rest } = req.body;
  if (abidjan !== undefined) db.deliveryRates.abidjan = abidjan;
  if (near !== undefined) db.deliveryRates.near = near;
  if (rest !== undefined) db.deliveryRates.rest = rest;

  saveDB(db);
  res.json({ success: true, rates: db.deliveryRates });
};

export const createBooking: RequestHandler = (req, res) => {
  const { name, email, date, time, phone, service } = req.body;
  if (!name || !email || !date || !time || !phone || !service) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  const booking = {
    id: `RSV-${Date.now()}`,
    name, email, date, time, phone, service,
    status: "Confirmé"
  };

  db.bookings.push(booking);
  saveDB(db);
  res.json({ success: true, booking });
};

export const getBookings: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });
  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  res.json({ bookings: db.bookings });
};

export const updateBooking: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });
  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  const { id } = req.params;
  const { status } = req.body;
  const booking = db.bookings.find(b => b.id === id);
  if (booking) {
    booking.status = status;
    saveDB(db);
    res.json({ success: true, booking });
  } else {
    res.status(404).json({ error: "Réservation non trouvée" });
  }
};

export const deleteBooking: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });
  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  const { id } = req.params;
  db.bookings = db.bookings.filter(b => b.id !== id);
  saveDB(db);
  res.json({ success: true });
};

export const myOrders: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });
  const list = (db.orders[session.email] ?? []).map((o: any) => ({
    ...o,
    total: Math.abs(o.total || 0),
    deliveryFee: Math.abs(o.deliveryFee || 0),
    items: (o.items || []).map((item: any) => ({ ...item, price: Math.abs(item.price || 0) }))
  }));
  return res.json({ orders: list });
};

export const getAllOrders: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });

  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  const allOrders: any[] = [];
  Object.values(db.orders).forEach((orders) => {
    (orders as any[]).forEach(o => allOrders.push({
      ...o,
      total: Math.abs(o.total || 0),
      deliveryFee: Math.abs(o.deliveryFee || 0),
      items: (o.items || []).map((item: any) => ({ ...item, price: Math.abs(item.price || 0) }))
    }));
  });
  return res.json({ orders: allOrders });
};

export const myBookings: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });

  const list = db.bookings.filter(b => b.email === session.email);
  return res.json({ bookings: list });
};

// --- Reviews Storage ---
export const getReviews: RequestHandler = (req, res) => {
  const itemId = req.params.itemId as string;
  const reviews = db.reviews[itemId] || [];
  res.json({ reviews });
};

export const postReview: RequestHandler = (req, res) => {
  const { itemId, rating, comment } = req.body;
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;

  if (!session) return res.status(401).json({ error: "non connecté" });
  if (!itemId || !rating || !comment) return res.status(400).json({ error: "Données manquantes" });

  const newReview = {
    id: `REV-${Date.now()}`,
    user: session.email.split('@')[0],
    rating,
    comment,
    date: new Date().toISOString()
  };

  const reviews = db.reviews[itemId] || [];
  reviews.unshift(newReview);
  db.reviews[itemId] = reviews;
  saveDB(db);

  res.json({ success: true, review: newReview });
};

// --- Contact Messages Storage ---
export const contact: RequestHandler = (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  const newMessage = {
    id: `MSG-${Date.now()}`,
    name,
    email,
    subject,
    message,
    date: new Date().toISOString()
  };

  db.messages.push(newMessage);
  saveDB(db);
  console.log("Nouveau message reçu:", newMessage);

  return res.json({ success: true, message: "Message envoyé avec succès" });
};

export const getMessages: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });

  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  return res.json({ messages: db.messages });
};

export const myMessages: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });

  const list = db.messages.filter(m => m.email === session.email);
  return res.json({ messages: list });
};

export const replyMessage: RequestHandler = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["session"];
  const session = token ? SESSIONS.get(token) : undefined;
  if (!session) return res.status(401).json({ error: "non connecté" });

  const user = db.users[session.email]!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  const { id } = req.params;
  const { reply } = req.body;

  const msg = db.messages.find(m => m.id === id);
  if (!msg) return res.status(404).json({ error: "Message non trouvé" });

  msg.reply = reply;
  saveDB(db);

  return res.json({ success: true, message: msg });
};

// getPublicStats moved up

export const getPublicBookings: RequestHandler = (req, res) => {
  const dates = db.bookings.map(b => b.date);
  res.json({ dates });
};
