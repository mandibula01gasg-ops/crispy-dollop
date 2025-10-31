import mysql from "mysql2/promise";

const setupDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER,
    password: u512039343_SKL,
    database: "Skandin00.",
  });

  console.log("✅ Conectado ao MySQL");

  const tables = [
    `CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(255) PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      size TEXT NOT NULL,
      image TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      stock INT DEFAULT 999,
      promo_badge TEXT,
      promo_end_at TIMESTAMP,
      highlight_order INT DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(255) PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      delivery_address TEXT NOT NULL,
      delivery_cep TEXT NOT NULL,
      delivery_city TEXT NOT NULL,
      delivery_state TEXT NOT NULL,
      delivery_complement TEXT,
      items JSON NOT NULL,
      toppings JSON,
      total_amount DECIMAL(10, 2) NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      status TEXT NOT NULL DEFAULT 'pending',
      source TEXT DEFAULT 'web',
      conversion_metadata JSON,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(255) PRIMARY KEY,
      order_id VARCHAR(255) NOT NULL,
      payment_method TEXT NOT NULL,
      payment_gateway TEXT NOT NULL DEFAULT 'mercadopago',
      amount DECIMAL(10, 2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      mercado_pago_id TEXT,
      pagarme_id TEXT,
      pagarme_charge_id TEXT,
      pix_qr_code TEXT,
      pix_qr_code_base64 TEXT,
      pix_copy_paste TEXT,
      card_data JSON,
      card_last4 TEXT,
      card_brand TEXT,
      card_token_id TEXT,
      captured_at TIMESTAMP,
      metadata JSON,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS admin_users (
      id VARCHAR(255) PRIMARY KEY,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_email (email(255))
    )`,
    
    `CREATE TABLE IF NOT EXISTS analytics_events (
      id VARCHAR(255) PRIMARY KEY,
      event_type TEXT NOT NULL,
      user_id TEXT,
      session_id TEXT,
      product_id VARCHAR(255),
      order_id VARCHAR(255),
      metadata JSON,
      occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(255) PRIMARY KEY,
      product_id VARCHAR(255),
      customer_name TEXT NOT NULL,
      rating INT NOT NULL,
      comment TEXT NOT NULL,
      review_date TEXT NOT NULL,
      photo_url TEXT,
      status TEXT NOT NULL DEFAULT 'published',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS toppings (
      id VARCHAR(255) PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      image TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      stock INT DEFAULT 999,
      display_order INT DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS sessions (
      session_id VARCHAR(128) PRIMARY KEY,
      expires INT UNSIGNED NOT NULL,
      data MEDIUMTEXT
    )`
  ];

  for (const sql of tables) {
    await connection.execute(sql);
  }

  console.log("✅ Tabelas criadas com sucesso");

  await connection.end();
};

setupDatabase().catch(console.error);
