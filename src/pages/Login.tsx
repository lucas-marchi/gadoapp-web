import { useState } from 'react';
import { api } from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/authenticate';
      const payload = isRegister 
        ? { name: 'Usuário Teste', email, password } 
        : { email, password };
        
      const response = await api.post(endpoint, payload);
      
      login(response.data.token);
      navigate('/');
    } catch (error) {
      alert('Erro na autenticação!');
      console.error(error);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegister ? 'Criar Conta' : 'Entrar no Gadoapp'}
        </h2>
        
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        
        <input
          type="password"
          placeholder="Senha"
          className="w-full p-2 mb-6 border rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          {isRegister ? 'Cadastrar' : 'Entrar'}
        </button>
        
        <button 
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          className="w-full mt-4 text-sm text-blue-600 hover:underline"
        >
          {isRegister ? 'Já tenho conta' : 'Quero criar uma conta'}
        </button>
      </form>
    </div>
  );
}