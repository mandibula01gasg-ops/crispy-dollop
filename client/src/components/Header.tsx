import { ShoppingCart, Instagram, Info, MapPin, Star, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

export function Header({ cartItemsCount, onCartClick }: HeaderProps) {
  // Função segura para obter localização do localStorage
  const getUserLocation = () => {
    try {
      const saved = localStorage.getItem("userLocation");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Verificar se os campos necessários existem
        if (parsed && parsed.city && parsed.regionName) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Erro ao ler localização do localStorage:", error);
    }
    // Retornar valores padrão se falhar
    return { city: "Sua Cidade", regionName: "Estado" };
  };
  
  const userLocation = getUserLocation();

  return (
    <>
      {/* Header decorativo com padrão repetido de açaí */}
      <div className="w-full h-16 md:h-20 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 overflow-hidden relative shadow-lg">
        <div className="absolute inset-0 flex items-center gap-8 animate-scroll">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="text-4xl md:text-5xl shrink-0 drop-shadow-lg">🍇</span>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      </div>

      {/* Header principal */}
      <header className="w-full bg-gradient-to-br from-purple-50 to-purple-100 shadow-xl">
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
          {/* Seção superior: Logo centralizada e carrinho */}
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="flex-1" />
            
            {/* Logo e nome centralizados */}
            <div className="flex flex-col items-center gap-2 md:gap-3">
              <div className="relative">
                <img 
                  src="/acai-prime-logo.png" 
                  alt="Açaí Prime Logo" 
                  className="w-16 h-16 md:w-24 md:h-24 rounded-full shadow-2xl ring-4 ring-purple-200 object-cover"
                />
              </div>
              
              <div className="text-center">
                <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-purple-900 mb-1">
                  Açaí Prime
                </h1>
                
                {/* Ícones sociais - escondidos em mobile muito pequeno */}
                <div className="hidden sm:flex items-center justify-center gap-3 mb-2">
                  <button className="bg-purple-100 p-2 rounded-full hover:bg-purple-200 transition-colors">
                    <Instagram className="h-4 w-4 text-purple-700" />
                  </button>
                  <button className="bg-purple-100 p-2 rounded-full hover:bg-purple-200 transition-colors">
                    <Info className="h-4 w-4 text-purple-700" />
                  </button>
                </div>
              </div>
            </div>

            {/* Carrinho - posição fixa no mobile */}
            <div className="flex-1 flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={onCartClick}
                className="relative bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 rounded-2xl shadow-lg transform hover:scale-105 transition-all h-12 w-12 md:h-auto md:w-auto"
                data-testid="button-cart"
              >
                <ShoppingCart className="h-5 w-5 md:h-5 md:w-5 text-purple-700" />
                {cartItemsCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -right-1 -top-1 md:-right-2 md:-top-2 h-5 min-w-5 md:h-6 md:min-w-6 rounded-full px-1 md:px-1.5 text-xs bg-gradient-to-br from-red-500 to-red-600 border-2 border-white shadow-lg animate-bounce-gentle"
                    data-testid="badge-cart-count"
                  >
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Informações do estabelecimento - responsivo */}
          <div className="flex flex-col items-center gap-2 text-xs md:text-sm">
            {/* Linha 1: Pedido mínimo e Tempo de entrega */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-gray-600">
              <div className="flex items-center gap-1 md:gap-1.5">
                <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
                <span className="font-medium">Mín. R$ 15</span>
              </div>
              <span className="text-gray-300 hidden md:inline">•</span>
              <div className="flex items-center gap-1 md:gap-1.5">
                <Clock className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
                <span className="font-medium">30-50 min</span>
                <span className="text-green-600 font-semibold">• Grátis</span>
              </div>
            </div>

            {/* Linha 2: Localização */}
            <div className="flex items-center gap-1 md:gap-1.5 text-gray-600">
              <MapPin className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
              <span className="font-medium">{userLocation.city}</span>
              <span className="hidden sm:inline">- {userLocation.regionName}</span>
              <span className="text-gray-400 hidden md:inline">• 1.8km de você</span>
            </div>

            {/* Linha 3: Avaliação e Status ABERTO */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1 md:gap-1.5">
                <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-gray-700">4.8</span>
                <span className="text-gray-500 text-xs hidden sm:inline">(3.248)</span>
              </div>
              
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-300 font-bold px-2 py-0.5 md:px-3 md:py-1 text-xs">
                ABERTO
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
