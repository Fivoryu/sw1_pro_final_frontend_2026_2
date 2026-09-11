import { describe, expect, it, vi } from "vitest";
import { ApiClient } from "./apiClient";

describe("HU-007 API", () => {
  it("sends invitation tokens only in request bodies", async () => {
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) =>
      new Response(JSON.stringify({ requires_password: true, expires_at: "2030-01-01T00:00:00Z" }), { status: 200, headers: { "Content-Type": "application/json" } }),
    );
    const api = new ApiClient({ baseUrl: "https://api.test", fetchImpl });
    await api.inspectAgentInvitation("secret-token");
    expect(fetchImpl.mock.calls[0][0]).toBe("https://api.test/api/v1/agent-invitations/inspect");
    expect(fetchImpl.mock.calls[0][1]).toMatchObject({ body: JSON.stringify({ token: "secret-token" }) });
    expect(String(fetchImpl.mock.calls[0][0])).not.toContain("secret-token");
  });

  it("provides authenticated listing and creation contracts", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify([]), { status: 200 }));
    const api = new ApiClient({ fetchImpl });
    await api.listAgentInvitations("access");
    await api.createAgentInvitation("access", " A@Example.COM ");
    expect(fetchImpl).toHaveBeenNthCalledWith(1, "/api/v1/tenant/agent-invitations", expect.objectContaining({ method: "GET" }));
    expect(fetchImpl).toHaveBeenNthCalledWith(2, "/api/v1/tenant/agent-invitations", expect.objectContaining({ body: JSON.stringify({ email: " A@Example.COM " }) }));
  });
});
