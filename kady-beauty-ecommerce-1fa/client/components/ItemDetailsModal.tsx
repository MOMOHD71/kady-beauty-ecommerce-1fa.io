import { useState, useEffect } from "react";
import { X, Star, Send, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string | number;
    name?: string;
    title?: string;
    description: string;
    price: string | number;
    image?: string;
    category?: string;
  } | null;
  type: 'product' | 'service';
}

export function ItemDetailsModal({ isOpen, onClose, item, type }: ItemDetailsModalProps) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      fetch(`/api/reviews/${item.id}`)
        .then(r => r.json())
        .then(data => setReviews(data.reviews || []));
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const itemName = item.name || item.title;

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id.toString(),
          rating: newRating,
          comment: newComment
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setReviews([data.review, ...reviews]);
        setNewComment("");
        toast({ title: "Merci !", description: "Votre avis a été publié." });
      } else {
        const data = await response.json();
        if (data.error === "non connecté") {
          toast({ title: "Connexion requise", description: "Veuillez vous connecter pour laisser un avis.", variant: "destructive" });
        }
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de publier l'avis.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-primary transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center min-h-[300px]">
          {item.image ? (
            <img 
              src={item.image} 
              alt={itemName} 
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="text-primary opacity-20 text-6xl font-serif font-bold">KDY</div>
          )}
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">
              {item.category || type}
            </span>
            <h2 className="text-3xl font-serif font-bold mb-4">{itemName}</h2>
            <p className="text-2xl font-bold text-secondary mb-4">
              {typeof item.price === 'number' ? `${item.price.toLocaleString()} FCFA` : item.price}
            </p>
            <div className="p-4 bg-muted/30 rounded-xl border border-border mb-6">
              <h3 className="text-sm font-semibold mb-2 uppercase text-muted-foreground tracking-tighter">Description</h3>
              <p className="text-muted-foreground leading-relaxed italic">
                {item.description}
              </p>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="flex-grow">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-secondary fill-secondary" />
              Avis et Commentaires
            </h3>

            {/* Post Review Form */}
            <form onSubmit={handlePostReview} className="mb-8 space-y-4">
              <div className="flex gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className={`transition-all ${newRating >= star ? "text-secondary fill-secondary" : "text-muted-foreground"}`}
                  >
                    <Star className="w-5 h-5" />
                  </button>
                ))}
              </div>
              <div className="relative">
                <textarea
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Partagez votre expérience..."
                  className="w-full bg-black/50 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all resize-none min-h-[80px]"
                />
                <button
                  disabled={loading}
                  type="submit"
                  className="absolute bottom-3 right-3 bg-primary text-white p-2 rounded-lg hover:bg-primary/80 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed border-border rounded-lg">
                  Soyez le premier à laisser un avis !
                </p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="bg-muted/20 border border-border p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{rev.user}</p>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < rev.rating ? "text-secondary fill-secondary" : "text-muted-foreground/30"}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(rev.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{rev.comment}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
