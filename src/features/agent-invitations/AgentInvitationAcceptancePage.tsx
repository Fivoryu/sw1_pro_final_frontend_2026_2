import { useCallback, useEffect, useState, type FormEvent } from "react";
import { UserManagementService } from "../../application/userManagementService";
import { messageForAgentInvitationError } from "../../data/apiClient";

const tokenFromHash = () =>
  new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
const unavailableMessage = "El enlace no es válido o ya no está disponible.";

export function AgentInvitationAcceptancePage({
  service,
}: {
  service: UserManagementService;
}) {
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inspected, setInspected] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inspect = useCallback(async () => {
    const token = tokenFromHash();
    setLoading(true);
    setError("");
    setInspected(false);
    if (!token) {
      setError(unavailableMessage);
      setLoading(false);
      return;
    }
    try {
      const result = await service.inspectInvitation(token);
      setRequiresPassword(result.requires_password);
      setInspected(true);
    } catch (failure) {
      setError(messageForAgentInvitationError(failure));
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    void inspect();
  }, [inspect]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      await service.acceptInvitation(
        tokenFromHash(),
        requiresPassword ? password : undefined,
        requiresPassword ? confirmation : undefined,
      );
      setMessage(
        "La invitación fue aceptada. La membresía queda pendiente de activación.",
      );
    } catch (failure) {
      setError(messageForAgentInvitationError(failure));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page" aria-busy={loading || saving}>
      <header className="page-header">
        <p className="eyebrow">Incorporación administrada</p>
        <h1>Aceptar invitación</h1>
        <p>
          Completa la incorporación al tenant. No se activa el acceso
          automáticamente.
        </p>
      </header>
      {loading && <p role="status">Validando invitación…</p>}
      {error && <p className="feedback error" role="alert">{error}</p>}
      {!loading && !inspected && !message && error && (
        <button type="button" onClick={() => void inspect()}>
          Reintentar validación
        </button>
      )}
      {!loading && inspected && !message && (
        <form onSubmit={submit} className="card">
          {requiresPassword && (
            <>
              <label htmlFor="invitation-password">Contraseña</label>
              <input
                id="invitation-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
              <label htmlFor="invitation-confirmation">
                Confirmar contraseña
              </label>
              <input
                id="invitation-confirmation"
                type="password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </>
          )}
          <button className="primary" type="submit" disabled={saving}>
            {error ? "Reintentar aceptación" : "Aceptar invitación"}
          </button>
        </form>
      )}
      {message && <p className="feedback success" role="status">{message}</p>}
    </main>
  );
}
