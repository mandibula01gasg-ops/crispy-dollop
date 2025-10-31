import mysql from "mysql2/promise";

const fixTransactionsTable = async () => {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  console.log("✅ Conectado ao MySQL");

  try {
    // Adicionar coluna payment_gateway
    await connection.execute(`
      ALTER TABLE transactions 
      ADD COLUMN payment_gateway TEXT NOT NULL DEFAULT 'mercadopago' AFTER payment_method
    `);
    console.log("✅ Coluna payment_gateway adicionada");
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("ℹ️  Coluna payment_gateway já existe");
    } else {
      console.error("Erro ao adicionar payment_gateway:", error.message);
    }
  }

  try {
    // Adicionar coluna pagarme_id
    await connection.execute(`
      ALTER TABLE transactions 
      ADD COLUMN pagarme_id TEXT AFTER mercado_pago_id
    `);
    console.log("✅ Coluna pagarme_id adicionada");
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("ℹ️  Coluna pagarme_id já existe");
    } else {
      console.error("Erro ao adicionar pagarme_id:", error.message);
    }
  }

  try {
    // Adicionar coluna pagarme_charge_id
    await connection.execute(`
      ALTER TABLE transactions 
      ADD COLUMN pagarme_charge_id TEXT AFTER pagarme_id
    `);
    console.log("✅ Coluna pagarme_charge_id adicionada");
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("ℹ️  Coluna pagarme_charge_id já existe");
    } else {
      console.error("Erro ao adicionar pagarme_charge_id:", error.message);
    }
  }

  console.log("✅ Tabela transactions atualizada com sucesso!");

  await connection.end();
};

fixTransactionsTable().catch(console.error);
