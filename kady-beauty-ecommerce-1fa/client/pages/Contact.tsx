import { Layout } from "@/components/layout/Layout";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Message envoyé !",
          description: "Merci pour votre message. Nous vous répondrons très bientôt.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error();
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-black to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">
            KDY Beauty - <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Contact</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Des questions? Nous aimerions avoir de vos nouvelles. Envoyez-nous un message et nous répondrons au plus vite.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            {/* Contact Info Cards */}
            <div className="bg-gradient-to-br from-card to-black border border-border rounded-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Appelez-nous</p>
                  <p className="text-lg font-semibold text-foreground">07 77 78 02 90</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                Disponible pour vous conseiller
              </p>
            </div>

            <div className="bg-gradient-to-br from-card to-black border border-border rounded-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-lg font-semibold text-foreground text-sm">kadyc9513@gmail.com</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                Réponse sous 24h garantie
              </p>
            </div>

            <div className="bg-gradient-to-br from-card to-black border border-border rounded-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Localisation</p>
                  <p className="text-lg font-semibold text-foreground">Yopougon Ananeraie</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                Abidjan, Côte d'Ivoire
              </p>
            </div>
          </div>

          {/* Map and Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Google Map */}
            <div className="bg-gradient-to-br from-card to-black border border-border rounded-xl overflow-hidden h-[400px] lg:h-full min-h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.417036662491!2d-4.08868692501614!3d5.353114994625575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfc1ea3452243d95%3A0x6440f1352f203644!2sYopougon%20Ananeraie%2C%20Abidjan!5e0!3m2!1sfr!2sci!4v1709575000000!5m2!1sfr!2sci"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localisation KDY Beauty"
              ></iframe>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-br from-card to-black border border-border rounded-xl p-8 md:p-10">
              <h2 className="text-3xl font-serif font-bold mb-8 text-center">Nous Envoyer un Message</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Nom Complet
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-black border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-black border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Sujet
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-black border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Sélectionner un sujet</option>
                  <option value="booking">Question de Réservation</option>
                  <option value="product">Demande Produit</option>
                  <option value="feedback">Avis</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full bg-black border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Écrivez votre message ici..."
                ></textarea>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {loading ? "Envoi en cours..." : "Envoyer le Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </Layout>
  );
};

export default Contact;
