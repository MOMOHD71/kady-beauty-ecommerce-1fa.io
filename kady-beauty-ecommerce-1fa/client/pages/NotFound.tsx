import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-black to-background">
        <div className="text-center space-y-6 px-4">
          <div className="mb-6">
            <div className="text-6xl md:text-8xl font-serif font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              404
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">
            Page Non Trouvée
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Désolé, la page que vous recherchez n'existe pas. Laissez-nous vous aider à retrouver votre chemin.
          </p>
          <div className="pt-8">
            <Link
              to="/"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Retourner à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
