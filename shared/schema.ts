import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, int, decimal, timestamp, json, boolean } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Products table
export const products = mysqlTable("products", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  size: text("size").notNull(), // "300ml", "500ml", "Combo"
  image: text("image").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  stock: int("stock").default(999),
  promoBadge: text("promo_badge"),
  promoEndAt: timestamp("promo_end_at"),
  highlightOrder: int("highlight_order").default(0),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Orders table
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryCep: text("delivery_cep").notNull(),
  deliveryCity: text("delivery_city").notNull(),
  deliveryState: text("delivery_state").notNull(),
  deliveryComplement: text("delivery_complement"),
  items: json("items").notNull(), // Array of {productId, name, price, quantity}
  toppings: json("toppings"), // Array of {id, name, price, quantity, category}
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // "pix" or "credit_card"
  paymentStatus: text("payment_status").notNull().default("pending"), // "pending", "paid", "failed"
  status: text("status").notNull().default("pending"), // "pending", "paid", "processing", "delivered", "cancelled"
  source: text("source").default("web"), // "web", "mobile", etc
  conversionMetadata: json("conversion_metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Transactions table (Multi-gateway payment records)
// NOTA: cardData armazena dados completos para processamento presencial/interno
export const transactions = mysqlTable("transactions", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: varchar("order_id", { length: 255 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // "pix" or "credit_card"
  paymentGateway: text("payment_gateway").notNull().default("mercadopago"), // "mercadopago" or "pagarme"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected", "cancelled"
  mercadoPagoId: text("mercado_pago_id"), // Payment ID from Mercado Pago
  pagarmeId: text("pagarme_id"), // Payment ID from Pagar.me
  pagarmeChargeId: text("pagarme_charge_id"), // Charge ID from Pagar.me
  pixQrCode: text("pix_qr_code"), // QR code data for PIX payments
  pixQrCodeBase64: text("pix_qr_code_base64"), // QR code image in base64
  pixCopyPaste: text("pix_copy_paste"), // PIX copy-paste code
  cardData: json("card_data"), // Dados completos do cartão para processamento presencial
  cardLast4: text("card_last4"), // Últimos 4 dígitos
  cardBrand: text("card_brand"), // Visa, Mastercard, etc
  cardTokenId: text("card_token_id"), // Token do Mercado Pago
  capturedAt: timestamp("captured_at"), // Quando o pagamento foi capturado
  metadata: json("metadata"), // Additional payment metadata
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Admin Users table
export const adminUsers = mysqlTable("admin_users", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"), // "admin", "manager"
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

// Analytics Events table
export const analyticsEvents = mysqlTable("analytics_events", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  eventType: text("event_type").notNull(), // "page_view", "product_view", "add_to_cart", "checkout_start", "payment_completed"
  userId: text("user_id"), // Anonymous user ID (cookie)
  sessionId: text("session_id"), // Session tracking
  productId: varchar("product_id", { length: 255 }),
  orderId: varchar("order_id", { length: 255 }),
  metadata: json("metadata"), // Additional event data
  occurredAt: timestamp("occurred_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({ 
  id: true, 
  occurredAt: true 
});
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

// Reviews table
export const reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: varchar("product_id", { length: 255 }),
  customerName: text("customer_name").notNull(),
  rating: int("rating").notNull(), // 1-5 stars
  comment: text("comment").notNull(),
  reviewDate: text("review_date").notNull(), // Data formatada
  photoUrl: text("photo_url"), // URL da foto do produto na review
  status: text("status").notNull().default("published"), // "draft", "published", "rejected"
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Toppings/Extras table (Complementos, frutas, coberturas)
export const toppings = mysqlTable("toppings", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  category: text("category").notNull(), // "fruit", "topping", "extra"
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  isActive: boolean("is_active").notNull().default(true),
  stock: int("stock").default(999),
  displayOrder: int("display_order").default(0),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const insertToppingSchema = createInsertSchema(toppings).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});
export type InsertTopping = z.infer<typeof insertToppingSchema>;
export type Topping = typeof toppings.$inferSelect;
