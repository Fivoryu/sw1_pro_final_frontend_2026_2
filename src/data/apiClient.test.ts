import { describe, expect, it, vi } from "vitest";
import { ApiClient, ApiClientError, type TokenResponse } from "./apiClient";
const tokenPair: TokenResponse = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  expira_en: "2030-01-01T00:00:00Z",
};
const response = (status: number, body?: unknown) =>
  new Response(body === undefined ? undefined : JSON.stringify(body), {
    status,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
  });
const credentials = { correo: "admin@example.test", password: "password123" };
describe("ApiClient", () => {
  it("uses exact auth contracts, protected headers, and no token URLs", async () => {
    const fetchImpl = vi
        .fn()
        .mockResolvedValueOnce(response(200, tokenPair))
        .mockResolvedValueOnce(
          response(200, { ...tokenPair, access_token: "next-access" }),
        )
        .mockResolvedValueOnce(response(204))
        .mockResolvedValueOnce(response(200, {})),
      client = new ApiClient({
        baseUrl: "https://api.example.test",
        fetchImpl,
      });
    await client.login(credentials);
    await client.refresh(tokenPair.refresh_token);
    await client.logout(tokenPair.refresh_token);
    await client.request("/protected", { accessToken: tokenPair.access_token });
    (
      [
        ["/api/v1/auth/login", JSON.stringify(credentials)],
        [
          "/api/v1/auth/refresh",
          JSON.stringify({ refresh_token: tokenPair.refresh_token }),
        ],
        [
          "/api/v1/auth/logout",
          JSON.stringify({ refresh_token: tokenPair.refresh_token }),
        ],
      ] as const
    ).forEach(([path, body], index) =>
      expect(fetchImpl).toHaveBeenNthCalledWith(
        index + 1,
        `https://api.example.test${path}`,
        expect.objectContaining({ body }),
      ),
    );
    expect(
      (fetchImpl.mock.calls[3][1]?.headers as Headers).get("Authorization"),
    ).toBe(`Bearer ${tokenPair.access_token}`);
    for (const [url] of fetchImpl.mock.calls)
      expect(url).not.toContain(tokenPair.refresh_token);
  });
  it("maps HTTP, network, and malformed responses to safe stable errors", async () => {
    const secret = "response-secret",
      cases = [
        [
          vi.fn(async () =>
            response(409, { code: "QUOTA_EXCEEDED", detail: secret }),
          ),
          "QUOTA_EXCEEDED",
        ],
        [vi.fn(async () => response(401, { detail: secret })), "UNAUTHORIZED"],
        [
          vi.fn(async () => {
            throw new Error(secret);
          }),
          "NETWORK_ERROR",
        ],
        [
          vi.fn(async () => response(200, { access_token: secret })),
          "INVALID_RESPONSE",
        ],
      ] as const;
    for (const [fetchImpl, code] of cases) {
      const failure = await new ApiClient({ fetchImpl })
        .login(credentials)
        .catch((error: unknown) => error);
      expect(failure).toBeInstanceOf(ApiClientError);
      expect(failure).toMatchObject({ code });
      expect((failure as Error).message).not.toContain(secret);
    }
  });
});
