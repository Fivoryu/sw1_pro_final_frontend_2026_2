import {
  normalizeSubscriptionProjection,
  type SubscriptionProjection,
} from "../domain/subscription";
import type { ApiRequestOptions } from "../data/apiClient";
export interface SubscriptionRequester {
  request(
    path: string,
    options?: Omit<ApiRequestOptions, "accessToken">,
  ): Promise<unknown>;
}
const lifecycleType =
  "application/vnd.roomforge.subscription.lifecycle.v1+json";
export class SubscriptionService {
  constructor(private readonly session: SubscriptionRequester) {}
  async getSubscription(): Promise<SubscriptionProjection> {
    return normalizeSubscriptionProjection(
      await this.session.request("/api/v1/tenant/suscripcion", {
        method: "GET",
        headers: { Accept: lifecycleType },
      }),
    );
  }
  changePlan(planId: string) {
    return this.action("/api/v1/tenant/cambiar-plan", { plan_id: planId });
  }
  cancel() {
    return this.action("/api/v1/tenant/cancelar", {});
  }
  reactivate() {
    return this.action("/api/v1/tenant/reactivar", {});
  }
  private async action(
    path: string,
    body: unknown,
  ): Promise<SubscriptionProjection> {
    return normalizeSubscriptionProjection(
      await this.session.request(path, { method: "POST", body }),
    );
  }
}
