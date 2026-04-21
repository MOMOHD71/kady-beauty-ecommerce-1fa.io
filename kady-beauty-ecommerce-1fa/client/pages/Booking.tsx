import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, Phone, Mail, User, CheckCircle2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Booking = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const serviceFromQuery = searchParams.get("service") || "";

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        date: "",
        time: "",
        phone: "",
        service: serviceFromQuery
    });

    const [existingBookings, setExistingBookings] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Fetch public simplified bookings to show available days
        fetch("/api/bookings/public")
            .then(r => r.json())
            .then(data => {
                setExistingBookings(data.dates || []);
            })
            .catch(() => setExistingBookings([]));

        // Fetch all available services
        fetch("/api/services")
            .then(r => r.json())
            .then(data => setServices(data.services || []))
            .catch(() => setServices([]));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const resp = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (resp.ok) {
                setSuccess(true);
                toast({
                    title: "Réservation réussie !",
                    description: "Votre demande a été prise en compte.",
                });

                // WhatsApp Redirection
                const message = `Bonjour KDY Beauty, je souhaite réserver pour :
- Service : ${formData.service}
- Nom : ${formData.name}
- Date : ${formData.date}
- Heure : ${formData.time}
- Tél : ${formData.phone}`;

                const whatsappUrl = `https://wa.me/2250777780290?text=${encodeURIComponent(message)}`;

                // Open WhatsApp after a short delay
                setTimeout(() => {
                    window.open(whatsappUrl, "_blank");
                }, 2000);
            } else {
                toast({
                    title: "Erreur",
                    description: "Impossible de finaliser la réservation.",
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({ title: "Erreur réseau", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Layout>
                <div className="min-h-[70vh] flex items-center justify-center">
                    <div className="max-w-md w-full bg-card border border-border p-8 rounded-2xl text-center space-y-6 animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-12 h-12 text-primary" />
                        </div>
                        <h1 className="text-3xl font-serif font-bold">Merci {formData.name} !</h1>
                        <p className="text-muted-foreground">
                            Votre réservation pour le service <span className="text-foreground font-bold">{formData.service}</span> a été enregistrée.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Vous allez être redirigé vers WhatsApp pour finaliser la confirmation avec l'administrateur.
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="btn-outline w-full"
                        >
                            Retour à l'accueil
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <section className="py-12 bg-gradient-to-br from-background via-black to-background min-h-screen">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                        {/* Left: Info & Calendar */}
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Réservez votre <span className="text-primary">Expérience</span></h1>
                                <p className="text-lg text-muted-foreground">
                                    Remplissez le formulaire pour bloquer votre créneau. Notre équipe vous contactera pour confirmer les détails.
                                </p>
                            </div>

                            <div className="bg-card border border-border rounded-2xl p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-secondary" />
                                    Disponibilités (Aperçu)
                                </h2>
                                <div className="grid grid-cols-7 gap-2 text-center text-xs mb-4">
                                    {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
                                        <div key={d} className="font-bold text-muted-foreground">{d}</div>
                                    ))}
                                    {Array.from({ length: 31 }).map((_, i) => {
                                        const dayStr = (i + 1).toString().padStart(2, '0');
                                        const isBusy = existingBookings.some(d => d.endsWith(`-${dayStr}`));
                                        return (
                                            <div
                                                key={i}
                                                className={`h-10 flex items-center justify-center rounded-lg border border-border ${isBusy ? "bg-primary/20 text-primary border-primary/30" : "bg-black/20"
                                                    }`}
                                            >
                                                {i + 1}
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">
                                    * Les cases colorées indiquent des jours avec des réservations existantes.
                                </p>
                            </div>
                        </div>

                        {/* Right: Booking Form */}
                        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <User className="w-4 h-4 text-primary" /> Nom complet
                                        </label>
                                        <input
                                            required
                                            className="w-full bg-black/50 border border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-primary" /> Email
                                        </label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full bg-black/50 border border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-primary" /> Date souhaitée
                                        </label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full bg-black/50 border border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-primary" /> Heure
                                        </label>
                                        <input
                                            required
                                            type="time"
                                            className="w-full bg-black/50 border border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                            value={formData.time}
                                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-primary" /> Numéro de téléphone
                                    </label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full bg-black/50 border border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                        placeholder="+225 00 00 00 00 00"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Service choisi</label>
                                    {serviceFromQuery ? (
                                        <input
                                            required
                                            readOnly
                                            className="w-full bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-primary font-bold outline-none"
                                            value={formData.service}
                                        />
                                    ) : (
                                        <select
                                            required
                                            className="w-full bg-black/50 border border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                            value={formData.service}
                                            onChange={e => setFormData({ ...formData, service: e.target.value })}
                                        >
                                            <option value="">Sélectionnez un service...</option>
                                            {services.map(s => (
                                                <option key={s.id} value={s.name}>{s.name} - {s.price.toLocaleString()} FCFA</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2 group"
                                >
                                    {loading ? "Traitement..." : "Confirmer ma Réservation"}
                                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Booking;
