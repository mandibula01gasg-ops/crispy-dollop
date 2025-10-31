import { useState } from "react";
import { Star, User, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  image: string;
  date: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Maria Silva",
    rating: 5,
    comment: "Melhor açaí da região! Cremoso, saboroso e com bastante complemento. Sempre peço e nunca decepciona. Super recomendo!",
    image: "/attached_assets/image2_1761825628149.png",
    date: "Há 2 dias"
  },
  {
    id: 2,
    name: "João Pedro",
    rating: 5,
    comment: "Açaí de qualidade premium! Chegou rapidinho e bem gelado. Os complementos são fresquinhos. Virei cliente fiel! 🍇",
    image: "/attached_assets/image_1761825628150.png",
    date: "Há 3 dias"
  },
  {
    id: 3,
    name: "Ana Carolina",
    rating: 4,
    comment: "Muito bom! Só achei que poderia vir um pouquinho mais cheio, mas o sabor é excelente e a entrega foi rápida.",
    image: "/attached_assets/image4_1761825628150.png",
    date: "Há 5 dias"
  },
  {
    id: 4,
    name: "Carlos Eduardo",
    rating: 5,
    comment: "Simplesmente perfeito! Cremoso na medida certa, não aguado. Banana fresquinha e granola crocante. Melhor impossível!",
    image: "/acai_bowl_purple_smo_1624d014.jpg",
    date: "Há 1 semana"
  },
  {
    id: 5,
    name: "Juliana Costa",
    rating: 5,
    comment: "Açaí maravilhoso! Peço toda semana. A qualidade é sempre a mesma, nunca vem aguado. Parabéns pelo capricho! 👏",
    image: "/acai_bowl_purple_smo_de62c0bf.jpg",
    date: "Há 1 semana"
  },
  {
    id: 6,
    name: "Roberto Santos",
    rating: 4,
    comment: "Muito bom mesmo! Sabor autêntico e bem gelado. Só demorou um pouco mais que o previsto na entrega, mas valeu a pena esperar.",
    image: "/acai_bowl_purple_smo_fffbbd86.jpg",
    date: "Há 2 semanas"
  }
];

export function Reviews() {
  const [showAll, setShowAll] = useState(false);
  const averageRating = (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
  const totalReviews = reviews.length;
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <section className="w-full py-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header da seção - mais compacto */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            ⭐ Avaliações dos Clientes
          </h2>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(parseFloat(averageRating))
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xl font-bold text-gray-900">{averageRating}</span>
          </div>
          <p className="text-gray-600 text-sm">Baseado em {totalReviews} avaliações</p>
        </div>

        {/* Grid de avaliações - compacto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {displayedReviews.map((review) => (
            <Card key={review.id} className="overflow-hidden hover:shadow-xl transition-shadow border-2 border-white/20 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-0">
                {/* Imagem do açaí - menor */}
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={review.image}
                    alt={`Açaí avaliado por ${review.name}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Conteúdo da avaliação - compacto */}
                <div className="p-3">
                  {/* Nome e estrelas */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-purple-100 p-1.5 rounded-full">
                        <User className="h-3 w-3 text-purple-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{review.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= review.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comentário - limitado */}
                  <p className="text-gray-700 text-xs leading-relaxed line-clamp-2">
                    {review.comment}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{review.date}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Botão Ver Mais */}
        {!showAll && reviews.length > 3 && (
          <div className="text-center mt-6">
            <Button
              onClick={() => setShowAll(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              Ver Mais Avaliações
              <ChevronDown className="h-4 w-4 animate-bounce" />
            </Button>
          </div>
        )}
        
        {/* Botão Ver Menos */}
        {showAll && (
          <div className="text-center mt-6">
            <Button
              onClick={() => setShowAll(false)}
              variant="outline"
              className="border-2 border-purple-400 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg font-bold transition-all duration-300 mx-auto"
            >
              Ver Menos
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
