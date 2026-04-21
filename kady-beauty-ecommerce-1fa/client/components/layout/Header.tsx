import { Menu, X, User, LogOut, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string; name?: string } | null>(null);
  const [siteLogo, setSiteLogo] = useState("/logo.png");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data));

    fetch("/api/stats/public")
      .then(r => r.json())
      .then(data => {
        if (data && data.settings && data.settings.siteLogo) {
          setSiteLogo(data.settings.siteLogo);
        }
      })
      .catch(() => { });
  }, []);

  const handleLogout = async () => {
    const resp = await fetch("/api/auth/logout", { method: "POST" });
    if (resp.ok) {
      setUser(null);
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={siteLogo}
              alt="KDY Beauty"
              className="h-10 w-auto rounded-logo"
              onError={() => setLogoError(true)}
              style={logoError ? { display: 'none' } : {}}
            />
            <div className="flex flex-col">
              <div className="text-xl md:text-2xl font-serif font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent leading-none">
                KDY Beauty
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Accueil
            </Link>
            <Link
              to="/services"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Services
            </Link>
            <Link
              to="/shop"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Boutique
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Contact
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/5 pl-2 pr-1 py-1 rounded-full border border-border group">
                  <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors px-2 border-r border-border mr-1">
                    <User className="w-4 h-4 text-primary" />
                    <span>{user.name || user.email.split('@')[0]}</span>
                  </Link>

                  {user.role === "admin" && (
                    <Link to="/admin" className="p-1.5 hover:bg-primary/20 rounded-full transition-colors text-muted-foreground hover:text-primary" title="Administration">
                      <Settings className="w-4 h-4" />
                    </Link>
                  )}

                  <button onClick={handleLogout} className="p-1.5 hover:bg-destructive/20 rounded-full transition-colors text-muted-foreground hover:text-destructive" title="Déconnexion">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="btn-primary text-sm px-6 py-2">
                Connexion
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-3 animate-in fade-in duration-300">
            <Link
              to="/"
              className="block text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              to="/services"
              className="block text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/shop"
              className="block text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Boutique
            </Link>
            <Link
              to="/contact"
              className="block text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block text-sm font-medium hover:text-primary transition-colors py-2 flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  {user.name || user.email.split('@')[0]}
                </Link>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="block text-sm font-medium hover:text-primary transition-colors py-2 flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Administration
                  </Link>
                )}
              </>
            ) : (
              <Link
                to="/auth"
                className="block btn-primary text-sm px-6 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Connexion
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
