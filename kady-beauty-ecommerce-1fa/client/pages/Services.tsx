import { Layout } from "@/components/layout/Layout";
import { ArrowRight, MessageCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ItemDetailsModal } from "@/components/ItemDetailsModal";

const Services = () => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);

  useState(() => {
    fetch("/api/services")
      .then(r => r.json())
      .then(data => setServices(data.services || []));
  });

  const handleOpenDetails = (service: any) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-white border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-black">
            KDY Beauty - <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Services</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez notre gamme de traitements de Beauty luxueux réalisés par des professionnels experts
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                onClick={() => handleOpenDetails(service)}
                className="group p-8 rounded-xl bg-white border border-gray-200 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full cursor-pointer relative overflow-hidden"
              >
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {service.category}
                  </span>
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4 text-black group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                <p className="text-gray-600 mb-6 flex-grow line-clamp-3">
                  {service.description}
                </p>
                <div className="pt-6 border-t border-gray-100 mt-auto flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-secondary">
                      {Math.abs(service.price || 0).toLocaleString()} FCFA
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      <Star className="w-3 h-3 fill-secondary text-secondary" />
                      Voir les avis
                    </div>
                  </div>
                  <Link
                    to={`/booking?service=${encodeURIComponent(service.name)}`}
                    className="btn-primary w-full text-center py-2 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Réserver ce service
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-black">
            Prête à Révéler Votre Éclat ?
          </h2>
          <p className="text-gray-600 mb-10 max-w-xl mx-auto text-lg">
            Réservez votre séance personnalisée avec nos experts dès aujourd'hui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking" className="btn-primary px-10 py-4 text-lg">
              Réserver en ligne
            </Link>
            <a href="https://wa.me/2250777780290" target="_blank" rel="noopener noreferrer" className="btn-outline px-10 py-4 text-lg border-gray-300 text-black hover:bg-gray-50 flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
            <a href="/contact" className="btn-outline px-10 py-4 text-lg border-gray-300 text-black hover:bg-gray-50">
              Nous Contacter
            </a>
          </div>
        </div>
      </section>

      <ItemDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedService}
        type="service"
      />
    </Layout>
  );
};

export default Services;
