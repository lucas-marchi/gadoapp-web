import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { AppLayout } from "../../layouts/AppLayout";
import type { JSX } from "react";

export function PrivateRoute({ children }: { children: JSX.Element }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading)
        return (
            <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900 text-neutral-500">
                Carregando...
            </div>
        );

    return isAuthenticated ? (
        <AppLayout>{children}</AppLayout>
    ) : (
        <Navigate to="/login" />
    );
}
