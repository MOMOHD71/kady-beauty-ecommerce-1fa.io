import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/hooks/use-cart";
import { Trash2, ShoppingBag, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const { cart, removeFromCart, totalPrice, totalItems, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, total: totalPrice }),
      });

      if (resp.ok) {
        const data = await resp.json();
        clearCart();
        navigate(`/checkout-validation?orderId=${data.order.id}`);
      } else {
        const data = await resp.json();
        if (data.error === "non connecté") {
          toast({ title: "Connexion requise", description: "Veuillez vous connecter pour commander.", variant: "destructive" });
          navigate("/auth");
        }
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de valider la commande.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="py-20 bg-gradient-to-br from-background via-black to-background min-h-screen">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold mb-8">Mon Panier</h1>

          {cart.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-xl">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-xl text-muted-foreground mb-8">Votre panier est vide</p>
              <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
                Aller à la boutique
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 bg-card border border-border p-4 rounded-xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      crossOrigin="anonymous"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=400&auto=format&fit=crop";
                      }}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-primary font-bold">{Math.abs(item.price || 0).toLocaleString()} FCFA</p>
                      <p className="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border p-6 rounded-xl h-fit">
                <h2 className="text-xl font-bold mb-6">Résumé de la commande</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Articles ({totalItems})</span>
                    <span>{Math.abs(totalPrice).toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Livraison</span>
                    <span>Gratuite</span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span className="text-secondary">{Math.abs(totalPrice).toLocaleString()} FCFA</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {loading ? "Traitement..." : "Confirmer ma Commande"}
                </button>
                <p className="text-[10px] text-center text-muted-foreground mt-4 italic">
                  Paiement sécurisé et livraison rapide à Abidjan
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Cart;
