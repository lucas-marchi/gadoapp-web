import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { FarmProvider } from "./contexts/FarmContext.tsx";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";

// Placeholder ID - User must replace this in .env
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark" storageKey="gadoapp-theme">
          <AuthProvider>
            <FarmProvider>
              <App />
            </FarmProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
