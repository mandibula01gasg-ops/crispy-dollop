import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Zap } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  hasPromo?: boolean;
  promoText?: string;
  buttonText?: string;
  isPriority?: boolean;
  discountedFrom?: number;
}

export function ProductCard({ product, onAddToCart, hasPromo = false, promoText = "APENAS HOJE 40%", buttonText, isPriority = false, discountedFrom }: ProductCardProps) {
  const currentPrice = parseFloat(product.price);
  const originalPrice = discountedFrom || currentPrice;
  const discountedPrice = hasPromo ? originalPrice * 0.6 : currentPrice;
  const discountPercent = discountedFrom 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : hasPromo ? 40 : 0;
  const rating = 4.8;
  
  return (
    <Card className={`group overflow-hidden rounded-xl transition-all duration-500 relative ${
      isPriority ? 'animate-priority-pulse' : ''
    } ${
      hasPromo 
        ? 'border-2 border-orange-400/50 bg-gradient-to-br from-white via-orange-50/30 to-yellow-50/20 shadow-lg hover:shadow-orange-500/30 hover:shadow-2xl hover:border-orange-500' 
        : 'border-2 border-purple-400/50 bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 shadow-lg hover:shadow-purple-500/30 hover:shadow-2xl hover:border-purple-500'
    }`} data-testid={`card-product-${product.id}`}>
      {/* Borda brilhante no hover */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
        hasPromo ? 'bg-gradient-to-r from-orange-400/20 to-yellow-400/20' : 'bg-gradient-to-r from-purple-400/20 to-indigo-400/20'
      }`}></div>
      
      <CardContent className="p-0 relative z-10">
        <div className="flex gap-3 p-3">
          {/* Imagem compacta com borda elegante */}
          <div className="relative flex-shrink-0">
            <div className={`w-24 h-24 rounded-lg overflow-hidden relative ring-2 transition-all duration-300 ${
              hasPromo ? 'ring-orange-400/60 group-hover:ring-orange-500' : 'ring-purple-400/60 group-hover:ring-purple-500'
            }`}>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-2 transition-all duration-500"
              />
              {(hasPromo || discountPercent > 0) && (
                <div className="absolute top-1 left-1">
                  <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-2 py-0.5 rounded-full text-xs font-black shadow-lg animate-pulse-badge">
                    {discountPercent}% OFF
                  </div>
                </div>
              )}
              {/* Efeito de brilho sobre a imagem */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shine"></div>
            </div>
          </div>
          
          {/* Conteúdo */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            {/* Nome e avaliação */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1 line-clamp-2" data-testid={`text-product-name-${product.id}`}>
                {product.name}
              </h3>
              
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold text-gray-700">{rating}</span>
              </div>
            </div>
            
            {/* Preço e botão */}
            <div className="space-y-2">
              <div>
                {(hasPromo || discountPercent > 0) && (
                  <div className="text-xs text-gray-500 line-through font-semibold">
                    R$ {originalPrice.toFixed(2).replace('.', ',')}
                  </div>
                )}
                <div className={`text-xl font-black ${(hasPromo || discountPercent > 0) ? 'text-orange-600' : 'text-purple-700'}`} data-testid={`text-price-${product.id}`}>
                  R$ {discountedPrice.toFixed(2).replace('.', ',')}
                </div>
                {discountPercent > 0 && (
                  <div className="text-xs text-green-600 font-bold">
                    Economize R$ {(originalPrice - currentPrice).toFixed(2).replace('.', ',')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Botão de compra - largura total */}
        <div className="px-3 pb-3">
          <Button
            onClick={() => onAddToCart(product)}
            className={`w-full font-bold rounded-lg py-3 text-sm transition-all duration-300 ${
              hasPromo 
                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:from-purple-700 hover:via-fuchsia-700 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/60 hover:shadow-2xl animate-gradient-shift-intense hover:scale-105' 
                : 'bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:via-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-purple-500/50 hover:shadow-2xl animate-gradient-shift-purple hover:scale-105'
            }`}
            data-testid={`button-add-${product.id}`}
          >
            <span className="flex items-center justify-center gap-2">
              {buttonText === "COMPRAR AGORA" || hasPromo ? (
                <>
                  <Zap className="h-4 w-4 animate-bounce" />
                  <span className="animate-pulse-text">COMPRAR AGORA</span>
                  <Zap className="h-4 w-4 animate-bounce" />
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 animate-pulse-icon" />
                  <span className="animate-pulse-text-soft">{buttonText || "Adicionar ao Carrinho"}</span>
                </>
              )}
            </span>
          </Button>
        </div>
      </CardContent>
      
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gradient-shift-purple {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gradient-shift-intense {
          0% { 
            background-position: 0% 50%;
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
          }
          50% { 
            background-position: 100% 50%;
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.8);
          }
          100% { 
            background-position: 0% 50%;
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
          }
        }
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
          }
          50% { 
            box-shadow: 0 0 20px rgba(220, 38, 38, 0.8), 0 0 30px rgba(220, 38, 38, 0.4);
          }
        }
        @keyframes button-glow {
          0%, 100% { 
            box-shadow: 0 4px 10px rgba(147, 51, 234, 0.3);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 6px 20px rgba(147, 51, 234, 0.5), 0 0 30px rgba(147, 51, 234, 0.3);
            transform: scale(1.02);
          }
        }
        @keyframes button-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-1px); }
          20%, 40%, 60%, 80% { transform: translateX(1px); }
        }
        @keyframes pulse-text {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
        @keyframes pulse-text-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        @keyframes pulse-icon {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        .animate-gradient-shift-purple {
          background-size: 200% 200%;
          animation: gradient-shift-purple 4s ease infinite;
        }
        .animate-gradient-shift-intense {
          background-size: 200% 200%;
          animation: gradient-shift-intense 2s ease infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 1.5s ease-in-out infinite;
        }
        .animate-button-glow {
          animation: button-glow 2s ease-in-out infinite;
        }
        .animate-button-shake:hover {
          animation: button-shake 0.5s ease-in-out;
        }
        .animate-pulse-text {
          animation: pulse-text 1.5s ease-in-out infinite;
        }
        .animate-pulse-text-soft {
          animation: pulse-text-soft 2s ease-in-out infinite;
        }
        .animate-pulse-icon {
          animation: pulse-icon 1.5s ease-in-out infinite;
        }
        @keyframes priority-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 0 8px 30px rgba(147, 51, 234, 0.6), 0 0 40px rgba(234, 179, 8, 0.4);
          }
        }
        .animate-priority-pulse {
          animation: priority-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </Card>
  );
}
