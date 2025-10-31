import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export interface CartItem {
  productId: string;
  name: string;
  price: string;
  quantity: number;
  image: string;
  size: string;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  const total = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        data-testid="overlay-cart"
      />
      
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-gradient-to-br from-white to-purple-50 border-l-4 border-purple-300 z-50 shadow-2xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b-2 border-purple-200 bg-gradient-to-r from-purple-100 to-purple-50">
            <h2 className="text-xl font-black text-purple-900">🛒 Meu Carrinho</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-cart"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Carrinho vazio</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Adicione produtos deliciosos ao seu carrinho!
              </p>
              <Button onClick={onClose} data-testid="button-browse">
                Ver Produtos
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-3"
                      data-testid={`cart-item-${item.productId}`}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-2xl shadow-lg ring-2 ring-purple-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.size}</p>
                        <p className="text-sm font-semibold text-primary">
                          R$ {parseFloat(item.price).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onRemoveItem(item.productId)}
                          data-testid={`button-remove-${item.productId}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1 bg-muted rounded-full">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                            data-testid={`button-decrease-${item.productId}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium" data-testid={`text-quantity-${item.productId}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                            data-testid={`button-increase-${item.productId}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary" data-testid="text-cart-total">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <Button
                  size="lg"
                  className="w-full rounded-full text-lg font-semibold"
                  onClick={onCheckout}
                  data-testid="button-checkout"
                >
                  Finalizar Pedido
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
