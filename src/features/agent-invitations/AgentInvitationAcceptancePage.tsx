import { useEffect, useState, type FormEvent } from "react";
import { UserManagementService } from "../../application/userManagementService";

const tokenFromHash = () => new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";

export function AgentInvitationAcceptancePage({ service }: { service: UserManagementService }) {
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const token = tokenFromHash();
    if (!token) { setError("El enlace no es válido o ya no está disponible."); setLoading(false); return; }
    void service.inspectInvitation(token).then(({ requires_password }) => setRequiresPassword(requires_password)).catch(() => setError("El enlace no es válido o ya no está disponible.")).finally(() => setLoading(false));
  }, [service]);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    try {
      await service.acceptInvitation(tokenFromHash(), requiresPassword ? password : undefined, requiresPassword ? confirmation : undefined);
      setMessage("La invitación fue aceptada. La membresía queda pendiente de activación.");
    } catch { setError("El enlace no es válido o ya no está disponible."); }
  };
  return <main className="page" aria-busy={loading}>
    <header className="page-header"><p className="eyebrow">Incorporación administrada</p><h1>Aceptar invitación</h1><p>Completa la incorporación al tenant. No se activa el acceso automáticamente.</p></header>
    {loading && <p role="status">Validando invitación…</p>}
    {error && <p className="feedback error" role="alert">{error}</p>}
    {!loading && !error && !message && <form onSubmit={submit} className="card">
      {requiresPassword && <><label htmlFor="invitation-password">Contraseña</label><input id="invitation-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required minLength={8} /><label htmlFor="invitation-confirmation">Confirmar contraseña</label><input id="invitation-confirmation" type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="new-password" required minLength={8} /></>}
      <button className="primary" type="submit">Aceptar invitación</button>
    </form>}
    {message && <p className="feedback success" role="status">{message}</p>}
  </main>;
}
