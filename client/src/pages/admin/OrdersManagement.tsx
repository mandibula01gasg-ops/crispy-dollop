import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  items: any;
  toppings: any;
  totalAmount: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

export function OrdersManagement() {
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const response = await fetch("/api/admin/orders");
      if (response.status === 401) {
        setLocation("/admin/login");
        return;
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="text-purple-300 text-xl font-bold">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative backdrop-blur-xl bg-gradient-to-r from-purple-900/40 via-purple-800/40 to-blue-900/40 border-b border-white/5 shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setLocation("/admin")}
              className="bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-purple-300 via-purple-200 to-blue-300 bg-clip-text text-transparent">🛒 Pedidos</h1>
              <p className="text-purple-300/70">Visualize todos os pedidos realizados</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {orders.length === 0 ? (
          <Card className="backdrop-blur-xl bg-white/5 border-white/10 shadow-xl">
            <CardContent className="p-12 text-center">
              <p className="text-gray-300 text-lg">Nenhum pedido registrado ainda.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="backdrop-blur-xl bg-white/5 border-white/10 shadow-xl hover:shadow-purple-500/20 transition-all"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-black bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">{order.customerName}</CardTitle>
                      <p className="text-gray-400 text-sm mt-1">{order.customerPhone}</p>
                      {order.customerEmail && (
                        <p className="text-gray-400 text-sm">{order.customerEmail}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`${getStatusColor(order.paymentStatus)} text-white px-3 py-1 rounded-full text-xs font-bold mb-2`}>
                        {order.paymentStatus.toUpperCase()}
                      </div>
                      <p className="text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400 font-semibold">Endereço:</p>
                      <p className="text-sm text-gray-300">{order.deliveryAddress}</p>
                      <p className="text-sm text-gray-300">{order.deliveryCity} - {order.deliveryState}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-semibold">Pagamento:</p>
                      <p className="text-sm text-gray-300">{order.paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}</p>
                      <p className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        R$ {parseFloat(order.totalAmount).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedOrder(order)}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold shadow-lg shadow-blue-500/30"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Cliente</h3>
                <p><strong>Nome:</strong> {selectedOrder.customerName}</p>
                <p><strong>Telefone:</strong> {selectedOrder.customerPhone}</p>
                {selectedOrder.customerEmail && (
                  <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Endereço de Entrega</h3>
                <p>{selectedOrder.deliveryAddress}</p>
                <p>{selectedOrder.deliveryCity} - {selectedOrder.deliveryState}</p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Itens do Pedido</h3>
                <div className="space-y-2">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>{item.name} ({item.quantity}x)</span>
                      <span>R$ {parseFloat(item.price).toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>
              </div>
              {selectedOrder.toppings && Array.isArray(selectedOrder.toppings) && selectedOrder.toppings.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-2">Complementos</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.toppings.map((topping: any, index: number) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {topping.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-purple-600">
                    R$ {parseFloat(selectedOrder.totalAmount).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
