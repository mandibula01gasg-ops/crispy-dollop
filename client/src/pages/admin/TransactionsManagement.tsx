import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Transaction {
  id: string;
  orderId: string;
  paymentMethod: string;
  amount: string;
  status: string;
  mercadoPagoId?: string;
  cardLast4?: string;
  cardBrand?: string;
  capturedAt?: string;
  createdAt: string;
}

export function TransactionsManagement() {
  const [, setLocation] = useLocation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      const response = await fetch("/api/admin/transactions");
      if (response.status === 401) {
        setLocation("/admin/login");
        return;
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
      case "failed":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
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
              <h1 className="text-3xl font-black bg-gradient-to-r from-purple-300 via-purple-200 to-blue-300 bg-clip-text text-transparent">💳 Transações</h1>
              <p className="text-purple-300/70">Visualize todas as transações de pagamento</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {transactions.length === 0 ? (
          <Card className="backdrop-blur-xl bg-white/5 border-white/10 shadow-xl">
            <CardContent className="p-12 text-center">
              <p className="text-gray-300 text-lg">Nenhuma transação registrada ainda.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="backdrop-blur-xl bg-white/5 border-white/10 shadow-xl hover:shadow-purple-500/20 transition-all"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-black bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                        {transaction.paymentMethod === 'pix' ? '🟢 PIX' : '💳 Cartão de Crédito'}
                      </CardTitle>
                      <p className="text-sm text-gray-400 mt-1">
                        ID: {transaction.id.substring(0, 8)}...
                      </p>
                      {transaction.mercadoPagoId && (
                        <p className="text-sm text-gray-400">
                          Mercado Pago: {transaction.mercadoPagoId}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`${getStatusColor(transaction.status)} text-white px-3 py-1 rounded-full text-xs font-bold mb-2`}>
                        {transaction.status.toUpperCase()}
                      </div>
                      <p className="text-sm text-gray-400">
                        {new Date(transaction.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 font-semibold">Valor:</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        R$ {parseFloat(transaction.amount).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    {transaction.cardBrand && (
                      <div>
                        <p className="text-sm text-gray-400 font-semibold">Cartão:</p>
                        <p className="text-sm text-gray-300">
                          {transaction.cardBrand} **** {transaction.cardLast4}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-400 font-semibold">Pedido:</p>
                      <p className="text-sm font-mono text-gray-300">{transaction.orderId.substring(0, 12)}...</p>
                    </div>
                  </div>
                  {transaction.capturedAt && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-gray-400">
                        <strong className="text-gray-300">Capturado em:</strong> {new Date(transaction.capturedAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
