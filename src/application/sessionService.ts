import {
  ApiClientError,
  type ApiRequestOptions,
  type LoginCredentials,
  type TokenResponse,
} from "../data/apiClient";
export interface SessionApi {
  login(credentials: LoginCredentials): Promise<TokenResponse>;
  refresh(refreshToken: string): Promise<TokenResponse>;
  logout(refreshToken: string): Promise<void>;
  request(path: string, options?: ApiRequestOptions): Promise<unknown>;
}
export class SessionService {
  private tokens: TokenResponse | null = null;
  private refreshPromise: Promise<void> | null = null;
  constructor(private readonly api: SessionApi) {}
  async login(credentials: LoginCredentials): Promise<void> {
    try {
      this.tokens = await this.api.login(credentials);
    } catch (error) {
      this.tokens = null;
      throw this.safeError(error);
    }
  }
  refresh(): Promise<void> {
    if (this.refreshPromise) return this.refreshPromise;
    const refreshToken = this.tokens?.refresh_token;
    if (!refreshToken) return Promise.reject(new ApiClientError("NO_SESSION"));
    this.refreshPromise = this.safe(() => this.api.refresh(refreshToken))
      .then((tokens) => {
        this.tokens = tokens;
      })
      .catch((error: unknown) => {
        this.tokens = null;
        throw error;
      })
      .finally(() => {
        this.refreshPromise = null;
      });
    return this.refreshPromise;
  }
  async logout(): Promise<void> {
    const refreshToken = this.tokens?.refresh_token;
    if (!refreshToken) {
      this.tokens = null;
      return;
    }
    try {
      await this.safe(() => this.api.logout(refreshToken));
    } finally {
      this.tokens = null;
    }
  }
  async request<T>(
    path: string,
    options: Omit<ApiRequestOptions, "accessToken"> = {},
  ): Promise<T> {
    const accessToken = this.tokens?.access_token;
    if (!accessToken) throw new ApiClientError("NO_SESSION");
    try {
      return (await this.api.request(path, { ...options, accessToken })) as T;
    } catch (error) {
      const failure = this.safeError(error);
      if (failure.status !== 401) throw failure;
      if (this.tokens?.access_token === accessToken) await this.refresh();
      const retryToken = this.tokens?.access_token;
      if (!retryToken) throw new ApiClientError("NO_SESSION");
      try {
        return (await this.api.request(path, {
          ...options,
          accessToken: retryToken,
        })) as T;
      } catch (retryError) {
        throw this.safeError(retryError);
      }
    }
  }
  isAuthenticated(): boolean {
    return this.tokens !== null;
  }
  getAccessToken(): string | null {
    return this.tokens?.access_token ?? null;
  }
  getRefreshToken(): string | null {
    return this.tokens?.refresh_token ?? null;
  }
  private async safe<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw this.safeError(error);
    }
  }
  private safeError(error: unknown): ApiClientError {
    return error instanceof ApiClientError
      ? error
      : new ApiClientError("NETWORK_ERROR");
  }
}
