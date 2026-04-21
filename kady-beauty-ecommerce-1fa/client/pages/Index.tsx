import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Clock, MessageCircle } from "lucide-react";

const Index = () => {
  const [stats, setStats] = useState({
    registeredUsers: 0,
    experienceYears: 10,
    satisfaction: "100%"
  });

  const [services, setServices] = useState<any[]>([]);
  const [ownerSettings, setOwnerSettings] = useState({ ownerTitle: "Propriétaire du site", ownerImage: "/owner.png" });
  const [modelsList, setModelsList] = useState<any[]>([]);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    fetch("/api/stats/public")
      .then(r => r.json())
      .then(data => {
        if (data) {
          setStats(data);
          if (data.settings) setOwnerSettings(data.settings);
          if (data.models) setModelsList(data.models);
        }
      })
      .catch(() => { });

    fetch("/api/services")
      .then(r => r.json())
      .then(data => setServices(data.services || []))
      .catch(() => setServices([]));
  }, []);

  useEffect(() => {
    fetch("/api/auth/me").then(r => setIsAuthed(r.ok));
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-black to-background">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="inline w-4 h-4 mr-2" />
                  La Beauté Réinventée
                </div>
                <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight">
                  <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Révélez Votre Beauté</span>
                </h1>
              </div>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Maquillage professionnel pour toutes occasions
              </p>

              {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center lg:justify-start">
                <Link
                  to="/services"
                  className="btn-primary inline-flex items-center justify-center gap-2"
                >
                  Découvrir les Services
                  <ArrowRight className="w-4 h-4" />
                </Link>
            <Link
              to="/shop"
              className="btn-outline inline-flex items-center justify-center gap-2"
            >
              Acheter Maintenant
              <ArrowRight className="w-4 h-4" />
            </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-2xl font-bold text-secondary mb-2">{stats.registeredUsers}+</div>
                  <p className="text-sm text-muted-foreground">Clients Satisfaits</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary mb-2">{stats.experienceYears}+</div>
                  <p className="text-sm text-muted-foreground">Ans d'Expérience</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary mb-2">{stats.satisfaction}</div>
                  <p className="text-sm text-muted-foreground">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Right Side - Visual Element */}
            <div className="relative h-96 lg:h-full lg:min-h-96 flex items-center justify-center">
              <div className="relative w-full h-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-2xl overflow-hidden border-2 border-secondary/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary to-primary opacity-10"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <HeroVisual settings={ownerSettings} />
                  </div>
                </div>

                {/* Visual Element removed decorative cards */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Models Gallery Section (Phase 14) */}
      {modelsList.length > 0 && (
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="section-title">Modèles de ma conception</h2>
              <p className="section-subtitle">Découvrez quelques-unes de mes réalisations les plus récentes</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {modelsList.map((m: any) => (
                <div key={m.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border group">
                  <img src={m.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Modèle KDY Beauty" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-black to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title">Pourquoi Choisir KDY Beauty</h2>
            <p className="section-subtitle">
              Qualité, soins experts et expériences luxueuses personnalisées pour vous
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Sparkles,
                title: "Produits",
                description: "Cosmétiques et soins de luxe des plus grandes marques mondiales"
              },
              {
                icon: Shield,
                title: "Équipe d'Experts",
                description: "Professionnels certifiés avec des années d'expérience en Beauty"
              },
              {
                icon: Clock,
                title: "Réservation Facile",
                description: "Planification flexible avec confirmation instantanée et rappels"
              },
              {
                icon: MessageCircle,
                title: "Consultation Personnelle",
                description: "Guidance individuelle pour trouver les produits et services parfaits"
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group bg-gradient-to-br from-card to-black border border-border rounded-xl p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="mb-4">
                    <Icon className="w-12 h-12 text-secondary group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title">Nos Services</h2>
            <p className="section-subtitle">
              Découvrez notre gamme de traitements et services de Beauty luxueux
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {services.slice(0, 3).map((service, idx) => (
              <div
                key={idx}
                className="group bg-gradient-to-br from-card to-black border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
              >
                <div className="h-48 relative overflow-hidden flex items-center justify-center bg-black/40">
                  {service.image ? (
                    <img src={service.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt={service.name} />
                  ) : (
                    <Sparkles className="w-16 h-16 text-secondary/50 group-hover:text-primary/50 transition-colors" />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {service.name}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  <p className="text-secondary font-semibold mb-4">
                    À partir de {Math.abs(service.price).toLocaleString()} FCFA
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <Link
                      to="/services"
                      className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      Détails
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link
                      to={`/booking?service=${encodeURIComponent(service.name)}`}
                      className="btn-primary text-xs py-2 px-4"
                    >
                      Réserver
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/services"
              className="btn-primary inline-flex items-center gap-2"
            >
              Voir Tous les Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-secondary/10 via-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Prêt à Transformer Votre Beauty?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Réservez votre rendez-vous dès aujourd'hui ou explorez notre collection de produits
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthed && (
              <Link to="/auth" className="btn-primary">
                Créer un Compte
              </Link>
            )}
            <a
              href="https://wa.me/2250777780290"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.031 2c-5.511 0-9.989 4.478-9.989 9.989 0 1.762.459 3.418 1.261 4.862l-1.343 4.908 5.023-1.318c1.405.765 3.006 1.197 4.71 1.197 5.512 0 9.989-4.478 9.989-9.989 0-5.511-4.477-9.989-9.989-9.989zm4.629 13.926c-.201.56-1.151 1.085-1.587 1.146-.436.061-.973.109-2.074-.329-1.1-.438-2.122-.924-3.003-1.705-1.144-.996-1.921-2.188-2.273-3.036-.352-.848-.014-1.309.284-1.611.298-.302.597-.704.896-1.056.299-.352.397-.56.597-.96.2-.4.1-.752-.05-1.056-.15-.304-1.344-3.235-1.841-4.437-.483-1.164-1.026-1.002-1.402-1.022-.376-.02-.806-.024-1.237-.024-.431 0-1.132.162-1.723.808-.591.646-2.26 2.211-2.26 5.39 0 3.179 2.312 6.249 2.634 6.683.322.434 4.551 6.946 11.024 9.736 1.54.664 2.742 1.06 3.68 1.358 1.547.489 2.954.42 4.067.254 1.245-.188 3.827-1.565 4.364-3.08.537-1.515.537-2.812.378-3.081-.158-.269-.583-.431-1.182-.731z" />
              </svg>
              Discuter sur WhatsApp
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

function HeroVisual({ settings }: { settings: { ownerTitle: string; ownerImage: string } }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="text-center">
        <Sparkles className="w-16 h-16 text-secondary mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">KDY Beauty</p>
      </div>
    );
  }
  return (
    <div className="relative group flex flex-col items-center">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl border-4 border-primary/20 animate-float bg-black/40">
        <img
          src={settings.ownerImage}
          alt="Propriétaire KDY Beauty"
          className="max-w-md w-full h-auto transition-transform duration-700 group-hover:scale-105"
          onError={() => setError(true)}
        />
        {/* Simple elegant label at the bottom of the image frame */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 text-center">
          <p className="text-white font-serif font-bold text-lg tracking-wider">{settings.ownerTitle}</p>
        </div>
      </div>
    </div>
  );
}
