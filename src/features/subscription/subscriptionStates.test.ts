import { describe, expect, it } from "vitest";
import {
  canCancel,
  canChangePlan,
  canReactivate,
  messageForSubscriptionError,
} from "./subscriptionStates";
describe("subscription lifecycle states", () => {
  it.each([
    ["active", true, true],
    ["past_due", true, true],
    ["suspended", true, true],
    ["trialing", false, false],
    ["canceled_read_only", false, false],
    ["purged", false, false],
  ] as const)("gates %s actions", (state, change, cancel) => {
    expect(canChangePlan(state)).toBe(change);
    expect(canCancel(state)).toBe(cancel);
  });
  it("only reactivates before purge", () => {
    expect(
      canReactivate(
        "canceled_read_only",
        "2030-01-02T00:00:00Z",
        new Date("2030-01-01"),
      ),
    ).toBe(true);
    expect(
      canReactivate(
        "canceled_read_only",
        "2029-01-01T00:00:00Z",
        new Date("2030-01-01"),
      ),
    ).toBe(false);
    expect(canReactivate("active", null, new Date("2030-01-01"))).toBe(false);
  });
  it.each([
    ["QUOTA_EXCEEDED", "Se alcanzó la cuota del plan."],
    [
      "SUBSCRIPTION_RESTRICTED",
      "La suscripción está restringida para esta operación.",
    ],
    ["TENANT_ADMIN_REQUIRED", "Se requiere un administrador del tenant."],
    [
      "SUBSCRIPTION_TRANSITION_NOT_ALLOWED",
      "La transición de suscripción no está permitida.",
    ],
  ] as const)("maps %s safely", (code, message) =>
    expect(messageForSubscriptionError({ code })).toBe(message),
  );
  it("uses stable fallback", () =>
    expect(messageForSubscriptionError(new Error("secret"))).toBe(
      "No se pudo completar la operación.",
    ));
});
