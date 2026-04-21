import { Layout } from "@/components/layout/Layout";
import { ArrowRight, ShoppingCart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { ItemDetailsModal } from "@/components/ItemDetailsModal";

const Shop = () => {
  const { addToCart, totalItems } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    fetch("/api/admin/products")
      .then(r => r.json())
      .then(data => {
        // Ajouter des descriptions par défaut si elles manquent
        const prods = (data.products || []).map((p: any) => ({
          ...p,
          description: p.description || "Un produit d'exception sélectionné par KDY Beauty pour sublimer votre routine quotidienne. Qualité garantie et résultats visibles dès les premières utilisations."
        }));
        setProducts(prods);
      });
    fetch("/api/auth/me").then(r => setIsAuthed(r.ok));
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation(); // Empêcher l'ouverture de la modal
    addToCart(product);
    toast({
      title: "Produit ajouté !",
      description: `${product.name} a été ajouté à votre panier.`,
    });
  };

  const handleOpenDetails = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-black to-background relative">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">
            KDY Beauty - Boutique
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos produits de Beauty d'exception sélectionnés pour vous
          </p>
        </div>

        {/* Floating Cart Badge */}
        <Link to="/cart" className="fixed bottom-8 right-8 z-50 bg-primary text-primary-foreground p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group">
          <ShoppingBag className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-full">
              {totalItems}
            </span>
          )}
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-semibold whitespace-nowrap">
            Voir mon panier
          </span>
        </Link>
      </section>

      {/* Products Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {products.map((product) => {
              const basePrice = Math.abs(product.price || 0);
              const discountPct = Math.min(Math.abs(product.discount || 0), 99); // cap discount at 99%
              const discountedPrice = product.discount
                ? Math.round(basePrice * (1 - discountPct / 100))
                : basePrice;

              return (
                <div
                  key={product.id}
                  onClick={() => handleOpenDetails(product)}
                  className="group bg-gradient-to-br from-card to-black border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 flex flex-col cursor-pointer"
                >
                  <div className="h-64 relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      crossOrigin="anonymous"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=400&auto=format&fit=crop";
                      }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        -{product.discount}%
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">Voir Détails</span>
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs text-primary uppercase font-semibold">
                        {product.category}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Star className="w-3 h-3 fill-secondary text-secondary" />
                        Avis
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3 mb-6">
                      <p className="text-secondary font-bold text-xl">
                        {discountedPrice.toLocaleString()} FCFA
                      </p>
                      {product.discount > 0 && (
                        <p className="text-muted-foreground line-through text-sm">
                          {Math.abs(product.price || 0).toLocaleString()} FCFA
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-full mt-auto bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 inline-flex items-center justify-center gap-2 active:scale-95"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Ajouter au Panier
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {!isAuthed && (
          <div className="text-center py-12">
            <h2 className="text-3xl font-serif font-bold mb-6">
              Découvrez plus de produits de luxe
            </h2>
            <p className="text-muted-foreground mb-6">
              Créez un compte pour voir les descriptions détaillées des produits et les collections exclusives
            </p>
            <Link to="/auth" className="btn-primary inline-flex items-center gap-2">
              Parcourir le Catalogue Complet
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          )}
        </div>
      </section>

      <ItemDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedProduct}
        type="product"
      />
    </Layout>
  );
};

export default Shop;
