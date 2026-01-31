import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { WaveBackground } from '../components/ui/WaveBackground';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { api } from '../lib/axios';
import { db } from '../db/db';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const clearData = async () => {
      localStorage.removeItem('gadoapp_token');
      localStorage.removeItem('last_sync_herds');
      await db.herds.clear();
      await db.bovines.clear();
    };
    clearData();
  }, []);

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

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
      const endpoint = !isLogin ? '/auth/register' : '/auth/authenticate';
      const payload = !isLogin
        ? { name, email, password }
        : { email, password };

      const response = await api.post(endpoint, payload);

      login(response.data.token);
      toast.success(!isLogin ? "Conta criada com sucesso!" : "Bem-vindo de volta!");
      navigate('/');
    } catch (error: any) {
      console.error(error);
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 403 || status === 401) {
          toast.error("Email ou senha incorretos.");
        } else if (status === 400) {
          const firstError = Object.values(data)[0];
          toast.error(typeof firstError === 'string' ? firstError : "Dados inválidos.");
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

  return (
    <div className="min-h-screen relative overflow-hidden bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4 transition-colors duration-500">

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Animated Background */}
      <WaveBackground />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md bg-white/70 dark:bg-neutral-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-8 transition-all duration-300">

        {/* Header (Logo area) */}
        <div className="text-center mb-8">
          <div className="flex justify-center mx-auto mb-6">
            <img src="/logo-dark.svg" alt="GadoApp" className="h-20 w-auto dark:hidden" />
            <img src="/logo-light.svg" alt="GadoApp" className="h-20 w-auto hidden dark:block" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
            {isLogin ? 'Bem-vindo de volta' : 'Criar conta'}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm">
            Gerencie seu rebanho com eficiência
          </p>
        </div>

        {/* Form */}
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
            ) : (
              isLogin ? 'Entrar' : 'Cadastrar'
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setName('');
              setEmail('');
              setPassword('');
            }}
            className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
          </button>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="absolute bottom-4 text-center w-full z-10 opacity-60 text-xs text-neutral-500 dark:text-neutral-400">
        © {new Date().getFullYear()} GadoApp.
      </div>
    </div>
  );
}