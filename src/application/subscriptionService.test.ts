import { describe, expect, it, vi } from "vitest";
import { SubscriptionProjectionError } from "../domain/subscription";
import { SubscriptionService } from "./subscriptionService";
const projection = {
  subscription_id: "sub-1",
  plan_id: "plan-1",
  estado: "active",
  plan_pendiente: null,
  periodo_inicio: "2030-01-01T00:00:00Z",
  periodo_fin: "2030-02-01T00:00:00Z",
  past_due_at: null,
  grace_ends_at: null,
  canceled_at: null,
  purge_due_at: null,
  usage: {
    storage_bytes: 1,
    active_properties: 2,
    monthly_reconstruction_requests: 3,
    storage_bytes_limit: 10,
    active_properties_limit: 20,
    monthly_reconstruction_requests_limit: 30,
  },
} as const;
describe("SubscriptionService", () => {
  it("reads with lifecycle media type and normalizes", async () => {
    const request = vi.fn(async () => projection),
      service = new SubscriptionService({ request });
    await expect(service.getSubscription()).resolves.toEqual(projection);
    expect(request).toHaveBeenCalledWith("/api/v1/tenant/suscripcion", {
      method: "GET",
      headers: {
        Accept: "application/vnd.roomforge.subscription.lifecycle.v1+json",
      },
    });
  });
  it.each([
    ["changePlan", "/api/v1/tenant/cambiar-plan", { plan_id: "plan-2" }],
    ["cancel", "/api/v1/tenant/cancelar", {}],
    ["reactivate", "/api/v1/tenant/reactivar", {}],
  ] as const)("sends exact %s contract", async (action, path, body) => {
    const request = vi.fn(async () => projection),
      service = new SubscriptionService({ request });
    const calls = {
      changePlan: () => service.changePlan("plan-2"),
      cancel: () => service.cancel(),
      reactivate: () => service.reactivate(),
    };
    await calls[action]();
    expect(request).toHaveBeenCalledWith(path, { method: "POST", body });
  });
  it("rejects an untrusted action response", async () => {
    const service = new SubscriptionService({
      request: vi.fn(async () => ({ ...projection, tenant_id: "x" })),
    });
    await expect(service.cancel()).rejects.toBeInstanceOf(
      SubscriptionProjectionError,
    );
  });
});
