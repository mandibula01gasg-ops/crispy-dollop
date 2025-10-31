import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Copy, Clock, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Confirmation() {
  const [, params] = useRoute("/confirmation/:orderId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  const { data: orderData } = useQuery({
    queryKey: ['/api/orders', params?.orderId],
    enabled: !!params?.orderId,
    select: (data) => {
      // Parse JSON fields que vêm como string do MySQL
      return {
        ...data,
        items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
        toppings: typeof data.toppings === 'string' ? JSON.parse(data.toppings) : data.toppings,
      };
    },
  });

  useEffect(() => {
    if (orderData?.paymentMethod === "pix" && orderData?.status === "pending") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [orderData]);

  const handleCopyPixCode = () => {
    if (orderData?.pixCopyPaste) {
      navigator.clipboard.writeText(orderData.pixCopyPaste);
      toast({
        title: "Código copiado!",
        description: "Cole no seu app do banco para pagar.",
      });
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemsCount={0} onCartClick={() => {}} />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Pedido Realizado!</h1>
              <p className="text-lg text-muted-foreground">
                Número do pedido: <span className="font-semibold" data-testid="text-order-number">#{orderData.orderNumber || params?.orderId}</span>
              </p>
            </div>

            {orderData.paymentMethod === "pix" && orderData.pixQrCodeBase64 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Pagamento via PIX
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="bg-white p-4 rounded-lg shadow-md">
                        <img 
                          src={`data:image/png;base64,${orderData.pixQrCodeBase64}`}
                          alt="QR Code PIX"
                          className="w-64 h-64"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Escaneie o QR Code com seu app de banco</p>
                      <p className="text-xs text-muted-foreground">
                        Ou copie o código abaixo para pagar
                      </p>
                    </div>

                    {orderData.pixCopyPaste && (
                      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <code className="flex-1 text-xs break-all text-left">
                            {orderData.pixCopyPaste}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCopyPixCode}
                            className="flex-shrink-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {timeLeft > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center justify-center gap-2 text-orange-700">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Tempo restante: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {orderData.paymentMethod === "credit_card" && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Pagamento via Cartão de Crédito</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <p className="text-sm">
                      Seus dados de pagamento foram recebidos e estão sendo processados.
                      Você receberá uma confirmação em breve.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Itens:</h3>
                  <div className="space-y-2">
                    {orderData.items?.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-medium">R$ {(parseFloat(item.price) * item.quantity).toFixed(2).replace('.', ',')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total:</span>
                    <span className="font-bold text-2xl text-primary" data-testid="text-total">
                      R$ {parseFloat(orderData.totalAmount).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <p><strong>Entregar em:</strong> {orderData.deliveryAddress}, {orderData.deliveryCity} - {orderData.deliveryState}</p>
                  <p><strong>Telefone:</strong> {orderData.customerPhone}</p>
                  <p className="text-muted-foreground">Previsão de entrega: 30-45 minutos</p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Dúvidas? Entre em contato conosco!
              </p>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
                data-testid="button-whatsapp"
              >
                <Phone className="h-5 w-5" />
                WhatsApp
              </Button>
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setLocation("/")}
                  data-testid="button-home"
                >
                  Voltar ao início
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
