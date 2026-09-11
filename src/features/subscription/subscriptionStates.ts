const messages: Record<string, string> = { QUOTA_EXCEEDED: "Se alcanzó la cuota del plan.", SUBSCRIPTION_RESTRICTED: "La suscripción está restringida para esta operación.", TENANT_ADMIN_REQUIRED: "Se requiere un administrador del tenant.", SUBSCRIPTION_TRANSITION_NOT_ALLOWED: "La transición de suscripción no está permitida." };
export const canChangePlan = (state: string) => ["active", "past_due", "suspended"].includes(state);
export const canCancel = canChangePlan;
export const canReactivate = (state: string, purgeDueAt: string | null, now = new Date()) => state === "canceled_read_only" && !!purgeDueAt && now < new Date(purgeDueAt);
export const messageForSubscriptionError = (error: unknown) => { const code = error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code : ""; return messages[code] ?? "No se pudo completar la operación."; };
