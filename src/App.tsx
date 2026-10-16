import type React from "react";
import { Navigate, Route } from "react-router-dom";
import {
  IonApp,
  IonContent,
  IonLoading,
  IonRouterOutlet,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

import Home from "./pages/Home";
import Login from "./pages/Login";
import MyLibrary from "./pages/MyLibrary";
import MyFavorites from "./pages/MyFavorites";
import BookDetails from "./pages/BookDetails";
import { AuthProvider, useAuth } from "./contexts/AuthContext";


import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/palettes/dark.system.css";

setupIonicReact();

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <IonLoading isOpen message="Verificando sesión..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function LoginRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <IonLoading isOpen message="Cargando..." />;
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return <Login />;
}

function AppRoutes() {
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route
          path="/login"
          element={<LoginRoute />}
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <MyLibrary />
            </ProtectedRoute>
          }
        />

        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <MyFavorites />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book"
          element={
            <ProtectedRoute>
              <BookDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={<Navigate to="/home" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/home" replace />}
        />
      </IonRouterOutlet>
    </IonReactRouter>
  );
}

const App: React.FC = () => (
  <AuthProvider>
    <IonApp>
      <AppRoutes />
    </IonApp>
  </AuthProvider>
);

export default App;
