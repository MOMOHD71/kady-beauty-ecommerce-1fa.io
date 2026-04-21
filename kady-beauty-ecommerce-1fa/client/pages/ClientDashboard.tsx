import { Layout } from "@/components/layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShoppingCart, User, Gift, ArrowRight, Settings, Lock, Phone, Save, Truck, Calendar, Clock, CreditCard, ChevronRight, X, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [user, setUser] = useState<{ email: string; name: string; phone: string } | null>(null);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", password: "" });
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const meResp = await fetch("/api/auth/me");
      if (!meResp.ok) {
        navigate("/auth");
        return;
      }
      const meData = await meResp.json();
      setUser(meData);
      setProfileForm({ name: meData.name || "", phone: meData.phone || "", password: "" });

      const resp = await fetch("/api/me/orders");
      if (resp.ok) {
        const data = await resp.json();
        setOrders(data.orders ?? []);
      }

      const bookResp = await fetch("/api/me/bookings");
      if (bookResp.ok) {
        const data = await bookResp.json();
        setBookings(data.bookings ?? []);
      }

      const msgResp = await fetch("/api/me/messages");
      if (msgResp.ok) {
        const data = await msgResp.json();
        setMessages(data.messages ?? []);
      }
    })();
  }, [navigate]);

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      const resp = await fetch("/api/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });
      if (resp.ok) {
        toast({ title: "Livraison confirmée", description: "Merci de votre confiance ! Votre commande est maintenant marquée comme livrée." });
        // Update local state
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Livré" } : o));
        setSelectedOrder(null);
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de confirmer la livraison.", variant: "destructive" });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const resp = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm)
    });
    if (resp.ok) {
      toast({ title: "Profil mis à jour", description: "Vos informations ont été enregistrées avec succès." });
      if (user) {
        setUser({ ...user, name: profileForm.name, phone: profileForm.phone });
      }
    } else {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le profil.", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <section className="py-12 bg-gradient-to-br from-background via-black to-background min-h-screen">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-foreground">Tableau de Bord</h1>
            <p className="text-muted-foreground mt-2">
              Bienvenue, {user?.name || user?.email.split('@')[0]}
            </p>
          </div>


          {orders.length === 0 && bookings.length === 0 && messages.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-10 h-10 text-primary opacity-40" />
              </div>
              <h2 className="text-2xl font-serif font-bold mb-4">Bienvenue chez KDY Beauty !</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Vous n'avez pas encore passé de commande ou de réservation. Explorez notre boutique pour découvrir nos produits d'exception.
              </p>
              <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
                Commencer mes achats
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {(orders.length > 0 || bookings.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <ShoppingCart className="w-5 h-5 text-secondary" />
                      <span className="font-medium text-muted-foreground">Commandes</span>
                    </div>
                    <div className="text-3xl font-bold">{orders.length}</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <Gift className="w-5 h-5 text-secondary" />
                      <span className="font-medium text-muted-foreground">Points Fidélité</span>
                    </div>
                    <div className="text-3xl font-bold">{orders.length * 50}</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                      <span className="font-medium text-muted-foreground">En Validation</span>
                    </div>
                    <div className="text-3xl font-bold">
                      {orders.filter(o => o.status === "En attente").length}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-secondary" />
                      <span className="font-medium text-muted-foreground">Statut</span>
                    </div>
                    <div className="text-3xl font-bold">
                      {orders.length > 5 ? "Ambassadeur" : "Membre"}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-12">
                {orders.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        Commandes & Colis
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground text-left">
                            <th className="pb-4 font-medium">Référence</th>
                            <th className="pb-4 font-medium">Date</th>
                            <th className="pb-4 font-medium">Montant</th>
                            <th className="pb-4 font-medium text-right">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(o => (
                            <tr
                              key={o.id}
                              className="border-b border-border last:border-0 hover:bg-white/5 transition-colors cursor-pointer group"
                              onClick={() => setSelectedOrder(o)}
                            >
                              <td className="py-4 font-medium flex items-center gap-2">
                                {o.id}
                                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                              </td>
                              <td className="py-4 text-muted-foreground">{o.date}</td>
                              <td className="py-4 font-bold text-secondary">{Math.abs(o.total).toLocaleString()} FCFA</td>
                              <td className="py-4 text-right">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${o.status === "Payée" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                                  }`}>
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {bookings.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Réservations
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bookings.map((b: any) => (
                        <div
                          key={b.id}
                          className="bg-black/20 border border-border rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-primary/50 transition-all"
                          onClick={() => setSelectedBooking(b)}
                        >
                          <div>
                            <p className="font-bold text-primary text-sm">{b.service}</p>
                            <p className="text-xs text-muted-foreground">{new Date(b.date).toLocaleDateString()} - {b.time}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold uppercase">{b.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {messages.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Mes Messages de Contact
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {messages.map((m: any) => (
                        <div key={m.id} className="bg-black/20 border border-border rounded-xl p-4 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-primary text-sm uppercase">{m.subject}</p>
                              <p className="text-[10px] text-muted-foreground">{new Date(m.date).toLocaleString()}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${m.reply ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                              {m.reply ? "Répondu" : "En attente"}
                            </span>
                          </div>
                          <p className="text-sm text-foreground italic">"{m.message}"</p>
                          {m.reply && (
                            <div className="mt-3 bg-primary/5 p-3 rounded-lg border border-primary/20 ml-4 relative">
                              <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-widest">Réponse de l'équipe :</p>
                              <p className="text-sm text-foreground">{m.reply}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {orders.filter(o => o.status === "Livré").length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        Historique des Commandes Validées
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-left bg-black/20 text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
                            <th className="p-4">ID</th>
                            <th className="p-4">Articles</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.filter(o => o.status === "Livré").map((o, i) => (
                            <tr key={i} className="border-b border-border last:border-0 hover:bg-white/5 transition-colors">
                              <td className="p-4 font-mono">{o.id}</td>
                              <td className="p-4">{o.items?.length || 0}</td>
                              <td className="p-4 font-bold text-secondary">{Math.abs(o.total).toLocaleString()} FCFA</td>
                              <td className="p-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">Livré</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="max-w-xl">
                  <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-primary/5 p-4 border-b border-border">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <Settings className="w-4 h-4 text-primary" />
                        Mon Profil
                      </h2>
                    </div>
                    <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Nom</label>
                          <input
                            className="w-full bg-black/40 border border-border rounded-lg p-2 text-sm outline-none focus:border-primary"
                            value={profileForm.name}
                            onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Téléphone</label>
                          <input
                            className="w-full bg-black/40 border border-border rounded-lg p-2 text-sm outline-none focus:border-primary"
                            value={profileForm.phone}
                            onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Modifier le mot de passe</label>
                        <input
                          type="password"
                          className="w-full bg-black/40 border border-border rounded-lg p-2 text-sm outline-none focus:border-primary"
                          value={profileForm.password}
                          onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                          placeholder="Nouveau mot de passe..."
                        />
                      </div>
                      <button type="submit" className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" />
                        Sauvegarder
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )
          }
        </div>
      </section>

      {/* --- MODAL: ORDER DETAILS --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border flex justify-between items-center bg-primary/5">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" /> Détails de la Commande
                </h2>
                <p className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-widest">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar text-foreground">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ShoppingCart className="w-3 h-3" /> Articles achetés
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-lg border border-border overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">Quantité: 1</p>
                        </div>
                      </div>
                      <p className="font-bold text-secondary">{Math.abs(item.price || 0).toLocaleString()} FCFA</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Résumé Financier</h3>
                  <div className="bg-black/30 rounded-2xl p-5 border border-white/5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sous-total :</span>
                      <span>{Math.abs(selectedOrder.total - (selectedOrder.deliveryFee || 0)).toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Livraison :</span>
                      <span className="text-primary font-bold">+{Math.abs(selectedOrder.deliveryFee || 0).toLocaleString()} FCFA</span>
                    </div>
                    <div className="pt-3 border-t border-white/10 flex justify-between font-bold text-lg font-serif">
                      <span>Total :</span>
                      <span className="text-secondary">{Math.abs(selectedOrder.total).toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mode de Paiement</h3>
                  <div className="bg-black/30 rounded-2xl p-5 border border-white/5 flex items-center gap-4 h-full">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                      <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold uppercase tracking-tighter text-secondary">{selectedOrder.paymentMethod || "Paiement Cash"}</p>
                      <p className="text-[10px] text-muted-foreground">Transaction validée</p>
                      {selectedOrder.paymentPreference && (
                        <p className="text-[10px] text-muted-foreground mt-1">Préférence: {selectedOrder.paymentPreference === "sur_place" ? "Sur place" : selectedOrder.paymentPreference === "whatsapp" ? "WhatsApp" : selectedOrder.paymentPreference}</p>
                      )}
                      {selectedOrder.receiptScreenshot && (
                        <a href={selectedOrder.receiptScreenshot} target="_blank" className="text-[10px] text-primary underline">Voir le reçu</a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Truck className="w-3 h-3" /> Logistique & Livraison
                </h3>
                {selectedOrder.tracking?.driverName ? (
                  <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/30 shadow-inner">
                        <User className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Livreur Désigné</p>
                        <p className="text-lg font-bold">{selectedOrder.tracking.driverName}</p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Matricule :</span>
                        <span className="font-mono bg-black px-2 py-0.5 rounded border border-white/5 uppercase text-primary">{selectedOrder.tracking.driverPlate || "N/A"}</span>
                      </div>
                      <a href={`tel:${selectedOrder.tracking.driverPhone}`} className="btn-primary py-2 px-4 text-xs flex items-center justify-center gap-2 font-bold tracking-widest">
                        <Phone className="w-3 h-3" /> Appeler le livreur
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 border border-dashed border-border rounded-2xl text-center flex flex-col items-center">
                    <Truck className="w-8 h-8 text-muted-foreground mb-3 opacity-20" />
                    <p className="text-muted-foreground italic text-sm">Votre colis est en cours de préparation dans notre centre logistique.</p>
                  </div>
                )}
              </div>

              {selectedOrder.status !== "Livré" && (
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Votre colis est-il arrivé ?</span>
                  </div>
                  <button
                    onClick={() => handleConfirmDelivery(selectedOrder.id)}
                    className="w-full btn-primary py-4 flex items-center justify-center gap-2 group shadow-xl hover:scale-[1.02] transition-all"
                  >
                    <Truck className="w-5 h-5 group-hover:bounce" />
                    Confirmer : Mon Colis est Arrivé
                  </button>
                  <p className="text-[10px] text-center text-muted-foreground italic">
                    En cliquant ici, vous confirmez avoir reçu vos articles en bon état.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: BOOKING DETAILS --- */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/5">
              <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Calendar className="w-5 h-5 text-secondary" /> Détails de Réservation
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <div className="p-8 space-y-6 text-foreground">
              <div className="text-center pb-6 border-b border-white/5">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mb-2 font-bold">Prestation de service</p>
                <h3 className="text-3xl font-serif font-bold text-primary">{selectedBooking.service}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 rounded-2xl p-4 border border-white/5 shadow-inner">
                  <p className="text-[10px] text-primary/60 uppercase font-bold mb-1">Date prévue</p>
                  <p className="font-bold flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    {new Date(selectedBooking.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <div className="bg-black/30 rounded-2xl p-4 border border-white/5 shadow-inner">
                  <p className="text-[10px] text-primary/60 uppercase font-bold mb-1">Heure du RDV</p>
                  <p className="font-bold flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    {selectedBooking.time}
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest border-b border-primary/10 pb-2 text-primary">Informations de confirmation</h4>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client :</span>
                    <span className="font-bold">{selectedBooking.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact :</span>
                    <span className="font-bold">{selectedBooking.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut actuel :</span>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-[10px] font-bold uppercase">{selectedBooking.status}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-full btn-primary py-4 text-sm font-bold tracking-widest shadow-lg"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ClientDashboard;
