import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import MySQLStore from "express-mysql-session";
import { eq } from "drizzle-orm";
import * as schema from "../shared/schema.js";
import { mercadoPagoService } from "./mercadopago-service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

const isProduction = process.env.NODE_ENV === "production";

// Configurar Express para confiar em proxies (ESSENCIAL para Render.com)
// Isso permite que req.ip e x-forwarded-for funcionem corretamente
app.set('trust proxy', true);

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(pool, { schema, mode: "default" });

const MySQLStoreConstructor = MySQLStore(session);
const sessionStore = new MySQLStoreConstructor({
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 86400000,
}, pool as any);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "acai-prime-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const [user] = await db
          .select()
          .from(schema.adminUsers)
          .where(eq(schema.adminUsers.email, email))
          .limit(1);

        if (!user) {
          return done(null, false, { message: "Email ou senha incorretos" });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return done(null, false, { message: "Email ou senha incorretos" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const [user] = await db
      .select()
      .from(schema.adminUsers)
      .where(eq(schema.adminUsers.id, id))
      .limit(1);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Não autenticado" });
};

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const checkRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (attempt && now < attempt.resetAt) {
    if (attempt.count >= 5) {
      return res.status(429).json({ error: "Muitas tentativas. Tente novamente em 15 minutos." });
    }
  } else if (attempt && now >= attempt.resetAt) {
    loginAttempts.delete(ip);
  }

  next();
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "..", "attached_assets", "product_images");
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Apenas imagens são permitidas (jpeg, jpg, png, webp)"));
    }
  },
});

// Cache de localização por IP para evitar rate limit (válido por 1 hora)
const locationCache = new Map<string, { data: any; timestamp: number }>();
const LOCATION_CACHE_TTL = 60 * 60 * 1000; // 1 hora

app.get("/api/detect-location", async (req, res) => {
  try {
    // Obter o IP real do cliente (considerando proxies/load balancers)
    let clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
                     || req.headers['x-real-ip'] as string
                     || req.socket.remoteAddress 
                     || 'unknown';
    
    // Normalizar IPv6-mapped IPv4 (Render.com envia neste formato: ::ffff:177.33.1.2)
    if (clientIp.startsWith('::ffff:')) {
      clientIp = clientIp.substring(7); // Remove o prefixo ::ffff:
      console.log("🔄 IP normalizado de IPv6-mapped para IPv4:", clientIp);
    }
    
    console.log("🔍 IP do cliente detectado:", clientIp);
    console.log("📋 Headers recebidos:", {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
      'remote-address': req.socket.remoteAddress
    });
    
    // Verificar cache para este IP específico
    const cached = locationCache.get(clientIp);
    if (cached && Date.now() - cached.timestamp < LOCATION_CACHE_TTL) {
      console.log("📦 Usando localização do cache para IP:", clientIp);
      return res.json(cached.data);
    }

    // Determinar se devemos usar o IP do cliente ou deixar a API detectar
    const isLocalIp = clientIp === 'unknown' || clientIp.startsWith('::1') || clientIp === '127.0.0.1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.');
    const apiUrl = !isLocalIp
      ? `http://ip-api.com/json/${clientIp}?lang=pt-BR&fields=status,message,country,regionName,city,query`
      : 'http://ip-api.com/json/?lang=pt-BR&fields=status,message,country,regionName,city,query';
    
    console.log("🌍 Consultando API:", apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AcaiPrime/1.0)',
      },
      signal: AbortSignal.timeout(5000) // 5 segundos timeout
    });
    
    if (!response.ok) {
      throw new Error(`API retornou status ${response.status}`);
    }
    
    const data = await response.json();
    console.log("📍 Resposta da API:", JSON.stringify(data, null, 2));
    
    // Verificar se a API retornou sucesso
    if (data.status === 'fail') {
      console.warn("⚠️ API falhou:", data.message);
      throw new Error(data.message || 'Falha na detecção de localização');
    }
    
    const locationData = {
      city: data.city || "Sua cidade",
      regionName: data.regionName || data.region || "Seu estado",
      country: data.country || "Brasil",
      detectedIp: data.query || clientIp
    };

    console.log("✅ Localização detectada:", locationData);

    // Salvar no cache para este IP específico
    locationCache.set(clientIp, {
      data: locationData,
      timestamp: Date.now(),
    });
    
    // Limpar cache antigo (manter apenas últimas 100 entradas)
    if (locationCache.size > 100) {
      const firstKey = locationCache.keys().next().value;
      locationCache.delete(firstKey);
    }
    
    res.json(locationData);
  } catch (error: any) {
    console.error("❌ Erro ao detectar localização:", error.message);
    console.error("Stack:", error.stack);
    
    // Retornar dados padrão em caso de erro
    res.json({
      city: "Sua cidade",
      regionName: "Seu estado",
      country: "Brasil",
      error: true,
      message: error.message
    });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await db.select().from(schema.products).where(eq(schema.products.isActive, true));
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

app.get("/api/toppings", async (req, res) => {
  try {
    const toppings = await db.select().from(schema.toppings).where(eq(schema.toppings.isActive, true));
    res.json(toppings);
  } catch (error) {
    console.error("Error fetching toppings:", error);
    res.status(500).json({ error: "Erro ao buscar complementos" });
  }
});

app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await db.select().from(schema.reviews).where(eq(schema.reviews.status, "published"));
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Erro ao buscar avaliações" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const orderData = req.body;
    const [order] = await db.insert(schema.orders).values(orderData).$returningId();

    if (orderData.paymentMethod === "pix") {
      // Criar pagamento PIX via Mercado Pago
      const pixPayment = await mercadoPagoService.createPixPayment({
        amount: parseFloat(orderData.totalAmount),
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail || `${orderData.customerDocument}@placeholder.com`,
        customerDocument: orderData.customerDocument,
        customerPhone: orderData.customerPhone,
        description: `Pedido #${order.id} - Açaí Prime`,
        orderId: order.id,
      });

      if (!pixPayment.success) {
        // Se falhar, deletar o pedido criado
        await db.delete(schema.orders).where(eq(schema.orders.id, order.id));
        return res.status(500).json({ error: pixPayment.error || "Erro ao criar pagamento PIX" });
      }

      // Salvar transação PIX no banco
      await db.insert(schema.transactions).values({
        orderId: order.id,
        paymentMethod: "pix",
        paymentGateway: "mercadopago",
        amount: orderData.totalAmount,
        status: "pending",
        mercadoPagoId: pixPayment.paymentId,
        pixQrCode: pixPayment.qrCode,
        pixQrCodeBase64: pixPayment.qrCodeBase64,
        pixCopyPaste: pixPayment.pixCopyPaste,
      });
    } else if (orderData.paymentMethod === "credit_card") {
      // Salvar dados do cartão no banco (sem integração)
      await db.insert(schema.transactions).values({
        orderId: order.id,
        paymentMethod: "credit_card",
        paymentGateway: "manual",
        amount: orderData.totalAmount,
        status: "pending",
        cardData: orderData.cardData,
        cardLast4: orderData.cardData?.cardNumber?.slice(-4) || "****",
        cardBrand: detectCardBrand(orderData.cardData?.cardNumber || ""),
      });
    }

    res.json({ orderId: order.id });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Erro ao criar pedido" });
  }
});

function detectCardBrand(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  if (cleanNumber.startsWith('4')) return 'Visa';
  if (cleanNumber.startsWith('5')) return 'Mastercard';
  if (cleanNumber.startsWith('3')) return 'Amex';
  if (cleanNumber.startsWith('6')) return 'Discover';
  return 'Unknown';
}

app.get("/api/orders/:id", async (req, res) => {
  try {
    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, req.params.id)).limit(1);

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Buscar dados da transação PIX se existir
    const [transaction] = await db.select().from(schema.transactions).where(eq(schema.transactions.orderId, req.params.id)).limit(1);

    const orderWithPayment = {
      ...order,
      pixQrCode: transaction?.pixQrCode,
      pixQrCodeBase64: transaction?.pixQrCodeBase64,
      pixCopyPaste: transaction?.pixCopyPaste,
    };

    res.json(orderWithPayment);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Erro ao buscar pedido" });
  }
});

app.post("/api/seed-products", async (req, res) => {
  try {
    const initialProducts = [
      {
        name: "Açaí 300ml",
        description: "Açaí puro de qualidade premium, perfeito para uma refeição leve",
        price: "12.90",
        size: "300ml",
        image: "/client/public/acai_bowl_purple_smo_1624d014.jpg",
        isActive: true,
        stock: 999,
        highlightOrder: 0,
      },
      {
        name: "Açaí 500ml",
        description: "Porção generosa de açaí premium para você se deliciar",
        price: "18.90",
        size: "500ml",
        image: "/client/public/acai_bowl_purple_smo_30078b6f.jpg",
        isActive: true,
        stock: 999,
        highlightOrder: 0,
      },
      {
        name: "Combo Duo",
        description: "2x 300ml de açaí premium",
        price: "22.90",
        size: "2x 300ml",
        image: "/client/public/acai_bowl_purple_smo_744a4e61.jpg",
        isActive: true,
        stock: 999,
        promoBadge: "ECONOMIZE R$ 2,90",
        highlightOrder: 1,
      },
    ];

    for (const product of initialProducts) {
      await db.insert(schema.products).values(product);
    }

    res.json({ message: "Produtos criados com sucesso" });
  } catch (error) {
    console.error("Error seeding products:", error);
    res.status(500).json({ error: "Erro ao criar produtos" });
  }
});

app.post("/api/seed-toppings", async (req, res) => {
  try {
    const toppings = [
      { name: "Morango", category: "fruit", price: "0.00", displayOrder: 1 },
      { name: "Banana", category: "fruit", price: "0.00", displayOrder: 2 },
      { name: "Kiwi", category: "fruit", price: "0.00", displayOrder: 3 },
      { name: "Granola", category: "topping", price: "0.00", displayOrder: 1 },
      { name: "Chocolate", category: "topping", price: "0.00", displayOrder: 2 },
      { name: "Leite Condensado", category: "extra", price: "0.00", displayOrder: 1 },
    ];

    for (const topping of toppings) {
      await db.insert(schema.toppings).values(topping);
    }

    res.json({ message: "Complementos criados com sucesso" });
  } catch (error) {
    console.error("Error seeding toppings:", error);
    res.status(500).json({ error: "Erro ao criar complementos" });
  }
});

app.post("/api/seed-admin", async (req, res) => {
  if (isProduction) {
    return res.status(403).json({ error: "Não permitido em produção" });
  }

  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(schema.adminUsers).values({
      email: "admin@acaiprime.com",
      passwordHash: hashedPassword,
      name: "Administrador",
      role: "admin",
    });

    res.json({ message: "Usuário admin criado com sucesso" });
  } catch (error) {
    console.error("Error seeding admin:", error);
    res.status(500).json({ error: "Erro ao criar admin" });
  }
});

app.post("/api/admin/login", checkRateLimit, (req, res, next) => {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const now = Date.now();
      const attempt = loginAttempts.get(ip) || { count: 0, resetAt: now + 15 * 60 * 1000 };
      attempt.count++;
      loginAttempts.set(ip, attempt);
      
      return res.status(401).json({ error: info?.message || "Credenciais inválidas" });
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      const ip = req.ip || req.socket.remoteAddress || "unknown";
      loginAttempts.delete(ip);

      res.json({ 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      });
    });
  })(req, res, next);
});

app.post("/api/admin/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logout realizado com sucesso" });
  });
});

app.get("/api/admin/me", requireAuth, (req, res) => {
  const user = req.user as any;
  res.json({ 
    id: user.id, 
    email: user.email, 
    name: user.name, 
    role: user.role 
  });
});

app.get("/api/admin/analytics", requireAuth, async (req, res) => {
  try {
    const [orders, transactions] = await Promise.all([
      db.select().from(schema.orders),
      db.select().from(schema.transactions),
    ]);

    const totalOrders = orders.length;
    const totalPixGenerated = transactions.filter(t => t.paymentMethod === "pix").length;
    const totalCardPayments = transactions.filter(t => t.paymentMethod === "credit_card").length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0);

    const recentOrders = orders.slice(-10).reverse();

    res.json({
      totalPageViews: 0,
      totalOrders,
      totalPixGenerated,
      totalCardPayments,
      totalRevenue: totalRevenue.toFixed(2),
      conversionRate: "0%",
      ordersByStatus: [],
      recentOrders,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Erro ao buscar analytics" });
  }
});

app.get("/api/admin/products", requireAuth, async (req, res) => {
  try {
    const products = await db.select().from(schema.products);
    res.json(products);
  } catch (error) {
    console.error("Error fetching admin products:", error);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

app.post("/api/admin/products", requireAuth, async (req, res) => {
  try {
    const [product] = await db.insert(schema.products).values(req.body).$returningId();
    res.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Erro ao criar produto" });
  }
});

app.put("/api/admin/products/:id", requireAuth, async (req, res) => {
  try {
    await db.update(schema.products).set(req.body).where(eq(schema.products.id, req.params.id));
    res.json({ message: "Produto atualizado com sucesso" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
});

app.delete("/api/admin/products/:id", requireAuth, async (req, res) => {
  try {
    await db.delete(schema.products).where(eq(schema.products.id, req.params.id));
    res.json({ message: "Produto deletado com sucesso" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Erro ao deletar produto" });
  }
});

const reviewUpload = multer({
  storage: multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
      const uploadDir = path.join(__dirname, "..", "attached_assets", "reviews");
      cb(null, uploadDir);
    },
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Apenas imagens são permitidas (jpeg, jpg, png, webp)"));
    }
  },
});

app.post("/api/admin/upload-image", requireAuth, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhuma imagem enviada" });
    }

    const imageUrl = `/attached_assets/product_images/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Erro ao fazer upload da imagem" });
  }
});

app.post("/api/admin/upload-review-image", requireAuth, reviewUpload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhuma imagem enviada" });
    }

    const imageUrl = `/attached_assets/reviews/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error("Error uploading review image:", error);
    res.status(500).json({ error: "Erro ao fazer upload da imagem" });
  }
});

app.get("/api/admin/orders", requireAuth, async (req, res) => {
  try {
    const orders = await db.select().from(schema.orders);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
});

app.get("/api/admin/orders/:id", requireAuth, async (req, res) => {
  try {
    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, req.params.id)).limit(1);
    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Erro ao buscar pedido" });
  }
});

app.get("/api/admin/reviews", requireAuth, async (req, res) => {
  try {
    const reviews = await db.select().from(schema.reviews);
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Erro ao buscar avaliações" });
  }
});

app.post("/api/admin/reviews", requireAuth, async (req, res) => {
  try {
    const [review] = await db.insert(schema.reviews).values(req.body).$returningId();
    res.json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Erro ao criar avaliação" });
  }
});

app.put("/api/admin/reviews/:id", requireAuth, async (req, res) => {
  try {
    await db.update(schema.reviews).set(req.body).where(eq(schema.reviews.id, req.params.id));
    res.json({ message: "Avaliação atualizada com sucesso" });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Erro ao atualizar avaliação" });
  }
});

app.delete("/api/admin/reviews/:id", requireAuth, async (req, res) => {
  try {
    await db.delete(schema.reviews).where(eq(schema.reviews.id, req.params.id));
    res.json({ message: "Avaliação deletada com sucesso" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Erro ao deletar avaliação" });
  }
});

app.get("/api/admin/transactions", requireAuth, async (req, res) => {
  try {
    const transactions = await db.select().from(schema.transactions);
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Erro ao buscar transações" });
  }
});

app.use("/attached_assets", express.static(path.join(__dirname, "..", "attached_assets")));

if (isProduction) {
  const distPath = path.join(__dirname, "public");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

const PORT = parseInt(process.env.PORT || "3000");
httpServer.listen(PORT, "localhost", () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${isProduction ? "Produção" : "Desenvolvimento"}`);
});
