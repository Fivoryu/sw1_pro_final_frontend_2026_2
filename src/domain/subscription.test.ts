import { describe, expect, it } from "vitest";
import { normalizeSubscriptionProjection, type SubscriptionProjection } from "./subscription";
const projection = JSON.parse('{"subscription_id":"sub-1","plan_id":"plan-1","estado":"active","plan_pendiente":null,"periodo_inicio":"2030-01-01T00:00:00Z","periodo_fin":"2030-02-01T00:00:00Z","past_due_at":null,"grace_ends_at":null,"canceled_at":null,"purge_due_at":null,"usage":{"storage_bytes":10,"active_properties":1,"monthly_reconstruction_requests":2,"storage_bytes_limit":100,"active_properties_limit":5,"monthly_reconstruction_requests_limit":10}}') as SubscriptionProjection;
describe("subscription projection", () => {
  it("normalizes the exact approved lifecycle projection", () => expect(normalizeSubscriptionProjection(projection)).toEqual(projection));
  it("rejects extra fields and invalid non-negative usage", () => {
    for (const invalid of [{ ...projection, tenant_id: "secret" }, { ...projection, usage: { ...projection.usage, storage_bytes: -1 } }]) expect(() => normalizeSubscriptionProjection(invalid)).toThrow();
  });
});
