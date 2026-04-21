import { Layout } from "@/components/layout/Layout";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        const resp = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || "Échec de connexion");
        if (data.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas");
        }
        const reg = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        const regData = await reg.json();
        if (!reg.ok) throw new Error(regData.error || "Échec d'inscription");
        const login = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        const loginData = await login.json();
        if (!login.ok) throw new Error(loginData.error || "Échec de connexion");
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Erreur");
    }
  };

  return (
    <Layout>
      <section className="min-h-screen py-20 bg-gradient-to-br from-background via-black to-background">
        <div className="container mx-auto px-4 max-w-md">
          {/* Form Card */}
          <div className="bg-gradient-to-br from-card to-black border border-border rounded-xl p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-bold mb-2">
                {isLogin ? "Bienvenue" : "Rejoignez-Nous"}
              </h1>
              <p className="text-muted-foreground">
                {isLogin
                  ? "Connectez-vous à votre compte KDY Beauty"
                  : "Créez votre compte pour faire vos achats et réserver des services"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {/* Sign Up Fields */}
              {!isLogin && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">
                      Prénom
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required={!isLogin}
                        className="w-full bg-black border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        placeholder="Prénom"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">
                      Nom
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required={!isLogin}
                        className="w-full bg-black border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        placeholder="Nom"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Adresse Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-black border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Mot de Passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-black border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Confirmer le Mot de Passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!isLogin}
                      className="w-full bg-black border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full btn-primary mt-6 inline-flex items-center justify-center gap-2"
              >
                {isLogin ? "Se Connecter" : "Créer un Compte"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {error && (
              <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Ou continuer avec</span>
              </div>
            </div>

            {/* Social Login */}
            <button className="w-full bg-black border border-border rounded-lg py-3 font-semibold text-foreground hover:border-primary transition-colors mb-4">
              Continuer avec Google
            </button>

            {/* Toggle Form */}
            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                {isLogin ? "Pas encore de compte?" : "Vous avez déjà un compte?"}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 text-primary hover:text-secondary transition-colors font-semibold"
                >
                  {isLogin ? "S'inscrire" : "Se Connecter"}
                </button>
              </p>
            </div>

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center mt-6">
              En {isLogin ? "vous connectant" : "créant un compte"}, vous acceptez nos{" "}
              <a href="#" className="text-primary hover:underline">
                Conditions d'Utilisation
              </a>{" "}
              et notre{" "}
              <a href="#" className="text-primary hover:underline">
                Politique de Confidentialité
              </a>
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-6 bg-gradient-to-br from-card to-black border border-border rounded-xl text-center">
            <h3 className="font-semibold text-foreground mb-2">Besoin d'Aide?</h3>
            <p className="text-muted-foreground text-sm mb-3">
              Contactez notre équipe d'assistance
            </p>
            <a
              href="https://wa.me/2250777780290"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-secondary transition-colors font-semibold inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.031 2c-5.511 0-9.989 4.478-9.989 9.989 0 1.762.459 3.418 1.261 4.862l-1.343 4.908 5.023-1.318c1.405.765 3.006 1.197 4.71 1.197 5.512 0 9.989-4.478 9.989-9.989 0-5.511-4.477-9.989-9.989-9.989zm4.629 13.926c-.201.56-1.151 1.085-1.587 1.146-.436.061-.973.109-2.074-.329-1.1-.438-2.122-.924-3.003-1.705-1.144-.996-1.921-2.188-2.273-3.036-.352-.848-.014-1.309.284-1.611.298-.302.597-.704.896-1.056.299-.352.397-.56.597-.96.2-.4.1-.752-.05-1.056-.15-.304-1.344-3.235-1.841-4.437-.483-1.164-1.026-1.002-1.402-1.022-.376-.02-.806-.024-1.237-.024-.431 0-1.132.162-1.723.808-.591.646-2.26 2.211-2.26 5.39 0 3.179 2.312 6.249 2.634 6.683.322.434 4.551 6.946 11.024 9.736 1.54.664 2.742 1.06 3.68 1.358 1.547.489 2.954.42 4.067.254 1.245-.188 3.827-1.565 4.364-3.08.537-1.515.537-2.812.378-3.081-.158-.269-.583-.431-1.182-.731z"/>
              </svg>
              Discuter sur WhatsApp
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;
