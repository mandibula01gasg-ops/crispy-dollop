import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2, Star, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const reviewSchema = z.object({
  customerName: z.string().min(1, "Nome é obrigatório"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, "Comentário é obrigatório"),
  reviewDate: z.string().min(1, "Data é obrigatória"),
  photoUrl: z.string().optional(),
  status: z.enum(["draft", "published", "rejected"]).default("published"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  reviewDate: string;
  photoUrl?: string;
  status: string;
}

export function ReviewsManagement() {
  const [, setLocation] = useLocation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      status: "published",
      rating: 5,
    },
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const response = await fetch("/api/admin/reviews");
      if (response.status === 401) {
        setLocation("/admin/login");
        return;
      }
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: ReviewFormData) {
    try {
      const url = editingReview
        ? `/api/admin/reviews/${editingReview.id}`
        : "/api/admin/reviews";
      const method = editingReview ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar avaliação");
      }

      await fetchReviews();
      setIsDialogOpen(false);
      reset();
      setEditingReview(null);
    } catch (error) {
      console.error("Error saving review:", error);
      alert("Erro ao salvar avaliação");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja deletar esta avaliação?")) return;

    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar avaliação");
      }

      await fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Erro ao deletar avaliação");
    }
  }

  function handleEdit(review: Review) {
    setEditingReview(review);
    setImagePreview(review.photoUrl || "");
    reset({
      customerName: review.customerName,
      rating: review.rating,
      comment: review.comment,
      reviewDate: review.reviewDate,
      photoUrl: review.photoUrl || "",
      status: review.status as any,
    });
    setIsDialogOpen(true);
  }

  function handleNewReview() {
    setEditingReview(null);
    setImagePreview("");
    reset({
      customerName: "",
      rating: 5,
      comment: "",
      reviewDate: new Date().toLocaleDateString('pt-BR'),
      photoUrl: "",
      status: "published",
    });
    setIsDialogOpen(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/admin/upload-review-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload da imagem");
      }

      const data = await response.json();
      setValue("photoUrl", data.url);
      setImagePreview(data.url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setUploading(false);
    }
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
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

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
                <h1 className="text-3xl font-black bg-gradient-to-r from-purple-300 via-purple-200 to-blue-300 bg-clip-text text-transparent">⭐ Gerenciar Avaliações</h1>
                <p className="text-purple-300/70">Adicione e modere avaliações</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleNewReview}
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-900 font-bold shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Nova Avaliação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    {editingReview ? "Editar Avaliação" : "Nova Avaliação"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">Nome do Cliente *</Label>
                    <Input
                      id="customerName"
                      {...register("customerName")}
                      placeholder="João Silva"
                    />
                    {errors.customerName && (
                      <p className="text-sm text-red-500 mt-1">{errors.customerName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="rating">Avaliação (1-5 estrelas) *</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="1"
                      max="5"
                      {...register("rating", { valueAsNumber: true })}
                    />
                    {errors.rating && (
                      <p className="text-sm text-red-500 mt-1">{errors.rating.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="comment">Comentário *</Label>
                    <textarea
                      id="comment"
                      {...register("comment")}
                      className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                      placeholder="Açaí maravilhoso! Super recomendo."
                    />
                    {errors.comment && (
                      <p className="text-sm text-red-500 mt-1">{errors.comment.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="reviewDate">Data *</Label>
                    <Input
                      id="reviewDate"
                      {...register("reviewDate")}
                      placeholder="01/01/2025"
                    />
                    {errors.reviewDate && (
                      <p className="text-sm text-red-500 mt-1">{errors.reviewDate.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="photoUrl">Foto da Avaliação (opcional)</Label>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                      {uploading && (
                        <p className="text-sm text-blue-500">Fazendo upload...</p>
                      )}
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <Input
                        id="photoUrl"
                        {...register("photoUrl")}
                        placeholder="Ou cole a URL da imagem"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      {...register("status")}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="published">Publicado</option>
                      <option value="draft">Rascunho</option>
                      <option value="rejected">Rejeitado</option>
                    </select>
                  </div>

                  <div className="flex gap-2 justify-end mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        reset();
                        setEditingReview(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isSubmitting ? "Salvando..." : "Salvar Avaliação"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {reviews.length === 0 ? (
          <Card className="backdrop-blur-xl bg-white/5 border-white/10 shadow-xl">
            <CardContent className="p-12 text-center">
              <p className="text-gray-300 text-lg">Nenhuma avaliação cadastrada ainda.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <Card
                key={review.id}
                className="backdrop-blur-xl bg-white/5 border-white/10 shadow-xl hover:shadow-purple-500/20 transition-all"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-black bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">{review.customerName}</CardTitle>
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{review.reviewDate}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-4">{review.comment}</p>
                  {review.photoUrl && (
                    <img
                      src={review.photoUrl}
                      alt="Review"
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      review.status === 'published' ? 'bg-green-500/20 text-green-400' :
                      review.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {review.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(review)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold shadow-lg shadow-blue-500/30"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDelete(review.id)}
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
