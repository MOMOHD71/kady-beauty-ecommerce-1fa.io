import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-background to-black border-t border-border mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              KDY Beauty
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Découvrez nos services de Beauty haut de gamme et nos cosmétiques. Sublimez votre Beauty naturelle avec notre équipe d'experts.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Liens Rapides</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/" className="hover:text-primary transition-colors">
                  Accueil
                </a>
              </li>
              <li>
                <a href="/services" className="hover:text-primary transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="/shop" className="hover:text-primary transition-colors">
                  Boutique
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <a href="tel:0777780290" className="text-muted-foreground hover:text-primary transition-colors">
                  07 77 78 02 90
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <a href="mailto:kadyc9513@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                  kadyc9513@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Yopougon Ananeraie, Abidjan
                </span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Nous Suivre</h4>
            <div className="flex gap-4">
              <a
                href="https://www.tiktok.com/@kdybeauty?_r=1&_t=ZS-94PTdhZ5xgK"
                target="_blank"
                rel="noopener noreferrer"
                title="TikTok"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors text-primary"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.33-.85.51-1.44 1.43-1.58 2.41-.14 1.02.23 2.1 1.01 2.77.85.75 2.02.89 3.01.47 1.34-.54 2.1-2.03 2.02-3.44.03-4.13.01-8.27.01-12.4z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/kdybeauty1?igsh=MTFtd2t0aTliaWJ4dw%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors text-primary"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61583747514419"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors text-primary"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/2250777780290"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors text-primary"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.031 2c-5.511 0-9.989 4.478-9.989 9.989 0 1.762.459 3.418 1.261 4.862l-1.343 4.908 5.023-1.318c1.405.765 3.006 1.197 4.71 1.197 5.512 0 9.989-4.478 9.989-9.989 0-5.511-4.477-9.989-9.989-9.989zm4.629 13.926c-.201.56-1.151 1.085-1.587 1.146-.436.061-.973.109-2.074-.329-1.1-.438-2.122-.924-3.003-1.705-1.144-.996-1.921-2.188-2.273-3.036-.352-.848-.014-1.309.284-1.611.298-.302.597-.704.896-1.056.299-.352.397-.56.597-.96.2-.4.1-.752-.05-1.056-.15-.304-1.344-3.235-1.841-4.437-.483-1.164-1.026-1.002-1.402-1.022-.376-.02-.806-.024-1.237-.024-.431 0-1.132.162-1.723.808-.591.646-2.26 2.211-2.26 5.39 0 3.179 2.312 6.249 2.634 6.683.322.434 4.551 6.946 11.024 9.736 1.54.664 2.742 1.06 3.68 1.358 1.547.489 2.954.42 4.067.254 1.245-.188 3.827-1.565 4.364-3.08.537-1.515.537-2.812.378-3.081-.158-.269-.583-.431-1.182-.731z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-8"></div>

        {/* Copyright */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© {currentYear} KDY Beauty. Tous droits réservés.</p>
          <p className="mt-2">Conçu pour le luxe et l'élégance.</p>
        </div>
      </div>
    </footer>
  );
}
