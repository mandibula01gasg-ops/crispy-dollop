import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ShoppingCart, 
  CreditCard, 
  DollarSign, 
  Eye,
  TrendingUp,
  LogOut,
  Package,
  MessageSquare,
  FileText,
  Sparkles
} from "lucide-react";

interface Analytics {
  totalPageViews: number;
  totalOrders: number;
  totalPixGenerated: number;
  totalCardPayments: number;
  totalRevenue: number;
  conversionRate: string;
  ordersByStatus: Array<{ status: string; count: number }>;
  recentOrders: any[];
}

export function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const response = await fetch("/api/admin/analytics");
      if (response.status === 401) {
        setLocation("/admin/login");
        return;
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setLocation("/admin/login");
  }

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
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative backdrop-blur-xl bg-gradient-to-r from-purple-900/40 via-purple-800/40 to-blue-900/40 border-b border-white/5 shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-2xl shadow-lg shadow-purple-500/30">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-purple-300 via-purple-200 to-blue-300 bg-clip-text text-transparent">
                  Painel Administrativo
                </h1>
                <p className="text-purple-300/70">Açaí Prime - Gerenciamento Completo</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              className="bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="backdrop-blur-xl bg-white/5 border-white/10 shadow-xl hover:shadow-blue-500/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-gray-300">
                Visualizações de Página
              </CardTitle>
              <Eye className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {analytics?.totalPageViews || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total de acessos</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/5 border-white/10 shadow-xl hover:shadow-green-500/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-gray-300">
                Total de Pedidos
              </CardTitle>
              <ShoppingCart className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {analytics?.totalOrders || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Pedidos realizados</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/5 border-white/10 shadow-xl hover:shadow-purple-500/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-gray-300">
                Pagamentos PIX
              </CardTitle>
              <CreditCard className="h-5 w-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {analytics?.totalPixGenerated || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">QR Codes gerados</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/5 border-white/10 shadow-xl hover:shadow-yellow-500/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-gray-300">
                Receita Total
              </CardTitle>
              <DollarSign className="h-5 w-5 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                R$ {analytics?.totalRevenue?.toFixed(2).replace('.', ',') || '0,00'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Conversão: {analytics?.conversionRate || '0'}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Button
            onClick={() => setLocation("/admin/products")}
            className="h-24 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-lg font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all backdrop-blur-sm"
          >
            <Package className="mr-3 h-6 w-6" />
            Gerenciar Produtos
          </Button>

          <Button
            onClick={() => setLocation("/admin/orders")}
            className="h-24 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
          >
            <ShoppingCart className="mr-3 h-6 w-6" />
            Ver Pedidos
          </Button>

          <Button
            onClick={() => setLocation("/admin/reviews")}
            className="h-24 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-lg font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all"
          >
            <MessageSquare className="mr-3 h-6 w-6" />
            Gerenciar Reviews
          </Button>

          <Button
            onClick={() => setLocation("/admin/transactions")}
            className="h-24 bg-gradient-to-br from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white text-lg font-bold shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all"
          >
            <FileText className="mr-3 h-6 w-6" />
            Ver Transações
          </Button>
        </div>

        {/* Recent Orders */}
        <Card className="backdrop-blur-xl bg-white/5 border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-gray-200 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-purple-400" />
              Pedidos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!analytics?.recentOrders || analytics.recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum pedido ainda</p>
              ) : (
                analytics.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all"
                  >
                    <div>
                      <p className="font-bold text-gray-200">{order.customerName}</p>
                      <p className="text-sm text-gray-400">
                        {order.items?.length || 0} itens • {order.paymentMethod === 'pix' ? 'PIX' : 'Cartão'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-green-400">
                        R$ {parseFloat(order.totalAmount).toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
