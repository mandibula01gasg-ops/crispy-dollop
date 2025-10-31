import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  formatCPF, 
  formatPhone, 
  formatCEP, 
  formatCardNumber, 
  formatCardExpiry, 
  validateCPF 
} from "@/lib/validators";
import { ShoppingBag, Shield, CheckCircle2, Lock, CreditCard, QrCode } from "lucide-react";

const checkoutSchema = z.object({
  customerName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  customerPhone: z.string().min(14, "Telefone inválido"),
  customerEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  cpf: z.string().min(14, "CPF inválido").refine(validateCPF, { message: "CPF inválido" }),
  deliveryCep: z.string().min(9, "CEP inválido"),
  deliveryAddress: z.string().min(5, "Endereço inválido"),
  deliveryCity: z.string().min(2, "Cidade inválida"),
  deliveryState: z.string().length(2, "UF deve ter 2 caracteres").regex(/^[A-Z]{2}$/, "UF deve ter apenas letras maiúsculas"),
  deliveryComplement: z.string().optional(),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(600);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card" | null>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      cpf: "",
      deliveryCep: "",
      deliveryAddress: "",
      deliveryCity: "",
      deliveryState: "",
      deliveryComplement: "",
      cardNumber: "",
      cardName: "",
      cardExpiry: "",
      cardCvv: "",
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
  const toppings = JSON.parse(localStorage.getItem("toppings") || "[]");
  
  const cartTotal = cartItems.reduce(
    (sum: number, item: any) => sum + parseFloat(item.price) * item.quantity,
    0
  );
  
  const toppingsTotal = toppings.reduce(
    (sum: number, item: any) => sum + parseFloat(item.price) * item.quantity,
    0
  );
  
  const totalAmount = cartTotal + toppingsTotal;

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      if (!paymentMethod) {
        throw new Error("Selecione uma forma de pagamento");
      }

      const orderData: any = {
        customerName: data.customerName,
        customerPhone: data.customerPhone.replace(/\D/g, ''),
        customerEmail: data.customerEmail || undefined,
        customerDocument: data.cpf?.replace(/\D/g, '') || undefined,
        deliveryAddress: data.deliveryAddress,
        deliveryCep: data.deliveryCep.replace(/\D/g, ''),
        deliveryCity: data.deliveryCity,
        deliveryState: data.deliveryState.toUpperCase(),
        deliveryComplement: data.deliveryComplement || undefined,
        items: cartItems,
        toppings: toppings,
        totalAmount: totalAmount.toString(),
        paymentMethod,
        status: "pending",
      };

      if (paymentMethod === "credit_card") {
        (orderData as any).cardData = {
          cardNumber: data.cardNumber?.replace(/\D/g, ''),
          cardName: data.cardName,
          cardExpiry: data.cardExpiry,
          cardCvv: data.cardCvv,
        };
      }

      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.removeItem("cart");
      localStorage.removeItem("toppings");
      setLocation(`/confirmation/${data.orderId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao processar pedido",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    if (!paymentMethod) {
      toast({
        title: "Selecione uma forma de pagamento",
        description: "Escolha PIX ou Cartão de Crédito",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "credit_card") {
      if (!data.cardNumber || !data.cardName || !data.cardExpiry || !data.cardCvv) {
        toast({
          title: "Dados do cartão incompletos",
          description: "Preencha todos os dados do cartão",
          variant: "destructive",
        });
        return;
      }
    }
    createOrderMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-4 md:gap-8">
          {/* Coluna Esquerda - Resumo do Pedido */}
          <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-10 w-10 md:h-14 md:w-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 md:h-7 md:w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-gray-900">Açaí Prime</h2>
                  <p className="text-xs md:text-sm text-gray-600">{cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}</p>
                </div>
              </div>
            </div>

            <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-purple-100">
              <div className="space-y-3 md:space-y-4">
                {cartItems.map((item: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 md:gap-4 pb-3 md:pb-4 border-b border-gray-100">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">{item.name}</h3>
                      <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs md:text-sm text-gray-600">Qtd: {item.quantity}</span>
                        <span className="font-bold text-sm md:text-base text-purple-600">
                          R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Complementos */}
                {toppings.length > 0 && (
                  <div className="pt-3 border-t border-purple-100">
                    <h4 className="text-sm font-semibold text-purple-700 mb-2">✨ Complementos Inclusos (Grátis)</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {toppings.map((topping: any, index: number) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                          {topping.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 md:mt-6 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-base md:text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-purple-600">R$ {totalAmount.toFixed(2)}</span>
                </div>
                {toppings.length > 0 && (
                  <p className="text-xs text-center text-gray-500">
                    + {toppings.length} complemento{toppings.length > 1 ? 's' : ''} grátis incluído{toppings.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </Card>

            {/* Timer de Oferta */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-3 md:p-4 text-white text-center shadow-lg">
              <p className="text-xs md:text-sm font-medium mb-2">OFERTA TERMINA EM</p>
              <div className="flex items-center justify-center gap-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1 md:py-2 min-w-[50px] md:min-w-[60px]">
                  <span className="text-2xl md:text-3xl font-bold">{formatTime(timeLeft).split(':')[0]}</span>
                </div>
                <span className="text-xl md:text-2xl font-bold">:</span>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1 md:py-2 min-w-[50px] md:min-w-[60px]">
                  <span className="text-2xl md:text-3xl font-bold">{formatTime(timeLeft).split(':')[1]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Formulário */}
          <div className="order-1 lg:order-2">
            <Card className="p-4 md:p-8 bg-white/80 backdrop-blur-sm border-purple-100">
              {/* Steps - Escondidos em mobile muito pequeno */}
              <div className="hidden sm:flex items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center gap-1 md:gap-2">
                  <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full font-bold text-sm md:text-base ${
                    currentStep === 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    1
                  </div>
                  <span className="text-xs md:text-sm font-medium hidden md:inline">Dados pessoais</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full font-bold text-sm md:text-base ${
                    currentStep === 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </div>
                  <span className="text-xs md:text-sm font-medium hidden md:inline">Ambiente seguro</span>
                </div>
                <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full font-bold text-sm md:text-base ${
                  currentStep === 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                  {/* Dados Pessoais */}
                  <div className="space-y-3 md:space-y-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 text-sm md:text-base">Nome completo</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Digite seu nome completo" 
                              {...field}
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-10 md:h-auto text-sm md:text-base"
                              onFocus={() => setCurrentStep(1)}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 text-sm md:text-base">E-mail (opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="seu@email.com" 
                              {...field}
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-10 md:h-auto text-sm md:text-base"
                              onFocus={() => setCurrentStep(1)}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 text-sm md:text-base">DDD + número</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="(11) 99999-9999" 
                              {...field}
                              onChange={(e) => {
                                const formatted = formatPhone(e.target.value);
                                field.onChange(formatted);
                              }}
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-10 md:h-auto text-sm md:text-base"
                              onFocus={() => setCurrentStep(1)}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 text-sm md:text-base">
                            CPF
                            {field.value && validateCPF(field.value) && (
                              <span className="ml-2 text-green-600 text-xs md:text-sm">✓ CPF válido</span>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="000.000.000-00" 
                              {...field}
                              onChange={(e) => {
                                const formatted = formatCPF(e.target.value);
                                field.onChange(formatted);
                              }}
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-10 md:h-auto text-sm md:text-base"
                              onFocus={() => setCurrentStep(1)}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Endereço de Entrega */}
                  <div className="pt-3 md:pt-4 border-t border-gray-200 space-y-3 md:space-y-4">
                    <h3 className="font-semibold text-sm md:text-base text-gray-900 flex items-center gap-2">
                      <Shield className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                      Endereço de Entrega
                    </h3>

                    <FormField
                      control={form.control}
                      name="deliveryCep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 text-sm md:text-base">CEP</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="00000-000" 
                              {...field}
                              onChange={(e) => {
                                const formatted = formatCEP(e.target.value);
                                field.onChange(formatted);
                              }}
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-10 md:h-auto text-sm md:text-base"
                              onFocus={() => setCurrentStep(2)}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deliveryAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 text-sm md:text-base">Endereço completo</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Rua, número" 
                              {...field}
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-10 md:h-auto text-sm md:text-base"
                              onFocus={() => setCurrentStep(2)}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <FormField
                        control={form.control}
                        name="deliveryCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 text-sm md:text-base">Cidade</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="São Paulo" 
                                {...field}
                                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-10 md:h-auto text-sm md:text-base"
                                onFocus={() => setCurrentStep(2)}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliveryState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 text-sm md:text-base">UF</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="SP" 
                                maxLength={2}
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e.target.value.toUpperCase());
                                }}
                                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-10 md:h-auto text-sm md:text-base"
                                onFocus={() => setCurrentStep(2)}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="deliveryComplement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 text-sm md:text-base">Complemento (opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Apto, bloco, etc" 
                              {...field}
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-10 md:h-auto text-sm md:text-base"
                              onFocus={() => setCurrentStep(2)}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Forma de Pagamento */}
                  <div className="pt-3 md:pt-4 border-t border-gray-200 space-y-3 md:space-y-4">
                    <h3 className="font-semibold text-sm md:text-base text-gray-900">Forma de Pagamento</h3>
                    
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod("pix");
                          setCurrentStep(3);
                        }}
                        className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === "pix" 
                            ? "border-purple-500 bg-purple-50" 
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1 md:gap-2">
                          <QrCode className={`h-6 w-6 md:h-8 md:w-8 ${
                            paymentMethod === "pix" ? "text-purple-600" : "text-gray-600"
                          }`} />
                          <span className={`font-semibold text-xs md:text-sm ${
                            paymentMethod === "pix" ? "text-purple-600" : ""
                          }`}>PIX</span>
                          <span className="text-xs text-gray-500">Aprovação imediata</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod("credit_card");
                          setCurrentStep(3);
                        }}
                        className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === "credit_card"
                            ? "border-purple-600 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1 md:gap-2">
                          <CreditCard className={`h-6 w-6 md:h-8 md:w-8 ${paymentMethod === "credit_card" ? "text-purple-600" : "text-gray-600"}`} />
                          <span className="font-semibold text-xs md:text-sm">Cartão</span>
                          {paymentMethod === "credit_card" && (
                            <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                          )}
                        </div>
                      </button>
                    </div>

                    {/* Formulário de Cartão de Crédito */}
                    {paymentMethod === "credit_card" && (
                      <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 animate-in fade-in-50 duration-300">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 md:p-3 text-xs md:text-sm text-yellow-800">
                          ⚠️ 
                        </div>

                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm md:text-base">Número do Cartão</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="0000 0000 0000 0000" 
                                  {...field}
                                  onChange={(e) => {
                                    const formatted = formatCardNumber(e.target.value);
                                    field.onChange(formatted);
                                  }}
                                  maxLength={19}
                                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-10 md:h-auto text-sm md:text-base"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cardName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm md:text-base">Nome no Cartão</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Como está no cartão" 
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e.target.value.toUpperCase());
                                  }}
                                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-10 md:h-auto text-sm md:text-base"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                          <FormField
                            control={form.control}
                            name="cardExpiry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 text-sm md:text-base">Validade</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="MM/AA" 
                                    {...field}
                                    onChange={(e) => {
                                      const formatted = formatCardExpiry(e.target.value);
                                      field.onChange(formatted);
                                    }}
                                    maxLength={5}
                                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-10 md:h-auto text-sm md:text-base"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="cardCvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 text-sm md:text-base">CVV</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="123" 
                                    {...field}
                                    onChange={(e) => {
                                      const numbers = e.target.value.replace(/\D/g, '');
                                      field.onChange(numbers);
                                    }}
                                    maxLength={4}
                                    type="password"
                                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-10 md:h-auto text-sm md:text-base"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Informações de Segurança */}
                  <div className="bg-purple-50 rounded-lg p-3 md:p-4 space-y-2">
                    <div className="flex items-start gap-2 text-xs md:text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Usamos seus dados de forma segura para garantir a sua entrega</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs md:text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Enviar o seu comprovante de compra e pagamento</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs md:text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Validação de CPF para garantir segurança na entrega</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs md:text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Acompanhar o andamento do seu pedido</span>
                    </div>
                  </div>

                  {/* Botão de Finalizar */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-base md:text-lg py-5 md:py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={!paymentMethod || createOrderMutation.isPending}
                    onClick={() => setCurrentStep(3)}
                  >
                    {createOrderMutation.isPending ? (
                      "Processando..."
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Lock className="h-4 w-4 md:h-5 md:w-5" />
                        {paymentMethod === "pix" ? "Finalizar com PIX" : "Finalizar com Cartão"}
                      </span>
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-600">
                    🔒 Pagamento 100% seguro {paymentMethod === "pix" ? "via Mercado Pago" : "- Dados armazenados com segurança"}
                  </p>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
