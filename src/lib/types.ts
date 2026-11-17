export const WHATSAPP_NUMBER = "51997609045";
export const WHATSAPP_DISPLAY = "+51 997 609 045";
export const RESERVATION_MS = 24 * 60 * 60 * 1000;

/** Correos con acceso al panel de administración (igual que firestore.rules). */
export const ADMIN_EMAILS = [
  "joshuarojas432@gmail.com",
  "promo2026@outlook.com",
  "yo@gmail.com",
];

export const PANEL_URL = "https://product-hub-xi.vercel.app";

export type ColorOption = {
  name: string;
  hexColor: string;
};

export type StorageOption = {
  capacity: string;
  priceMultiplier: number;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  description: string;
  stock: number;
  colors: ColorOption[];
  storages: StorageOption[];
};

export type OrderItem = {
  productId: string;
  name: string;
  color: string;
  storage: string;
  quantity: number;
  unitPrice: number;
};

export type OrderStatus = "reserved" | "confirmed" | "cancelled" | "expired";

export type Order = {
  id: string;
  code: string;
  userUid: string;
  userEmail: string;
  createdAt: Date;
  expiresAt: Date;
  status: OrderStatus;
  total: number;
  imageSource: string;
  source: string;
  items: OrderItem[];
};

export type CartLine = {
  key: string;
  productId: string;
  name: string;
  category: string;
  imageUrl: string;
  color: string;
  storage: string;
  quantity: number;
  unitPrice: number;
};

export type UserProfile = {
  uid: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  edad: string;
  isAdmin: boolean;
};
