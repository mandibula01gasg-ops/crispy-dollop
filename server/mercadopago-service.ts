import { MercadoPagoConfig, Payment } from "mercadopago";

interface CreatePixPaymentParams {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerDocument: string;
  customerPhone: string;
  description: string;
  orderId: string;
}

interface PixPaymentResponse {
  success: boolean;
  paymentId?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  pixCopyPaste?: string;
  status?: string;
  error?: string;
}

export class MercadoPagoService {
  private client: MercadoPagoConfig | null = null;
  private payment: Payment | null = null;
  private isConfigured: boolean;

  constructor() {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      console.warn("⚠️ MERCADO_PAGO_ACCESS_TOKEN não configurado. Pagamentos PIX via Mercado Pago não estarão disponíveis.");
      this.isConfigured = false;
      return;
    }

    try {
      this.client = new MercadoPagoConfig({
        accessToken: accessToken,
        options: { timeout: 5000 }
      });
      this.payment = new Payment(this.client);
      this.isConfigured = true;
      console.log("✅ Mercado Pago configurado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao configurar Mercado Pago:", error);
      this.isConfigured = false;
    }
  }

  async createPixPayment(params: CreatePixPaymentParams): Promise<PixPaymentResponse> {
    if (!this.isConfigured || !this.payment) {
      return {
        success: false,
        error: "Mercado Pago não está configurado. Configure MERCADO_PAGO_ACCESS_TOKEN.",
      };
    }

    try {
      const cleanDocument = params.customerDocument.replace(/\D/g, '');
      const cleanPhone = params.customerPhone.replace(/\D/g, '');

      console.log("🔄 Criando pagamento PIX no Mercado Pago...");
      console.log("Valor:", params.amount);
      console.log("Cliente:", params.customerName);
      
      const paymentData = {
        transaction_amount: params.amount,
        description: params.description,
        payment_method_id: "pix",
        payer: {
          email: params.customerEmail || `${cleanDocument}@placeholder.com`,
          first_name: params.customerName.split(' ')[0] || params.customerName,
          last_name: params.customerName.split(' ').slice(1).join(' ') || 'Cliente',
          identification: {
            type: "CPF",
            number: cleanDocument,
          },
        },
        notification_url: process.env.MERCADO_PAGO_WEBHOOK_URL,
        external_reference: params.orderId,
      };

      const response = await this.payment.create({ body: paymentData });

      if (!response || !response.id) {
        throw new Error("Resposta inválida do Mercado Pago");
      }

      console.log("✅ Pagamento PIX criado com sucesso! ID:", response.id);
      console.log("Status:", response.status);

      // Extrair dados do PIX da resposta
      const pointOfInteraction = response.point_of_interaction;
      const transactionData = pointOfInteraction?.transaction_data;

      if (!transactionData) {
        throw new Error("Dados do PIX não disponíveis na resposta");
      }

      return {
        success: true,
        paymentId: response.id?.toString(),
        qrCode: transactionData.qr_code,
        qrCodeBase64: transactionData.qr_code_base64,
        pixCopyPaste: transactionData.qr_code,
        status: response.status,
      };
    } catch (error: any) {
      console.error("❌ Erro ao criar pagamento PIX no Mercado Pago:", error);
      
      let errorMessage = "Erro ao criar pagamento PIX";
      
      if (error.cause) {
        console.error("Causa do erro:", error.cause);
      }
      
      if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async checkPaymentStatus(paymentId: string): Promise<any> {
    if (!this.isConfigured || !this.payment) {
      return null;
    }

    try {
      const response = await this.payment.get({ id: paymentId });
      return response;
    } catch (error) {
      console.error("❌ Erro ao consultar status do pagamento:", error);
      return null;
    }
  }

  isAvailable(): boolean {
    return this.isConfigured;
  }
}

export const mercadoPagoService = new MercadoPagoService();
