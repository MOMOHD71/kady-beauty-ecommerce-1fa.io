import { Layout } from "@/components/layout/Layout";
import { Users, Package, ShoppingBag, LineChart, Plus, Trash2, Tag, MessageSquare, Calendar, Sparkles, Check, X, AlertCircle, Truck, MapPin, User, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<{ registeredUsers: number; onlineUsers: number; totalOrders: number; totalRevenue: number } | null>(null);
  const [messages, setMessages] = useState<Array<{ id: string; name: string; email: string; subject: string; message: string; date: string; reply?: string }>>([]);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [deliveryRates, setDeliveryRates] = useState<any>(null);
  const [siteSettings, setSiteSettings] = useState({ ownerTitle: "", ownerImage: "", siteLogo: "" });
  const [models, setModels] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"stats" | "products" | "services" | "bookings" | "messages" | "logistics" | "clients" | "settings" | "history" | "reviews">("stats");
  const [allReviews, setAllReviews] = useState<Record<string, any[]>>({});

  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "Soins Visage",
    discount: "0",
    image: "",
    imageBase64: ""
  });

  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    description: "",
    discount: "0",
    image: "",
    imageBase64: ""
  });

  const fetchData = async () => {
    try {
      const statsResp = await fetch("/api/admin/stats");
      if (statsResp.ok) setStats(await statsResp.json());

      const msgResp = await fetch("/api/admin/messages");
      if (msgResp.ok) {
        const msgData = await msgResp.json();
        setMessages(msgData.messages);
      }

      const prodResp = await fetch("/api/admin/products");
      if (prodResp.ok) {
        const prodData = await prodResp.json();
        setProducts(prodData.products);
      }

      const servResp = await fetch("/api/admin/services");
      if (servResp.ok) {
        const servData = await servResp.json();
        setServices(servData.services);
      }

      const bookResp = await fetch("/api/admin/bookings");
      if (bookResp.ok) {
        const bookData = await bookResp.json();
        setBookings(bookData.bookings);
      }

      const ratesResp = await fetch("/api/admin/delivery-rates");
      if (ratesResp.ok) setDeliveryRates(await ratesResp.json());

      const ordersResp = await fetch("/api/admin/orders");
      if (ordersResp.ok) {
        const orderData = await ordersResp.json();
        setOrders(orderData.orders);
      }

      const usersResp = await fetch("/api/admin/users");
      if (usersResp.ok) {
        const data = await usersResp.json();
        setUsers(data.users || []);
      }
      const reviewsResp = await fetch("/api/admin/reviews");
      if (reviewsResp.ok) {
        const data = await reviewsResp.json();
        setAllReviews(data.reviews || {});
      }

      const publicStatsResp = await fetch("/api/stats/public");
      if (publicStatsResp.ok) {
        const data = await publicStatsResp.json();
        if (data.settings) setSiteSettings(data.settings);
        if (data.models) setModels(data.models);
      }
    } catch (err) {
      console.error("Error fetching admin data", err);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const me = await fetch("/api/auth/me");
        if (!me.ok) {
          navigate("/auth");
          return;
        }
        const meData = await me.json();
        if (meData.role !== "admin") {
          navigate("/auth");
          return;
        }
        await fetchData();
      } catch (err) {
        navigate("/auth");
      }
    })();
  }, [navigate]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProduct,
          price: parseInt(newProduct.price),
          discount: parseInt(newProduct.discount)
        }),
      });

      if (resp.ok) {
        toast({ title: "Produit ajouté" });
        setShowAddProductForm(false);
        fetchData();
      }
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const resp = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (resp.ok) {
        toast({ title: "Produit supprimé", variant: "destructive" });
        fetchData();
      }
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newService,
          price: parseInt(newService.price),
          discount: parseInt(newService.discount)
        }),
      });

      if (resp.ok) {
        toast({ title: "Service ajouté" });
        setShowAddServiceForm(false);
        fetchData();
      }
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDeleteService = async (id: number) => {
    try {
      const resp = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      if (resp.ok) {
        toast({ title: "Service supprimé", variant: "destructive" });
        fetchData();
      }
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const resp = await fetch(`/api/admin/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (resp.ok) {
        toast({ title: `Réservation ${status}` });
        fetchData();
      }
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      const resp = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
      if (resp.ok) {
        toast({ title: "Réservation supprimée", variant: "destructive" });
        fetchData();
      }
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleUpdateRates = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch("/api/admin/delivery-rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deliveryRates)
      });
      if (resp.ok) toast({ title: "Tarifs mis à jour" });
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleAssignDriver = async (orderId: string, driverData: any) => {
    try {
      const resp = await fetch("/api/admin/orders/tracking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, ...driverData })
      });
      if (resp.ok) {
        toast({ title: "Mise à jour effectuée" });
        fetchData();
      }
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const reason = window.prompt("Motif d'annulation de la commande ?");
    if (!reason) return;
    try {
      const resp = await fetch("/api/admin/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason })
      });
      if (resp.ok) {
        toast({ title: "Commande annulée", variant: "destructive" });
        fetchData();
      } else {
        toast({ title: "Échec de l'annulation", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!window.confirm(`Supprimer l'utilisateur ${email} ?`)) return;
    try {
      const resp = await fetch(`/api/admin/users/${encodeURIComponent(email)}`, { method: "DELETE" });
      if (resp.ok) {
        toast({ title: "Utilisateur supprimé", variant: "destructive" });
        fetchData();
      } else {
        toast({ title: "Échec de la suppression", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteSettings)
      });
      if (resp.ok) {
        toast({ title: "Paramètres mis à jour" });
      }
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleReplyMessage = async (messageId: string) => {
    const text = replyText[messageId];
    if (!text || !text.trim()) return;

    try {
      const resp = await fetch(`/api/admin/messages/${messageId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: text })
      });
      if (resp.ok) {
        toast({ title: "Réponse envoyée" });
        setReplyText({ ...replyText, [messageId]: "" });
        fetchData(); // Refresh to see the reply
      } else {
        toast({ title: "Erreur lors de l'envoi", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleOwnerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({ title: "Fichier trop volumineux", description: "L'image ne doit pas dépasser 50 Mo", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSiteSettings({ ...siteSettings, ownerImageBase64: reader.result as string } as any);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "Fichier trop volumineux", description: "Le logo ne doit pas dépasser 10 Mo", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSiteSettings({ ...siteSettings, logoBase64: reader.result as string } as any);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddModel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const resp = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newModelBase64: reader.result })
        });
        if (resp.ok) {
          toast({ title: "Modèle ajouté" });
          fetchData();
        }
      } catch (err) {
        toast({ title: "Erreur", variant: "destructive" });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteModel = async (id: string) => {
    try {
      const resp = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteModelId: id })
      });
      if (resp.ok) {
        toast({ title: "Modèle supprimé" });
        fetchData();
      }
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const metrics = [
    { label: "Utilisateurs", value: stats?.registeredUsers || 0, icon: Users },
    { label: "Produits", value: products.length, icon: Package },
    { label: "Réservations", value: bookings.length, icon: Calendar },
    { label: "Revenus (est.)", value: `${Math.abs(stats?.totalRevenue || 0).toLocaleString()} FCFA`, icon: LineChart },
  ];

  const tabs = [
    { id: "stats", label: "Vue d'ensemble", icon: LineChart },
    { id: "products", label: "Boutique", icon: Package },
    { id: "services", label: "Services", icon: Sparkles },
    { id: "bookings", label: "Réservations", icon: Calendar },
    { id: "logistics", label: "Logistique", icon: Truck },
    { id: "history", label: "Historique", icon: ShoppingBag },
    { id: "clients", label: "Clients", icon: Users },
    { id: "reviews", label: "Avis", icon: MessageSquare },
    { id: "settings", label: "Paramètres", icon: Settings },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <Layout>
      <section className="py-12 bg-gradient-to-br from-background via-black to-background min-h-screen">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-serif font-bold">Administration KDY Beauty</h1>
              <p className="text-muted-foreground">Gérez vos produits, services et réservations.</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id
                  ? "bg-primary text-black font-bold"
                  : "bg-card text-muted-foreground hover:bg-white/5"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* --- VIEW: STATS --- */}
          {activeTab === "stats" && (
            <div className="animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metrics.map((m, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <m.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{m.label}</p>
                      <p className="text-2xl font-bold">{m.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">Activité Récente</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-black/40 rounded-lg border border-border">
                      <p className="font-bold">Nouveau client inscrit</p>
                      <p className="text-sm text-muted-foreground">Récemment</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-lg border border-border">
                      <p className="font-bold">Commandes actives</p>
                      <p className="text-sm text-muted-foreground">{orders.filter(o => o.status !== "Livré").length} colis en transit</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">Utilisateurs en Ligne</h2>
                  <div className="text-5xl font-bold text-secondary">{stats?.onlineUsers || 0}</div>
                  <p className="text-muted-foreground mt-2">Visiteurs naviguant actuellement sur le site.</p>
                </div>
              </div>
            </div>
          )}

          {/* --- VIEW: PRODUCTS --- */}
          {activeTab === "products" && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold">Gestion des Produits</h2>
                <button
                  onClick={() => setShowAddProductForm(!showAddProductForm)}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Ajouter un Produit
                </button>
              </div>

              {showAddProductForm && (
                <div className="mb-8 bg-card border border-border rounded-xl p-6">
                  <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input placeholder="Nom" className="bg-black border p-2 rounded" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
                    <input placeholder="Prix" type="number" className="bg-black border p-2 rounded" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
                    <input placeholder="Réduction" type="number" className="bg-black border p-2 rounded" value={newProduct.discount} onChange={e => setNewProduct({ ...newProduct, discount: e.target.value })} />
                    <select className="bg-black border p-2 rounded" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                      <option>Soins Visage</option><option>Maquillage</option><option>Soins Cheveux</option>
                    </select>
                    <div className="md:col-span-3 flex gap-2">
                      <input placeholder="Lien image (Optionnel)" className="flex-1 bg-black border p-2 rounded" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />
                      <input
                        type="file"
                        accept="image/*"
                        className="flex-1 bg-black border p-2 rounded text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/80"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setNewProduct({ ...newProduct, imageBase64: reader.result as string });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                    <button type="submit" className="btn-primary" disabled={!newProduct.image && !newProduct.imageBase64}>Enregistrer</button>
                  </form>
                </div>
              )}

              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 uppercase text-xs font-bold text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4">Nom</th>
                      <th className="px-6 py-4">Catégorie</th>
                      <th className="px-6 py-4">Prix</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-t border-border hover:bg-white/5">
                        <td className="px-6 py-4 font-medium">{p.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{p.category}</td>
                        <td className="px-6 py-4">{Math.abs(p.price).toLocaleString()} FCFA</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteProduct(p.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- VIEW: SERVICES --- */}
          {activeTab === "services" && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold">Gestion des Services</h2>
                <button
                  onClick={() => setShowAddServiceForm(!showAddServiceForm)}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Ajouter un Service
                </button>
              </div>

              {showAddServiceForm && (
                <div className="mb-8 bg-card border border-border rounded-xl p-6">
                  <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input placeholder="Nom du service" className="bg-black border p-2 rounded" value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} required />
                    <input placeholder="Prix" type="number" className="bg-black border p-2 rounded" value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })} required />
                    <input placeholder="Réduction (%)" type="number" className="bg-black border p-2 rounded" value={newService.discount} onChange={e => setNewService({ ...newService, discount: e.target.value })} />
                    <textarea placeholder="Description" className="md:col-span-2 bg-black border p-2 rounded" value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })} required />
                    <div className="md:col-span-2 flex flex-col sm:flex-row gap-2">
                      <input placeholder="Lien image (Optionnel)" className="flex-1 bg-black border p-2 rounded" value={newService.image} onChange={e => setNewService({ ...newService, image: e.target.value })} />
                      <input
                        type="file"
                        accept="image/*"
                        className="flex-1 bg-black border p-2 rounded text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/80"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setNewService({ ...newService, imageBase64: reader.result as string });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                    <button type="submit" className="btn-primary h-full" disabled={!newService.image && !newService.imageBase64}>Enregistrer</button>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map(s => (
                  <div key={s.id} className="bg-card border border-border rounded-xl p-6 flex gap-4">
                    <img src={s.image} className="w-24 h-24 object-cover rounded-lg border border-border" alt={s.name} />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{s.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{s.description}</p>
                      <p className="font-bold text-primary">{Math.abs(s.price).toLocaleString()} FCFA</p>
                    </div>
                    <button onClick={() => handleDeleteService(s.id)} className="text-destructive hover:bg-destructive/10 p-2 h-fit rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- VIEW: BOOKINGS --- */}
          {activeTab === "bookings" && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-serif font-bold mb-6">Réservations Clients</h2>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 uppercase text-xs font-bold text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Date & Heure</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground italic">Aucune réservation pour le moment.</td></tr>
                    ) : (
                      bookings.map(b => (
                        <tr key={b.id} className="border-t border-border hover:bg-white/5">
                          <td className="px-6 py-4">
                            <p className="font-bold">{b.name}</p>
                            <p className="text-xs text-muted-foreground">{b.phone}</p>
                          </td>
                          <td className="px-6 py-4">{b.service}</td>
                          <td className="px-6 py-4">
                            <p>{new Date(b.date).toLocaleDateString("fr-FR")}</p>
                            <p className="text-xs text-muted-foreground">{b.time}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === "Terminé" ? "bg-green-500/20 text-green-500" :
                              b.status === "Annulé" ? "bg-destructive/20 text-destructive" :
                                "bg-primary/20 text-primary"
                              }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {b.status === "Confirmé" && (
                                <>
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, "Terminé")}
                                    className="p-2 hover:bg-green-500/10 text-green-500 rounded-lg"
                                    title="Finaliser"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, "Annulé")}
                                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"
                                    title="Annuler"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteBooking(b.id)}
                                className="p-2 hover:bg-white/10 text-muted-foreground rounded-lg"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- VIEW: LOGISTICS --- */}
          {activeTab === "logistics" && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Delivery Rates */}
                <div className="bg-card border border-border rounded-xl p-6 h-fit">
                  <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" /> Tarification Livraison
                  </h2>
                  <form onSubmit={handleUpdateRates} className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-bold">Abidjan (Intérieur)</label>
                      <input
                        type="number"
                        value={deliveryRates?.abidjan}
                        onChange={e => setDeliveryRates({ ...deliveryRates, abidjan: parseInt(e.target.value) })}
                        className="w-full bg-black border border-border p-2 rounded mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-bold">Villes Proches</label>
                      <input
                        type="number"
                        value={deliveryRates?.near}
                        onChange={e => setDeliveryRates({ ...deliveryRates, near: parseInt(e.target.value) })}
                        className="w-full bg-black border border-border p-2 rounded mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-bold">Reste du pays / International</label>
                      <input
                        type="number"
                        value={deliveryRates?.rest}
                        onChange={e => setDeliveryRates({ ...deliveryRates, rest: parseInt(e.target.value) })}
                        className="w-full bg-black border border-border p-2 rounded mt-1"
                      />
                    </div>
                    <button type="submit" className="w-full btn-primary py-3 text-sm">Mettre à jour les tarifs</button>
                  </form>
                </div>

                {/* Right: Active Orders Tracking */}
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" /> Suivi des Colis Actifs
                  </h2>
                  <div className="space-y-4">
                    {orders.filter((o: any) => o.status !== "Livré").length === 0 ? (
                      <div className="p-12 text-center bg-card border border-border rounded-xl italic text-muted-foreground">
                        Aucune expédition en cours.
                      </div>
                    ) : (
                      orders.filter((o: any) => o.status !== "Livré").map((order: any) => (
                        <div key={order.id} className="bg-card border border-border rounded-xl p-6">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <p className="text-primary font-mono font-bold">{order.id}</p>
                              <p className="text-xs text-muted-foreground">{order.items?.length || 0} articles | {Math.abs(order.total || 0).toLocaleString()} FCFA</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <p className="text-[10px] px-2 py-0.5 bg-white/5 rounded border border-white/10">{order.deliveryRegion || "Région non spécifiée"}</p>
                                <p className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded border border-primary/20 font-bold">{order.paymentMethod || "Paiement non spécifié"}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${order.status === "En attente" ? "bg-yellow-500/20 text-yellow-500" : "bg-blue-500/20 text-blue-500"}`}>
                                {order.status}
                              </span>
                              {order.receiptScreenshot && (
                                <a
                                  href={order.receiptScreenshot}
                                  target="_blank"
                                  className="text-[10px] text-secondary hover:underline flex items-center gap-1 font-bold"
                                >
                                  <Package className="w-3 h-3" /> Voir le Reçu
                                </a>
                              )}
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="text-destructive text-[10px] underline hover:no-underline"
                                title="Annuler la commande"
                              >
                                Annuler la commande
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                            {/* Driver Assignment Form */}
                            <div>
                              <p className="text-xs text-muted-foreground uppercase font-bold mb-3">Assignation Livreur</p>
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget as HTMLFormElement);
                                handleAssignDriver(order.id, {
                                  driverName: fd.get("name"),
                                  driverPlate: fd.get("plate"),
                                  driverPhone: fd.get("phone"),
                                  status: "En cours"
                                });
                              }} className="space-y-2">
                                <input name="name" placeholder="Nom complet" defaultValue={order.tracking?.driverName} className="w-full bg-black border border-border p-1.5 text-sm rounded" />
                                <div className="grid grid-cols-2 gap-2">
                                  <input name="plate" placeholder="Plaque d'immat." defaultValue={order.tracking?.driverPlate} className="bg-black border border-border p-1.5 text-sm rounded" />
                                  <input name="phone" placeholder="Téléphone" defaultValue={order.tracking?.driverPhone} className="bg-black border border-border p-1.5 text-sm rounded" />
                                </div>
                                <button type="submit" className="w-full bg-white/5 hover:bg-white/10 text-white text-xs py-2 rounded transition-colors">
                                  {order.tracking?.driverName ? "Mettre à jour" : "Assigner et Envoyer"}
                                </button>
                              </form>
                            </div>

                            {/* Status controls */}
                            <div className="flex flex-col justify-between">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold mb-3">Actions rapides</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAssignDriver(order.id, { status: "En route" })}
                                    className="flex-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-xs py-2 rounded border border-blue-500/20 transition-all"
                                  >
                                    En route
                                  </button>
                                  <button
                                    onClick={() => handleAssignDriver(order.id, { status: "Livré" })}
                                    className="flex-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs py-2 rounded border border-green-500/20 transition-all font-bold"
                                  >
                                    Confirmer Arrivée
                                  </button>
                                </div>
                              </div>
                              {order.location && (
                                <a
                                  href={`https://www.google.com/maps?q=${order.location.lat},${order.location.lng}`}
                                  target="_blank"
                                  className="mt-4 flex items-center justify-center gap-2 text-[10px] text-primary hover:underline"
                                >
                                  <MapPin className="w-3 h-3" /> Voir la localisation client
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- VIEW: CLIENTS --- */}
          {activeTab === "clients" && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden animate-in fade-in duration-500">
              <div className="p-6 border-b border-border bg-primary/5">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Liste des Clients
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left bg-black/20 text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
                      <th className="p-4">Nom</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Téléphone</th>
                      <th className="p-4">Rôle</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground italic">Aucun utilisateur trouvé.</td>
                      </tr>
                    ) : (
                      users.map((u, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-white/5 transition-colors">
                          <td className="p-4 font-bold">{u.name || "N/A"}</td>
                          <td className="p-4 text-primary font-mono">{u.email}</td>
                          <td className="p-4">{u.phone || "Non renseigné"}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(u.email)}
                              className="text-destructive hover:bg-destructive/10 p-2 rounded-lg"
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- VIEW: HISTORY --- */}
          {activeTab === "history" && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-serif font-bold mb-6">Historique des Commandes (Validées)</h2>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 uppercase text-xs font-bold text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Articles</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter((o: any) => o.status === "Livré").map((o: any) => (
                      <tr key={o.id} className="border-t border-border hover:bg-white/5">
                        <td className="px-6 py-4 font-mono">{o.id}</td>
                        <td className="px-6 py-4">{o.items?.length || 0}</td>
                        <td className="px-6 py-4">{Math.abs(o.total || 0).toLocaleString()} FCFA</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-500/20 text-green-500">Livré</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- VIEW: REVIEWS --- */}
          {activeTab === "reviews" && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-2xl font-serif font-bold mb-6">Avis Clients</h2>
              <div className="space-y-4">
                {Object.keys(allReviews).length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground italic border border-border rounded-xl">Aucun avis pour le moment.</div>
                ) : (
                  Object.entries(allReviews).map(([itemId, list]) => (
                    <div key={itemId} className="bg-card border border-border rounded-xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-bold">Produit/Service ID: <span className="font-mono text-primary">{itemId}</span></p>
                        <span className="text-[10px] bg-white/5 px-2 py-1 rounded-full">{(list as any[]).length} avis</span>
                      </div>
                      <div className="space-y-2">
                        {(list as any[]).map((r, idx) => (
                          <div key={idx} className="p-3 bg-white/5 rounded-lg flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold">{r.user}</p>
                              <p className="text-xs text-muted-foreground">Note: {r.rating}/5</p>
                            </div>
                            <p className="text-sm">"{r.comment}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* --- VIEW: MESSAGES --- */}
          {activeTab === "messages" && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-serif font-bold mb-6">Messages de Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.map(m => (
                  <div key={m.id} className="bg-card border border-border p-5 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between mb-4">
                        <div>
                          <h3 className="font-bold">{m.name}</h3>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full uppercase font-bold h-fit">{m.subject}</span>
                      </div>
                      <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-4 relative">
                        <MessageSquare className="w-4 h-4 text-muted-foreground absolute top-4 right-4 opacity-20" />
                        <p className="text-sm text-foreground mb-2">"{m.message}"</p>
                        <p className="text-[10px] text-right text-muted-foreground/50">{new Date(m.date).toLocaleString()}</p>
                      </div>

                      {m.reply && (
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 mb-4 ml-6 relative">
                          <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-widest">Ma Réponse :</p>
                          <p className="text-sm text-foreground">"{m.reply}"</p>
                        </div>
                      )}
                    </div>

                    {!m.reply && (
                      <div className="mt-4 pt-4 border-t border-border flex gap-2">
                        <textarea
                          placeholder="Écrire une réponse..."
                          className="flex-1 bg-black border border-border rounded-lg p-2 text-sm outline-none focus:border-primary resize-none h-10"
                          value={replyText[m.id] || ""}
                          onChange={(e) => setReplyText({ ...replyText, [m.id]: e.target.value })}
                        />
                        <button
                          onClick={() => handleReplyMessage(m.id)}
                          className="bg-primary hover:bg-primary/90 text-black px-4 rounded-lg font-bold text-sm transition-colors"
                        >
                          Envoyer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- VIEW: SETTINGS --- */}
          {activeTab === "settings" && (
            <div className="animate-in fade-in duration-500 max-w-2xl mx-auto">
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-border bg-primary/5">
                  <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                    <Settings className="w-6 h-6 text-primary" /> Paramètres du Site
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">Modifiez la photo et le titre de la propriétaire affichés sur l'accueil.</p>
                </div>

                <form onSubmit={handleUpdateSettings} className="p-8 space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Titre de la Propriétaire</label>
                    <input
                      className="w-full bg-black/40 border border-border rounded-xl p-4 outline-none focus:border-primary transition-all font-serif italic"
                      value={siteSettings.ownerTitle}
                      onChange={e => setSiteSettings({ ...siteSettings, ownerTitle: e.target.value })}
                      placeholder="Ex: Fondatrice & CEO"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Logo du Site</label>
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary/20 bg-black flex items-center justify-center p-4">
                        {(siteSettings as any).logoBase64 ? (
                          <img src={(siteSettings as any).logoBase64} className="w-full h-full object-contain" />
                        ) : siteSettings.siteLogo ? (
                          <img src={siteSettings.siteLogo} className="w-full h-full object-contain" />
                        ) : (
                          <Sparkles className="w-12 h-12 text-muted-foreground opacity-20" />
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="text-xs text-muted-foreground italic">Sélectionnez le logo du site (PNG de préférence avec fond transparent).</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="text-sm block w-full text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary file:text-black hover:file:bg-primary/80 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Photo de Profil de la Propriétaire</label>
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary/20 bg-black flex items-center justify-center">
                        {(siteSettings as any).ownerImageBase64 ? (
                          <img src={(siteSettings as any).ownerImageBase64} className="w-full h-full object-cover" />
                        ) : siteSettings.ownerImage ? (
                          <img src={siteSettings.ownerImage} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-12 h-12 text-muted-foreground opacity-20" />
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="text-xs text-muted-foreground italic">Sélectionnez une nouvelle photo (JPG, PNG ou GIF). Elle sera affichée sur l'accueil.</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleOwnerImageUpload}
                          className="text-sm block w-full text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary file:text-black hover:file:bg-primary/80 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full btn-primary py-4 font-bold tracking-widest shadow-xl flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" /> Enregistrer les modifications
                  </button>
                </form>

                {/* --- Section: Modèles de ma conception --- */}
                <div className="p-8 border-t border-border bg-secondary/5">
                  <div className="mb-6">
                    <button
                      onClick={async () => {
                        if (!window.confirm("Réinitialiser les données (sauf produits/services) ?")) return;
                        try {
                          const resp = await fetch("/api/admin/reset-demo", { method: "POST" });
                          if (resp.ok) {
                            toast({ title: "Données réinitialisées" });
                            fetchData();
                          }
                        } catch {
                          toast({ title: "Erreur", variant: "destructive" });
                        }
                      }}
                      className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30 py-3 rounded-xl text-sm font-bold"
                    >
                      Réinitialiser les données (hors produits & services)
                    </button>
                  </div>
                  <div className="mb-6">
                    <button
                      onClick={async () => {
                        if (!window.confirm("Réinitialiser le compteur Revenus (est.) à 0 ?")) return;
                        try {
                          const resp = await fetch("/api/admin/reset-revenue", { method: "POST" });
                          if (resp.ok) {
                            toast({ title: "Revenus (est.) réinitialisés" });
                            fetchData();
                          }
                        } catch {
                          toast({ title: "Erreur", variant: "destructive" });
                        }
                      }}
                      className="w-full bg-white/5 hover:bg-white/10 border border-border py-3 rounded-xl text-sm"
                    >
                      Réinitialiser Revenus (est.)
                    </button>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-serif font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-secondary" /> Modèles de ma conception
                      </h3>
                      <p className="text-muted-foreground text-xs mt-1">Gérez la galerie de vos créations affichée sur l'accueil.</p>
                    </div>
                    <label className="btn-primary flex items-center gap-2 text-sm cursor-pointer py-2 px-4 h-fit">
                      <Plus className="w-4 h-4" /> Ajouter un Modèle
                      <input type="file" accept="image/*" onChange={handleAddModel} className="hidden" />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {models.length === 0 ? (
                      <div className="col-span-full py-8 text-center border-2 border-dashed border-border rounded-xl text-muted-foreground italic text-sm">
                        Aucun modèle ajouté. Commencez par en ajouter un !
                      </div>
                    ) : (
                      models.map((m: any) => (
                        <div key={m.id} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-black">
                          <img src={m.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={() => handleDeleteModel(m.id)}
                              className="bg-destructive text-white p-2 rounded-full hover:bg-destructive/80 transition-colors"
                              title="Supprimer ce modèle"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default AdminDashboard;
