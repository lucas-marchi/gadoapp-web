import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { db } from '../db/db';

export function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  useEffect(() => {
    const clearData = async () => {
      localStorage.removeItem('gadoapp_token');
      localStorage.removeItem('last_sync_herds');
      await db.herds.clear();
      await db.bovines.clear();
    };
    clearData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
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
    if (isRegister && !name.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/authenticate';
      const payload = isRegister 
        ? { name, email, password } 
        : { email, password };
        
      const response = await api.post(endpoint, payload);
      
      login(response.data.token);
      toast.success(isRegister ? "Conta criada com sucesso!" : "Bem-vindo de volta!");
      navigate('/'); 
    } catch (error: any) {
      console.error(error);
      
      // Tratamento de erros vindos do Backend (Validation ou Auth)
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 403 || status === 401) {
          toast.error("Email ou senha incorretos.");
        } else if (status === 400) {
          // Erros de validação do Spring (Map<String, String>)
          // Pega a primeira mensagem de erro que encontrar
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
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-700">
        
        <div className="text-center mb-8">
          <div className="flex justify-center mx-auto mb-6">
            <img src="/logo-dark.svg" alt="GadoApp" className="h-16 w-auto dark:hidden" />
            <img src="/logo-light.svg" alt="GadoApp" className="h-16 w-auto hidden dark:block" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">
            {isRegister ? 'Crie sua conta' : 'Acesse o GadoApp'}
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2">
            {isRegister ? 'Comece a gerenciar seu rebanho hoje.' : 'Gerencie seu gado de qualquer lugar.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Nome</label>
              <input
                type="text"
                placeholder="Seu nome completo"
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
            <input
              type="email"
              placeholder="exemplo@email.com"
              className="w-full p-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary-200 dark:shadow-none hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processando...
              </>
            ) : (
              isRegister ? 'Cadastrar' : 'Entrar'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setName('');
              setEmail('');
              setPassword('');
            }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors"
          >
            {isRegister ? 'Já tenho uma conta' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
}