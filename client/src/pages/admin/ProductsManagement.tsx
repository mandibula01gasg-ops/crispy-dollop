import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2, Upload, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  price: z.string().min(1, "Preço é obrigatório"),
  size: z.string().min(1, "Tamanho é obrigatório"),
  image: z.string().min(1, "Imagem é obrigatória"),
  isActive: z.boolean().default(true),
  stock: z.number().default(999),
  promoBadge: z.string().optional(),
  highlightOrder: z.number().default(0),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  size: string;
  image: string;
  isActive: boolean;
  stock: number;
  promoBadge?: string;
  promoEndAt?: Date;
  highlightOrder: number;
}

export function ProductsManagement() {
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isActive: true,
      stock: 999,
      highlightOrder: 0,
    },
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const imageValue = watch("image");

  useEffect(() => {
    if (imageValue) {
      setImagePreview(imageValue);
    }
  }, [imageValue]);

  async function fetchProducts() {
    try {
      const response = await fetch("/api/admin/products");
      if (response.status === 401) {
        setLocation("/admin/login");
        return;
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload da imagem");
      }

      const { imagePath } = await response.json();
      setValue("image", imagePath);
      setImagePreview(imagePath);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: ProductFormData) {
    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar produto");
      }

      await fetchProducts();
      setIsDialogOpen(false);
      reset();
      setEditingProduct(null);
      setImagePreview("");
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Erro ao salvar produto");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar produto");
      }

      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Erro ao deletar produto");
    }
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      size: product.size,
      image: product.image,
      isActive: product.isActive,
      stock: product.stock,
      promoBadge: product.promoBadge || "",
      highlightOrder: product.highlightOrder,
    });
    setImagePreview(product.image);
    setIsDialogOpen(true);
  }

  function handleNewProduct() {
    setEditingProduct(null);
    reset({
      name: "",
      description: "",
      price: "",
      size: "",
      image: "",
      isActive: true,
      stock: 999,
      promoBadge: "",
      highlightOrder: 0,
    });
    setImagePreview("");
    setIsDialogOpen(true);
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
              <Button
                onClick={() => setLocation("/admin")}
                className="bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-purple-300 via-purple-200 to-blue-300 bg-clip-text text-transparent">🍇 Gerenciar Produtos</h1>
                <p className="text-purple-300/70">Adicione, edite e remova produtos</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleNewProduct}
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-900 font-bold shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    {editingProduct ? "Editar Produto" : "Novo Produto"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="name">Nome do Produto *</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="Ex: Açaí 300ml"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="description">Descrição *</Label>
                      <Input
                        id="description"
                        {...register("description")}
                        placeholder="Descrição do produto"
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="price">Preço (R$) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        {...register("price")}
                        placeholder="12.90"
                      />
                      {errors.price && (
                        <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="size">Tamanho *</Label>
                      <Input
                        id="size"
                        {...register("size")}
                        placeholder="300ml, 500ml, Combo"
                      />
                      {errors.size && (
                        <p className="text-sm text-red-500 mt-1">{errors.size.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="stock">Estoque</Label>
                      <Input
                        id="stock"
                        type="number"
                        {...register("stock", { valueAsNumber: true })}
                        placeholder="999"
                      />
                    </div>

                    <div>
                      <Label htmlFor="highlightOrder">Ordem de Destaque</Label>
                      <Input
                        id="highlightOrder"
                        type="number"
                        {...register("highlightOrder", { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="promoBadge">Badge de Promoção (opcional)</Label>
                      <Input
                        id="promoBadge"
                        {...register("promoBadge")}
                        placeholder="OFERTA! 30% OFF"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="image">Imagem do Produto *</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            id="image"
                            {...register("image")}
                            placeholder="/attached_assets/products/..."
                            readOnly
                          />
                          <Button
                            type="button"
                            onClick={() => document.getElementById("file-upload")?.click()}
                            disabled={uploading}
                            className="shrink-0"
                          >
                            {uploading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            <span className="ml-2">Upload</span>
                          </Button>
                        </div>
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        {imagePreview && (
                          <div className="mt-2">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg border-2 border-purple-200"
                            />
                          </div>
                        )}
                        {errors.image && (
                          <p className="text-sm text-red-500">{errors.image.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center gap-2">
                      <Switch
                        id="isActive"
                        checked={watch("isActive")}
                        onCheckedChange={(checked) => setValue("isActive", checked)}
                      />
                      <Label htmlFor="isActive">Produto Ativo</Label>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        reset();
                        setEditingProduct(null);
                        setImagePreview("");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isSubmitting ? "Salvando..." : "Salvar Produto"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {products.length === 0 ? (
          <Card className="backdrop-blur-xl bg-white/5 border-white/10 shadow-xl">
            <CardContent className="p-12 text-center">
              <p className="text-gray-300 text-lg">Nenhum produto cadastrado ainda.</p>
              <p className="text-gray-500 mt-2">Clique em "Novo Produto" para começar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="backdrop-blur-xl bg-white/5 border-white/10 shadow-xl hover:shadow-purple-500/20 transition-all overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.promoBadge && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {product.promoBadge}
                    </div>
                  )}
                  {!product.isActive && (
                    <div className="absolute top-2 left-2 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      INATIVO
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-xl font-black bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">{product.name}</CardTitle>
                  <p className="text-gray-400 text-sm">{product.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Preço:</span>
                      <span className="font-bold text-lg bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Tamanho:</span>
                      <span className="font-semibold text-gray-300">{product.size}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Estoque:</span>
                      <span className="font-semibold text-gray-300">{product.stock}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold shadow-lg shadow-blue-500/30"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold shadow-lg shadow-red-500/30"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
