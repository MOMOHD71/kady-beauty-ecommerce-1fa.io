import { Layout } from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, CreditCard, Truck, Upload, MapPin, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const CheckoutValidation = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");
    const navigate = useNavigate();
    const { toast } = useToast();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [deliveryRates, setDeliveryRates] = useState<any>(null);

    const [formData, setFormData] = useState({
        paymentMethod: "",
        deliveryRegion: "",
        receiptScreenshot: "",
        receiptFilename: "",
        location: null as { lat: number, lng: number } | null,
        paymentPreference: "" as "" | "sur_place" | "whatsapp"
    });

    useEffect(() => {
        fetch("/api/delivery-rates")
            .then(r => r.json())
            .then(data => setDeliveryRates(data));

        if (!orderId) {
            navigate("/shop");
        }
    }, [orderId, navigate]);

    const handleNextStep = () => setStep(s => s + 1);

    const requestLocation = () => {
        if (!navigator.geolocation) {
            toast({ title: "Erreur", description: "La géolocalisation n'est pas supportée par votre navigateur.", variant: "destructive" });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setFormData({ ...formData, location: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
                toast({ title: "Localisation activée", description: "Votre position a été enregistrée pour la livraison." });
            },
            () => {
                toast({ title: "Erreur", description: "Impossible d'accéder à votre position.", variant: "destructive" });
            }
        );
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const resp = await fetch("/api/orders/details", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId,
                    ...formData
                })
            });

            if (resp.ok) {
                toast({ title: "Commande finalisée !", description: "Nous traitons votre paiement et votre livraison." });
                navigate("/dashboard");
            }
        } catch (err) {
            toast({ title: "Erreur", description: "Une erreur est survenue lors de la validation.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const paymentMethods = [
        { id: "wave", name: "Wave", color: "bg-blue-500" },
        { id: "orange", name: "Orange Money", color: "bg-orange-500" },
        { id: "moov", name: "Moov Money", color: "bg-blue-600" },
        { id: "cash", name: "Paiement Cash à la livraison", color: "bg-green-600" }
    ];

    const regions = [
        { id: "abidjan", label: "Abidjan", price: deliveryRates?.abidjan },
        { id: "near", label: "Villes proches", price: deliveryRates?.near },
        { id: "rest", label: "Autres villes", price: deliveryRates?.rest }
    ];

    return (
        <Layout>
            <section className="py-20 bg-gradient-to-br from-background via-black to-background min-h-screen">
                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${(step / 4) * 100}%` }}
                            />
                        </div>

                        <div className="mb-8">
                            <h1 className="text-3xl font-serif font-bold mb-2">Validation de Commande</h1>
                            <p className="text-muted-foreground">ID Commande: <span className="text-primary font-mono">{orderId}</span></p>
                        </div>

                        {/* STEP 1: PAYMENT METHOD */}
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <CreditCard className="text-primary" /> Mode de paiement
                                </h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {paymentMethods.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => { setFormData({ ...formData, paymentMethod: m.id }); handleNextStep(); }}
                                            className={`p-4 rounded-xl border flex items-center justify-between transition-all ${formData.paymentMethod === m.id ? "border-primary bg-primary/10" : "border-border bg-black/20 hover:border-primary/50"}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${m.color}`} />
                                                <span className="font-medium">{m.name}</span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 opacity-50" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: DELIVERY REGION */}
                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Truck className="text-primary" /> Lieu de livraison
                                </h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {regions.map(r => (
                                        <button
                                            key={r.id}
                                            onClick={() => { setFormData({ ...formData, deliveryRegion: r.id }); handleNextStep(); }}
                                            className={`p-4 rounded-xl border flex items-center justify-between transition-all ${formData.deliveryRegion === r.id ? "border-primary bg-primary/10" : "border-border bg-black/20 hover:border-primary/50"}`}
                                        >
                                            <span className="font-medium">{r.label}</span>
                                            <span className="font-bold text-secondary">{Math.abs(r.price || 0).toLocaleString()} FCFA</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: RECEIPT / PREFERENCE */}
                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Upload className="text-primary" /> Confirmation du paiement
                                </h2>
                                {formData.paymentMethod === "cash" ? (
                                    <div className="py-8 text-center bg-green-500/10 rounded-xl border border-green-500/20 mb-6">
                                        <p className="font-medium text-green-500">Paiement à la livraison sélectionné.</p>
                                        <p className="text-sm text-muted-foreground mt-2">Préparez le montant exact pour le livreur.</p>
                                        <button onClick={handleNextStep} className="btn-primary mt-6">Continuer</button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 gap-2">
                                            <button
                                                onClick={() => setFormData({ ...formData, paymentPreference: "sur_place" })}
                                                className={`p-3 rounded-lg border text-left ${formData.paymentPreference === "sur_place" ? "border-primary bg-primary/10" : "border-border bg-black/20 hover:border-primary/50"}`}
                                            >
                                                Payer sur place (à la livraison)
                                            </button>
                                            <button
                                                onClick={() => setFormData({ ...formData, paymentPreference: "whatsapp" })}
                                                className={`p-3 rounded-lg border text-left ${formData.paymentPreference === "whatsapp" ? "border-primary bg-primary/10" : "border-border bg-black/20 hover:border-primary/50"}`}
                                            >
                                                Discuter du paiement via WhatsApp
                                            </button>
                                        </div>
                                        {formData.paymentPreference === "whatsapp" && (
                                            <a
                                                href={`https://wa.me/2250777780290?text=${encodeURIComponent(`Bonjour KDY Beauty, je souhaite finaliser le paiement de ma commande ${orderId} via ${formData.paymentMethod.toUpperCase()}.`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-outline inline-flex items-center gap-2"
                                            >
                                                Ouvrir WhatsApp
                                                <ArrowRight className="w-4 h-4" />
                                            </a>
                                        )}
                                        <p className="text-sm text-muted-foreground">Veuillez envoyer le paiement correspondant au montant de votre commande (total + frais de livraison) sur notre compte {formData.paymentMethod.toUpperCase()} puis importez une capture d'écran du reçu si vous avez déjà payé.</p>
                                        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="receipt-upload"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setFormData({ ...formData, receiptScreenshot: reader.result as string, receiptFilename: file.name });
                                                            toast({ title: "Reçu ajouté", description: `${file.name} a été sélectionné.` });
                                                            setTimeout(handleNextStep, 800);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <label htmlFor="receipt-upload" className="cursor-pointer">
                                                {formData.receiptScreenshot ? (
                                                    <div className="flex flex-col items-center">
                                                        <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                                                        <p className="font-medium text-green-500">Reçu chargé !</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{formData.receiptFilename || "Fichier image"}</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                                        <p className="font-medium">Cliquer pour importer le reçu</p>
                                                        <p className="text-xs text-muted-foreground mt-2">JPG, PNG supportés</p>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 4: GEOLOCATION & FINAL */}
                        {step === 4 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <MapPin className="text-primary" /> Localisation finale
                                </h2>
                                <div className="space-y-6">
                                    <p className="text-sm text-muted-foreground italic">Autorisez l'accès à votre position pour faciliter la tâche du livreur et assurer une livraison précise de votre colis.</p>

                                    {!formData.location ? (
                                        <div className="space-y-4">
                                            <button
                                                onClick={requestLocation}
                                                className="w-full py-4 bg-secondary text-secondary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors"
                                            >
                                                <MapPin className="w-5 h-5" /> Activer ma localisation GPS
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setFormData({ ...formData, location: { lat: 0, lng: 0 } });
                                                    toast({ title: "Localisation manuelle", description: "Le livreur vous contactera pour confirmer l'adresse exacte." });
                                                }}
                                                className="w-full py-2 text-xs text-muted-foreground hover:text-primary underline transition-colors"
                                            >
                                                Je ne souhaite pas partager ma position GPS
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-4 bg-green-500/10 rounded-xl border border-green-500/20 text-center flex items-center justify-center gap-2 text-green-500 font-bold">
                                            <CheckCircle2 className="w-5 h-5" /> Localisation validée
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || !formData.location}
                                        className="w-full btn-primary py-4 mt-4 disabled:opacity-50"
                                    >
                                        {loading ? "Traitement..." : "Valider et Terminer"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default CheckoutValidation;
