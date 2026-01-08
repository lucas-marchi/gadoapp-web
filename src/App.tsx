import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Herds } from './pages/Herds';
import { useAuth } from './contexts/AuthContext';
import type { JSX } from 'react';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Herds />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
}

export default App;