import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, ShoppingCart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Topping } from "@shared/schema";

interface ToppingSelection {
  id: string;
  name: string;
  price: string;
  quantity: number;
  category: string;
}

const LIMITS = {
  fruit: 2,
  topping: 1,
  extra: 4,
};

export default function Customize() {
  const [, setLocation] = useLocation();
  const [selections, setSelections] = useState<ToppingSelection[]>([]);

  const { data: toppings = [] } = useQuery<Topping[]>({
    queryKey: ['/api/toppings'],
  });

  const fruits = toppings.filter((t) => t.category === "fruit");
  const toppingsList = toppings.filter((t) => t.category === "topping");
  const extras = toppings.filter((t) => t.category === "extra");

  const getCategoryCount = (category: string) => {
    return selections
      .filter((s) => s.category === category)
      .reduce((sum, s) => sum + s.quantity, 0);
  };

  const canAddMore = (category: string) => {
    return getCategoryCount(category) < LIMITS[category as keyof typeof LIMITS];
  };

  const handleSelect = (topping: Topping) => {
    setSelections((prev) => {
      const existing = prev.find((s) => s.id === topping.id);
      
      // Se já existe, remove
      if (existing) {
        return prev.filter((s) => s.id !== topping.id);
      }
      
      // Verifica se pode adicionar mais dessa categoria
      if (!canAddMore(topping.category)) {
        return prev;
      }
      
      // Adiciona novo
      return [...prev, {
        id: topping.id,
        name: topping.name,
        price: topping.price,
        quantity: 1,
        category: topping.category,
      }];
    });
  };

  const isSelected = (toppingId: string) => {
    return selections.some((s) => s.id === toppingId);
  };

  const handleContinue = () => {
    localStorage.setItem("toppings", JSON.stringify(selections));
    setLocation("/checkout");
  };

  const handleBack = () => {
    setLocation("/");
  };

  const getCategoryLabel = (category: string) => {
    if (category === 'fruit') return 'frutas';
    if (category === 'topping') return 'cobertura';
    return 'complementos';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </Button>
            <h1 className="text-xl font-bold text-purple-700">
              Personalize seu Açaí
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Alerta informativo */}
        <Alert className="mb-6 bg-purple-50 border-purple-200">
          <AlertCircle className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            Todos os complementos são <strong>GRÁTIS</strong>! Escolha até 2 frutas, 1 cobertura e 4 complementos.
          </AlertDescription>
        </Alert>

        {/* Frutas */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍓</span>
              <h2 className="text-2xl font-bold text-gray-800">Frutas</h2>
            </div>
            <Badge variant={getCategoryCount('fruit') >= LIMITS.fruit ? "destructive" : "secondary"}>
              {getCategoryCount('fruit')}/{LIMITS.fruit}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {fruits.map((fruit) => (
              <Card 
                key={fruit.id} 
                className={`p-4 cursor-pointer transition-all ${
                  isSelected(fruit.id) 
                    ? 'ring-2 ring-purple-600 bg-purple-50' 
                    : 'hover:shadow-lg hover:border-purple-300'
                } ${!canAddMore('fruit') && !isSelected(fruit.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleSelect(fruit)}
              >
                <div className="text-center">
                  <h3 className="font-semibold text-gray-800">{fruit.name}</h3>
                  {isSelected(fruit.id) && (
                    <Badge className="mt-2 bg-purple-600">Selecionado</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Coberturas */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍫</span>
              <h2 className="text-2xl font-bold text-gray-800">Coberturas</h2>
            </div>
            <Badge variant={getCategoryCount('topping') >= LIMITS.topping ? "destructive" : "secondary"}>
              {getCategoryCount('topping')}/{LIMITS.topping}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {toppingsList.map((topping) => (
              <Card 
                key={topping.id} 
                className={`p-4 cursor-pointer transition-all ${
                  isSelected(topping.id) 
                    ? 'ring-2 ring-purple-600 bg-purple-50' 
                    : 'hover:shadow-lg hover:border-purple-300'
                } ${!canAddMore('topping') && !isSelected(topping.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleSelect(topping)}
              >
                <div className="text-center">
                  <h3 className="font-semibold text-gray-800">{topping.name}</h3>
                  {isSelected(topping.id) && (
                    <Badge className="mt-2 bg-purple-600">Selecionado</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Extras */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <h2 className="text-2xl font-bold text-gray-800">Complementos</h2>
            </div>
            <Badge variant={getCategoryCount('extra') >= LIMITS.extra ? "destructive" : "secondary"}>
              {getCategoryCount('extra')}/{LIMITS.extra}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {extras.map((extra) => (
              <Card 
                key={extra.id} 
                className={`p-4 cursor-pointer transition-all ${
                  isSelected(extra.id) 
                    ? 'ring-2 ring-purple-600 bg-purple-50' 
                    : 'hover:shadow-lg hover:border-purple-300'
                } ${!canAddMore('extra') && !isSelected(extra.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleSelect(extra)}
              >
                <div className="text-center">
                  <h3 className="font-semibold text-gray-800">{extra.name}</h3>
                  {isSelected(extra.id) && (
                    <Badge className="mt-2 bg-purple-600">Selecionado</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          {selections.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">Selecionados:</p>
              <div className="flex flex-wrap gap-2">
                {selections.map((item) => (
                  <Badge key={item.id} variant="secondary" className="px-3 py-1">
                    {item.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white flex items-center justify-center gap-2"
            onClick={handleContinue}
          >
            <ShoppingCart className="h-5 w-5" />
            {selections.length > 0 
              ? `Continuar com ${selections.length} ${selections.length === 1 ? 'complemento' : 'complementos'}`
              : 'Pular personalização'}
          </Button>
        </div>
      </div>

      {/* Espaçamento para footer fixo */}
      <div className="h-40" />
    </div>
  );
}
