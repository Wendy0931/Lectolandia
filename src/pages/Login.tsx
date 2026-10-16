import { useState } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../config/supabaseClient";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setMessage("");
    setError("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError("Completa el correo electrónico y la contraseña.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        const { data, error: authError } =
          await supabase.auth.signUp({
            email: normalizedEmail,
            password,
          });

        if (authError) throw authError;

        if (data.session) {
          navigate("/home", { replace: true });
        } else {
          setMessage(
            "Registro enviado. Revisa tu correo para confirmar la cuenta antes de iniciar sesión."
          );
        }
      } else {
        const { error: authError } =
          await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

        if (authError) throw authError;

        navigate("/home", { replace: true });
      }
    } catch (err) {
      console.error("Error de autenticación:", err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo completar la operación."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      {/* Header moderno azul pastel alineado con Home y Favorites */}
      <IonHeader className="custom-header ion-no-border">
        <IonToolbar className="custom-toolbar">
          <IonTitle className="custom-title">📖 Lectolandia</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="login-content">
        <div className="login-container">
          <div className="login-heading">
            <h1>{isRegistering ? "Crear cuenta" : "Bienvenido"}</h1>

            <p>
              {isRegistering
                ? "Regístrate para guardar tu biblioteca personal."
                : "Inicia sesión para continuar con tus lecturas."}
            </p>
          </div>

          <div className="login-form">
            <div className="input-group">
              <label className="custom-label">Correo electrónico</label>
              <IonInput
                type="email"
                autocomplete="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onIonInput={(event) =>
                  setEmail(event.detail.value ?? "")
                }
                required
              />
            </div>

            <div className="input-group">
              <label className="custom-label">Contraseña</label>
              <IonInput
                type="password"
                autocomplete={
                  isRegistering ? "new-password" : "current-password"
                }
                placeholder="Mínimo 8 caracteres"
                value={password}
                onIonInput={(event) =>
                  setPassword(event.detail.value ?? "")
                }
                required
              />
            </div>

            <IonButton
              className="login-submit-btn"
              expand="block"
              onClick={() => void handleSubmit()}
              disabled={loading}
            >
              {loading
                ? "Procesando..."
                : isRegistering
                  ? "Registrarme"
                  : "Iniciar sesión"}
            </IonButton>

            {message && (
              <IonText color="success">
                <p role="status" style={{ textAlign: "center", fontWeight: 600 }}>{message}</p>
              </IonText>
            )}

            {error && (
              <IonText color="danger">
                <p role="alert" style={{ textAlign: "center", fontWeight: 600 }}>{error}</p>
              </IonText>
            )}

            <div className="login-switch">
              <IonText color="medium">
                <p className="switch-text">
                  {isRegistering
                    ? "¿Ya tienes una cuenta?"
                    : "¿Todavía no tienes una cuenta?"}
                </p>
              </IonText>

              <IonButton
                className="switch-btn"
                fill="clear"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setMessage("");
                  setError("");
                }}
              >
                {isRegistering ? "Iniciar sesión" : "Crear cuenta"}
              </IonButton>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default Login;