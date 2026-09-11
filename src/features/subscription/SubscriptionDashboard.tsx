import { useCallback, useEffect, useState } from "react";
import type { SubscriptionProjection } from "../../domain/subscription";
import {
  canCancel,
  canChangePlan,
  canReactivate,
  messageForSubscriptionError,
} from "./subscriptionStates";
export interface SubscriptionDashboardService {
  getSubscription(): Promise<SubscriptionProjection>;
  changePlan(planId: string): Promise<SubscriptionProjection>;
  cancel(): Promise<SubscriptionProjection>;
  reactivate(): Promise<SubscriptionProjection>;
}
const date = (value: string | null) =>
  value ? new Date(value).toLocaleString() : "—";
export function SubscriptionDashboard({
  service,
}: {
  service: SubscriptionDashboardService;
}) {
  const [subscription, setSubscription] = useState<SubscriptionProjection>(),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [planId, setPlanId] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const value = await service.getSubscription();
      setSubscription(value);
      setPlanId(value.plan_pendiente ?? value.plan_id);
    } catch (failure) {
      setError(
        failure &&
          typeof failure === "object" &&
          "code" in failure &&
          failure.code === "NO_SESSION"
          ? "No hay una sesión activa."
          : "No se pudo cargar la suscripción.",
      );
    } finally {
      setLoading(false);
    }
  }, [service]);
  useEffect(() => {
    void load();
  }, [load]);
  const run = async (operation: () => Promise<SubscriptionProjection>) => {
    setSaving(true);
    setError("");
    try {
      setSubscription(await operation());
    } catch (failure) {
      setError(messageForSubscriptionError(failure));
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <main className="page" aria-busy="true">
        <p role="status">Cargando suscripción…</p>
      </main>
    );
  if (!subscription)
    return (
      <main className="page" aria-busy="false">
        <div className="feedback error" role="alert">
          {error}
          <button type="button" onClick={() => void load()}>
            Reintentar
          </button>
        </div>
      </main>
    );
  const changeAllowed = canChangePlan(subscription.estado),
    cancelAllowed = canCancel(subscription.estado),
    reactivateAllowed = canReactivate(
      subscription.estado,
      subscription.purge_due_at,
    );
  return (
    <main className="page" aria-busy={saving}>
      <header className="page-header">
        <p className="eyebrow">Cuenta del tenant</p>
        <h1>Suscripción</h1>
        <p>Estado actual y uso de los recursos contratados.</p>
      </header>
      {error && (
        <div className="feedback error" role="alert">
          {error}
          <button type="button" onClick={() => void load()}>
            Reintentar
          </button>
        </div>
      )}
      <section className="card" aria-labelledby="subscription-summary">
        <h2 id="subscription-summary">Resumen</h2>
        <p>
          <strong>Plan actual:</strong> {subscription.plan_id}
        </p>
        <p>
          <strong>Plan pendiente:</strong> {subscription.plan_pendiente ?? "—"}
        </p>
        <p>
          <strong>Estado:</strong> {subscription.estado}
        </p>
        <p>
          <strong>Período:</strong> {date(subscription.periodo_inicio)} —{" "}
          {date(subscription.periodo_fin)}
        </p>
        <h3>Uso y cuotas</h3>
        <ul>
          <li>
            Almacenamiento: {subscription.usage.storage_bytes} /{" "}
            {subscription.usage.storage_bytes_limit}
          </li>
          <li>
            Inmuebles activos: {subscription.usage.active_properties} /{" "}
            {subscription.usage.active_properties_limit}
          </li>
          <li>
            Reconstrucciones mensuales:{" "}
            {subscription.usage.monthly_reconstruction_requests} /{" "}
            {subscription.usage.monthly_reconstruction_requests_limit}
          </li>
        </ul>
      </section>
      <section className="card" aria-labelledby="subscription-actions">
        <h2 id="subscription-actions">Acciones</h2>
        {changeAllowed && (
          <div className="field">
            <label htmlFor="plan-id">Nuevo plan</label>
            <input
              id="plan-id"
              value={planId}
              onChange={(event) => setPlanId(event.target.value)}
            />
            <button
              type="button"
              onClick={() => void run(() => service.changePlan(planId))}
              disabled={saving || !planId}
            >
              Cambiar plan
            </button>
          </div>
        )}
        {cancelAllowed && (
          <button
            type="button"
            onClick={() => void run(() => service.cancel())}
            disabled={saving}
          >
            Cancelar suscripción
          </button>
        )}
        {reactivateAllowed && (
          <button
            type="button"
            onClick={() => void run(() => service.reactivate())}
            disabled={saving}
          >
            Reactivar suscripción
          </button>
        )}
        {!changeAllowed && !cancelAllowed && !reactivateAllowed && (
          <p role="status">No hay acciones disponibles para este estado.</p>
        )}
      </section>
    </main>
  );
}
