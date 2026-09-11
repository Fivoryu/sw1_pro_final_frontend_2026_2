import { useState, type FormEvent } from "react";
import type { LoginCredentials } from "../../data/apiClient";
export interface LoginSession {
  login(credentials: LoginCredentials): Promise<void>;
}
export function LoginPage({
  session,
  onAuthenticated,
}: {
  session: LoginSession;
  onAuthenticated: () => void;
}) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
      correo: "",
      password: "",
    }),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(false);
  const login = async () => {
    setLoading(true);
    setError(false);
    try {
      await session.login(credentials);
      onAuthenticated();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void login();
  };
  return (
    <main className="page" aria-busy={loading}>
      <header className="page-header">
        <p className="eyebrow">Acceso seguro</p>
        <h1>Iniciar sesión</h1>
        <p>Acceda al panel de administración de su tenant.</p>
      </header>
      <section className="card" aria-labelledby="login-title">
        <h2 id="login-title">Credenciales</h2>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="correo">Correo</label>
            <input
              id="correo"
              name="correo"
              type="email"
              autoComplete="email"
              value={credentials.correo}
              onChange={(e) =>
                setCredentials({ ...credentials, correo: e.target.value })
              }
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              required
            />
          </div>
          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
        {loading && <p role="status">Iniciando sesión…</p>}
        {error && (
          <div className="feedback error" role="alert">
            No se pudo iniciar sesión. Revise sus credenciales e intente
            nuevamente.{" "}
            <button type="button" onClick={() => void login()}>
              Reintentar
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
