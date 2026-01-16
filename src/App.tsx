import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Login } from './pages/Login';
import { Herds } from './pages/Herds';
import { Bovines } from './pages/Bovines';
import { useAuth } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import type { JSX } from 'react';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">Carregando...</div>;
  
  return isAuthenticated ? (
    <AppLayout>
      {children}
    </AppLayout>
  ) : <Navigate to="/login" />;
}

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
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
        <Route 
          path="/bovines" 
          element={
            <PrivateRoute>
              <Bovines />
            </PrivateRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default App;