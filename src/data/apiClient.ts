export type LoginCredentials = Readonly<Record<"correo" | "password", string>>;
export type AgentInvitation = Readonly<{ id: string; email: string; status: "pending" | "accepted" | "invalidated" | "expired"; expires_at: string; delivery_status: "pending" | "delivered" | "failed" }>;
export type AgentInvitationInspection = Readonly<{ requires_password: boolean; expires_at: string }>;
export type AgentInvitationAcceptance = Readonly<{ invitation_status: "accepted"; membership_status: "pending"; membership_id: string }>;
export type TokenResponse = Readonly<
  Record<"access_token" | "refresh_token" | "expira_en", string>
>;
export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  accessToken?: string;
};
export type FetchImplementation = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;
const messages = {
  UNAUTHORIZED: "The request was not authorized.",
  FORBIDDEN: "The request was forbidden.",
  NOT_FOUND: "The requested resource was not found.",
  CONFLICT: "The request could not be completed.",
  INVALID_REQUEST: "The request was invalid.",
  SERVER_ERROR: "The service is unavailable.",
  QUOTA_EXCEEDED: "The subscription quota was exceeded.",
  SUBSCRIPTION_RESTRICTED: "The subscription is restricted.",
  TENANT_ADMIN_REQUIRED: "A tenant administrator is required.",
  SUBSCRIPTION_TRANSITION_NOT_ALLOWED:
    "The subscription transition is not allowed.",
  INVITATION_UNAVAILABLE: "The invitation is no longer available.",
  INVITATION_PASSWORD_REQUIRED: "A valid invitation password is required.",
  AGENT_MEMBERSHIP_EXISTS: "The agent is already associated with this tenant.",
  INVALID_EMAIL: "The email address is invalid.",
  CLIENT_AUTHORITY_FIELD_FORBIDDEN: "Tenant authority cannot be supplied by the client.",
  NETWORK_ERROR: "The service could not be reached.",
  INVALID_RESPONSE: "The service returned an invalid response.",
  NO_SESSION: "There is no active session.",
} as const;
export type ApiErrorCode = keyof typeof messages;
export interface ApiClientOptions {
  readonly baseUrl?: string;
  readonly fetchImpl?: FetchImplementation;
}
export class ApiClientError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    readonly status?: number,
  ) {
    super(messages[code]);
    this.name = "ApiClientError";
  }
}
const statusCodes: Partial<Record<number, ApiErrorCode>> = {
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
};
const errorCode = (status: number): ApiErrorCode =>
  statusCodes[status] ??
  (status >= 400 && status < 500 ? "INVALID_REQUEST" : "SERVER_ERROR");
const backendCodes = new Set<ApiErrorCode>([
  "QUOTA_EXCEEDED",
  "SUBSCRIPTION_RESTRICTED",
  "TENANT_ADMIN_REQUIRED",
  "SUBSCRIPTION_TRANSITION_NOT_ALLOWED",
  "INVITATION_UNAVAILABLE",
  "INVITATION_PASSWORD_REQUIRED",
  "AGENT_MEMBERSHIP_EXISTS",
  "INVALID_EMAIL",
  "CLIENT_AUTHORITY_FIELD_FORBIDDEN",
]);
const readBackendCode = async (
  response: Response,
): Promise<ApiErrorCode | undefined> => {
  try {
    const value = await response.json(),
      code =
        value && typeof value === "object" && "code" in value
          ? value.code
          : undefined;
    return typeof code === "string" && backendCodes.has(code as ApiErrorCode)
      ? (code as ApiErrorCode)
      : undefined;
  } catch {
    return undefined;
  }
};
const isTokenResponse = (value: unknown): value is TokenResponse => {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    Object.keys(record).length === 3 &&
    ["access_token", "refresh_token", "expira_en"].every(
      (key) => typeof record[key] === "string",
    ) &&
    !!record.access_token &&
    !!record.refresh_token
  );
};
const encodeBody = (body: unknown): BodyInit | null | undefined =>
  body === undefined || typeof body === "string" ? body : JSON.stringify(body);
export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchImplementation;
  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = (
      options.baseUrl ??
      import.meta.env.VITE_API_BASE_URL ??
      ""
    ).trim();
    this.fetchImpl =
      options.fetchImpl ?? ((input, init) => globalThis.fetch(input, init));
  }
  login(credentials: LoginCredentials): Promise<TokenResponse> {
    return this.tokenRequest("/api/v1/auth/login", credentials);
  }
  refresh(refreshToken: string): Promise<TokenResponse> {
    return this.tokenRequest("/api/v1/auth/refresh", {
      refresh_token: refreshToken,
    });
  }
  listAgentInvitations(accessToken: string): Promise<AgentInvitation[]> {
    return this.request("/api/v1/tenant/agent-invitations", { method: "GET", accessToken });
  }
  createAgentInvitation(accessToken: string, email: string): Promise<AgentInvitation> {
    return this.request("/api/v1/tenant/agent-invitations", { method: "POST", accessToken, body: { email } });
  }
  inspectAgentInvitation(token: string): Promise<AgentInvitationInspection> {
    return this.request("/api/v1/agent-invitations/inspect", { method: "POST", body: { token } });
  }
  acceptAgentInvitation(token: string, password?: string, passwordConfirmation?: string): Promise<AgentInvitationAcceptance> {
    return this.request("/api/v1/agent-invitations/accept", { method: "POST", body: { token, ...(password === undefined ? {} : { password, password_confirmation: passwordConfirmation }) } });
  }
  async logout(refreshToken: string): Promise<void> {
    await this.request("/api/v1/auth/logout", {
      method: "POST",
      body: { refresh_token: refreshToken },
    });
  }
  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const headers = new Headers(options.headers);
    if (options.body !== undefined && !headers.has("Content-Type"))
      headers.set("Content-Type", "application/json");
    if (options.accessToken)
      headers.set("Authorization", `Bearer ${options.accessToken}`);
    const { body, accessToken: _accessToken, ...init } = options;
    let response: Response;
    try {
      response = await this.fetchImpl(this.url(path), {
        ...init,
        headers,
        body: encodeBody(body),
      });
    } catch {
      throw new ApiClientError("NETWORK_ERROR");
    }
    if (!response.ok)
      throw new ApiClientError(
        (await readBackendCode(response)) ?? errorCode(response.status),
        response.status,
      );
    if (response.status === 204) return undefined as T;
    try {
      return (await response.json()) as T;
    } catch {
      throw new ApiClientError("INVALID_RESPONSE");
    }
  }
  private async tokenRequest(
    path: string,
    body: unknown,
  ): Promise<TokenResponse> {
    const value = await this.request<unknown>(path, { method: "POST", body });
    if (!isTokenResponse(value)) throw new ApiClientError("INVALID_RESPONSE");
    return value;
  }
  private url(path: string): string {
    return this.baseUrl
      ? new URL(
          path,
          this.baseUrl.endsWith("/") ? this.baseUrl : `${this.baseUrl}/`,
        ).toString()
      : path;
  }
}
