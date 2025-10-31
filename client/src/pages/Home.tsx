import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { PromoBanner } from "@/components/PromoBanner";
import { PromoTimer } from "@/components/PromoTimer";
import { ProductCard } from "@/components/ProductCard";
import { Cart, type CartItem } from "@/components/Cart";
import { Reviews } from "@/components/Reviews";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [userCity, setUserCity] = useState<string>("sua cidade");

  useEffect(() => {
    try {
      const savedLocation = localStorage.getItem("userLocation");
      if (savedLocation) {
        const location = JSON.parse(savedLocation);
        if (location && location.city) {
          setUserCity(location.city);
        } else {
          setUserCity("sua cidade");
        }
      } else {
        setUserCity("sua cidade");
      }
    } catch (error) {
      console.error("Erro ao ler localização:", error);
      setUserCity("sua cidade");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Separar produtos individuais dos combos
  const individualProducts = products?.filter(p => !p.name.toLowerCase().includes('combo')) || [];
  const comboProducts = products?.filter(p => p.name.toLowerCase().includes('combo')) || [];

  // Preços originais fictícios para mostrar desconto nos combos
  const comboDiscounts: { [key: string]: number } = {
    'Combo Duo': 41.90,
    'Combo Chocolate': 34.90,
    'Combo Power Fit': 42.90,
    'Combo Família': 77.90,
    'Combo Supreme': 49.90,
    'Combo Kids': 16.90,
    'Combo Refrescante': 37.90,
  };

  const getOriginalPrice = (productName: string): number | undefined => {
    const comboKey = Object.keys(comboDiscounts).find(key => productName.includes(key));
    return comboKey ? comboDiscounts[comboKey] : undefined;
  };

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
          size: product.size,
        },
      ];
    });

    toast({
      title: "✅ Adicionado!",
      description: `${product.name} está no carrinho. Escolha seus complementos!`,
    });

    // Redireciona para a página de customização após adicionar ao carrinho
    setTimeout(() => {
      setLocation("/customize");
    }, 500);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
    toast({
      title: "Item removido",
      description: "O item foi removido do carrinho.",
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setLocation("/customize");
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-white">
      {/* Padrão de frutas decorativo suave */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-10 left-5 text-6xl animate-float">🍇</div>
        <div className="absolute top-32 right-10 text-5xl animate-float-delayed">🍓</div>
        <div className="absolute top-60 left-12 text-4xl animate-float">🫐</div>
        <div className="absolute top-96 right-5 text-5xl animate-float-delayed">🍌</div>
        <div className="absolute bottom-40 left-8 text-6xl animate-float">🍇</div>
        <div className="absolute bottom-20 right-14 text-4xl animate-float-delayed">🥥</div>
        <div className="absolute top-80 left-1/3 text-5xl animate-float">🍇</div>
        <div className="absolute bottom-60 right-1/4 text-4xl animate-float-delayed">🍓</div>
      </div>
      
      <Header cartItemsCount={cartItemsCount} onCartClick={() => setCartOpen(true)} />
      
      <PromoBanner text={`Entrega Grátis para ${userCity}!`} />
      
      <main className="flex-1 relative z-10">
        <section id="products" className="py-4">
          <div className="container mx-auto px-3">
            <div className="max-w-4xl mx-auto">
              {/* Seção de Combos com Promoção */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-0 flex items-center gap-2">
                    🔥 Combos Especiais
                  </h2>
                  <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full font-bold animate-pulse shadow-lg">
                    ECONOMIZE
                  </span>
                </div>
                
                {/* Timer de Promoção */}
                <div className="mb-4">
                  <PromoTimer />
                </div>
                
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {comboProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        hasPromo={false}
                        buttonText="COMPRAR AGORA"
                        isPriority={index < 3}
                        discountedFrom={getOriginalPrice(product.name)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Seção de Açaís Individuais */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-0 flex items-center gap-2">
                    🥤 Açaís Individuais
                  </h2>
                </div>
                
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {individualProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        hasPromo={false}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* Seção de Avaliações */}
        <Reviews />
      </main>

      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />
      
      <style>{`
        @keyframes gradient-bg {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          50% { transform: translateY(-40px) rotate(-5deg); }
          75% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-30px) rotate(-5deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
          75% { transform: translateY(-25px) rotate(-3deg); }
        }
        .animate-gradient-bg {
          background-size: 200% 200%;
          animation: gradient-bg 15s ease infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
