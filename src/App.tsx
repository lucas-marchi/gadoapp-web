import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Login } from "./pages/Login";
import { Herds } from "./pages/Herds";
import { Bovines } from "./pages/Bovines";
import { Dashboard } from "./pages/Dashboard";

import { PrivateRoute } from "./components/auth/PrivateRoute";

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
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/herds"
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
