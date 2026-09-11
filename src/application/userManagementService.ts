import {
  normalizeUserDraft,
  validateUserDraft,
  type User,
  type UserDraft,
  type UserId,
  type ValidationErrors,
} from "../domain/user";
import type { UserRepository } from "../data/UserRepository";
import type { ApiClient, AgentInvitation, AgentInvitationAcceptance, AgentInvitationInspection } from "../data/apiClient";
import type { SessionService } from "./sessionService";

export type InvitationApi = Pick<ApiClient, "listAgentInvitations" | "createAgentInvitation" | "inspectAgentInvitation" | "acceptAgentInvitation">;

export class UserValidationError extends Error {
  constructor(readonly errors: ValidationErrors) {
    super("Revise los campos obligatorios");
    this.name = "UserValidationError";
  }
}

export class UserManagementService {
  constructor(private readonly repository: UserRepository | InvitationApi, private readonly session?: SessionService) {}
  isInvitationMode(): boolean { return this.session !== undefined; }
  async listInvitations(): Promise<readonly AgentInvitation[]> {
    if (!this.session) throw new Error("Invitation API is not configured");
    return this.session.request<AgentInvitation[]>("/api/v1/tenant/agent-invitations", { method: "GET" });
  }
  async createInvitation(email: string): Promise<AgentInvitation> {
    if (!this.session) throw new Error("Invitation API is not configured");
    return this.session.request<AgentInvitation>("/api/v1/tenant/agent-invitations", { method: "POST", body: { email } });
  }
  inspectInvitation(token: string): Promise<AgentInvitationInspection> {
    return (this.repository as InvitationApi).inspectAgentInvitation(token);
  }
  acceptInvitation(token: string, password?: string, confirmation?: string): Promise<AgentInvitationAcceptance> {
    return (this.repository as InvitationApi).acceptAgentInvitation(token, password, confirmation);
  }
  listUsers(): Promise<readonly User[]> {
    return (this.repository as UserRepository).list();
  }
  createUser(input: UserDraft): Promise<User> {
    return this.mutate("create", input);
  }
  updateUser(id: UserId, input: UserDraft): Promise<User> {
    return this.mutate("update", input, id);
  }
  deactivateUser(id: UserId): Promise<User> {
    return (this.repository as UserRepository).deactivate(id);
  }

  private async mutate(
    operation: "create" | "update",
    input: UserDraft,
    id?: UserId,
  ) {
    const normalized = normalizeUserDraft(input);
    const errors = validateUserDraft(normalized);
    if (Object.keys(errors).length) throw new UserValidationError(errors);
    return operation === "create"
      ? (this.repository as UserRepository).create(normalized)
      : (this.repository as UserRepository).update(id!, normalized);
  }
}
