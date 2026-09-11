import { describe, expect, it, vi } from "vitest";
import { ApiClientError, type TokenResponse } from "../data/apiClient";
import { SessionService, type SessionApi } from "./sessionService";
const first: TokenResponse = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  expira_en: "2030-01-01T00:00:00Z",
};
const next: TokenResponse = {
  ...first,
  access_token: "next-access",
  refresh_token: "next-refresh",
};
const credentials = { correo: "admin@example.test", password: "password123" };
const makeApi = (): SessionApi => ({
  login: vi.fn(async () => first),
  refresh: vi.fn(async () => next),
  logout: vi.fn(async () => undefined),
  request: vi.fn(async () => ({ ok: true })),
});
const loggedIn = async (api = makeApi()) => {
  const service = new SessionService(api);
  await service.login(credentials);
  return { api, service };
};
describe("SessionService", () => {
  it("keeps tokens in memory and replaces both atomically on refresh", async () => {
    const { service } = await loggedIn();
    expect([service.getAccessToken(), service.getRefreshToken()]).toEqual([
      first.access_token,
      first.refresh_token,
    ]);
    expect(localStorage.length).toBe(0);
    await service.refresh();
    expect([service.getAccessToken(), service.getRefreshToken()]).toEqual([
      next.access_token,
      next.refresh_token,
    ]);
  });
  it("shares one refresh promise and retries each original request once", async () => {
    const { api, service } = await loggedIn();
    let release!: (value: TokenResponse) => void;
    api.refresh = vi.fn(
      () =>
        new Promise<TokenResponse>((resolve) => {
          release = resolve;
        }),
    );
    api.request = vi.fn(async (_path, options) =>
      options?.accessToken === first.access_token
        ? Promise.reject(new ApiClientError("UNAUTHORIZED", 401))
        : { ok: true },
    );
    const one = service.request<{ ok: boolean }>("/one");
    const two = service.request<{ ok: boolean }>("/two");
    await vi.waitFor(() => expect(api.refresh).toHaveBeenCalledTimes(1));
    release(next);
    await expect(Promise.all([one, two])).resolves.toEqual([
      { ok: true },
      { ok: true },
    ]);
    expect(api.request).toHaveBeenCalledTimes(4);
  });
  it("does not refresh again after the bounded retry also gets 401", async () => {
    const { api, service } = await loggedIn();
    api.request = vi.fn(async () => {
      throw new ApiClientError("UNAUTHORIZED", 401);
    });
    await expect(service.request("/protected")).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(api.refresh).toHaveBeenCalledTimes(1);
    expect(api.request).toHaveBeenCalledTimes(2);
  });
  it("clears memory and never recursively retries refresh, logout, or login", async () => {
    const { api, service } = await loggedIn();
    api.refresh = vi.fn(async () => {
      throw new ApiClientError("UNAUTHORIZED", 401);
    });
    await expect(service.refresh()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(api.refresh).toHaveBeenCalledTimes(1);
    expect(service.isAuthenticated()).toBe(false);
    await service.login(credentials);
    api.logout = vi.fn(async () => {
      throw new ApiClientError("NETWORK_ERROR");
    });
    await expect(service.logout()).rejects.toMatchObject({
      code: "NETWORK_ERROR",
    });
    expect(api.logout).toHaveBeenCalledTimes(1);
    expect(service.isAuthenticated()).toBe(false);
    await service.login(credentials);
    api.login = vi.fn(async () => {
      throw new ApiClientError("UNAUTHORIZED", 401);
    });
    await expect(service.login(credentials)).rejects.toThrow();
    expect(api.login).toHaveBeenCalledTimes(1);
    expect(service.isAuthenticated()).toBe(false);
  });
});
