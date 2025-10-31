import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Shield, Leaf } from "lucide-react";
import heroImage from "@assets/generated_images/Açaí_bowl_hero_image_f6c72a05.png";

interface HeroProps {
  onOrderClick: () => void;
}

export function Hero({ onOrderClick }: HeroProps) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10" />
      <img
        src={heroImage}
        alt="Delicious açaí bowl"
        className="w-full h-[500px] md:h-[600px] object-cover"
      />
      
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Açaí Natural <br />
              <span className="text-accent">Sabor Autêntico</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Delicie-se com nossos açaís frescos e naturais. <br />
              Entrega rápida direto na sua casa!
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <Button
                size="lg"
                variant="default"
                onClick={onOrderClick}
                className="rounded-full px-8 py-6 text-lg font-semibold shadow-xl hover:scale-105 transition-transform"
                data-testid="button-order-now"
              >
                Fazer Pedido
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full px-8 py-6 text-lg font-semibold bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                data-testid="button-see-menu"
              >
                Ver Cardápio
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 text-white">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                <span className="text-sm font-medium">Entrega Rápida</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Pagamento Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                <span className="text-sm font-medium">100% Natural</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
