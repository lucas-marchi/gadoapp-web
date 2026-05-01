import { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Label } from "../components/ui/Label";
import { Input } from "../components/ui/Input";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { WaveBackground } from "../components/ui/WaveBackground";
import { SocialButton } from "../components/ui/SocialButton";
import { Divider } from "../components/ui/Divider";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "../lib/axios";
import { db } from "../db/db";

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const clearData = async () => {
      localStorage.removeItem("gadoapp_token");
      localStorage.removeItem("last_sync_herds");
      await db.herds.clear();
      await db.bovines.clear();
    };
    clearData();
  }, []);

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleSocialLogin = (provider: "google" | "facebook") => {
    // Mock handler - would integrate with OAuth flow here
    toast.info(`Login com ${provider} em breve!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Email inválido.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (!isLogin && !name.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = !isLogin ? "/auth/register" : "/auth/authenticate";
      const payload = !isLogin
        ? { name, email, password }
        : { email, password };

      const response = await api.post(endpoint, payload);

      login(response.data.token);
      toast.success(
        !isLogin ? "Conta criada com sucesso!" : "Bem-vindo de volta!",
      );
      navigate("/");
    } catch (error: any) {
      console.error(error);
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 403 || status === 401) {
          toast.error("Email ou senha incorretos.");
        } else if (status === 400) {
          const firstError = Object.values(data)[0];
          toast.error(
            typeof firstError === "string" ? firstError : "Dados inválidos.",
          );
        } else {
          toast.error("Erro no servidor. Tente novamente.");
        }
      } else {
        toast.error("Erro de conexão. Verifique sua internet.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login
  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        // Backend connection
        const { data } = await api.post("/auth/social-login", {
          provider: "google",
          token: tokenResponse.access_token,
        });
        login(data.token);
        toast.success("Login com Google realizado!");
        navigate("/");
      } catch (error) {
        console.error("Google Login Error:", error);
        toast.error("Falha ao autenticar com Google.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => toast.error("Login com Google cancelado."),
  });

  // Facebook Login
  const handleFacebookResponse = async (response: any) => {
    if (response.accessToken) {
      try {
        setIsLoading(true);
        const { data } = await api.post("/auth/social-login", {
          provider: "facebook",
          token: response.accessToken,
        });
        login(data.token);
        toast.success("Login com Facebook realizado!");
        navigate("/");
      } catch (error) {
        console.error("Facebook Login Error:", error);
        toast.error("Falha ao autenticar com Facebook.");
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("Login com Facebook falhou.");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4 transition-colors duration-500">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <WaveBackground />

      <div className="relative z-10 w-full max-w-md bg-white/70 dark:bg-neutral-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-8 transition-all duration-300">
        <div className="text-center mb-6">
          <div className="flex justify-center mx-auto mb-6">
            <img
              src="/logo-dark.svg"
              alt="GadoApp"
              className="h-20 w-auto dark:hidden"
            />
            <img
              src="/logo-light.svg"
              alt="GadoApp"
              className="h-20 w-auto hidden dark:block"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
            {isLogin ? "Bem-vindo de volta" : "Criar conta"}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm">
            Gerencie seu rebanho com eficiência
          </p>
        </div>

        {/* Social Login Section */}
        <div className="space-y-3 mb-6">
          <SocialButton
            variant="google"
            onClick={() => loginGoogle()}
            icon={
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
            }
          >
            Continuar com Google
          </SocialButton>

          <FacebookLogin
            appId={import.meta.env.VITE_FACEBOOK_APP_ID || "YOUR_FB_APP_ID"}
            onFail={(error) => console.log("Login Failed!", error)}
            onProfileSuccess={(response) =>
              console.log("Get Profile Success!", response)
            }
            onSuccess={handleFacebookResponse}
            render={({ onClick }) => (
              <SocialButton
                variant="facebook"
                onClick={onClick}
                icon={
                  <img
                    src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                    alt="Facebook"
                    className="w-5 h-5 brightness-0 invert"
                  />
                }
              >
                Continuar com Facebook
              </SocialButton>
            )}
          />
        </div>

        {/* Email Toggle & Form */}
        {!showEmailForm ? (
          <div className="relative my-6 text-center">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-neutral-200 dark:border-neutral-700/50"></div>
            </div>
            <div className="relative flex justify-center">
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="bg-white dark:bg-neutral-800 px-4 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors font-medium outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 rounded-full"
              >
                Ou continue com email
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-top-4 fade-in duration-300">
            <Divider className="mb-6">preencha seus dados</Divider>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1.5">
                  <Label>Nome Completo</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="bg-white/50 dark:bg-neutral-900/50"
                    autoFocus
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="bg-white/50 dark:bg-neutral-900/50"
                  autoFocus={isLogin}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/50 dark:bg-neutral-900/50"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all duration-200 mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processando...
                  </>
                ) : isLogin ? (
                  "Entrar com Email"
                ) : (
                  "Cadastrar com Email"
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="w-full text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors text-center mt-2"
              >
                Voltar para opções sociais
              </button>
            </form>
          </div>
        )}

        {/* Footer Toggle */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setName("");
              setEmail("");
              setPassword("");
            }}
            className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
          >
            {isLogin
              ? "Não tem uma conta? Cadastre-se"
              : "Já tem uma conta? Entre"}
          </button>
        </div>
      </div>
      {/* Removed Footer Copyright because it covered the wave animation and was not requested */}
    </div>
  );
}
