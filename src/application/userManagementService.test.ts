import { describe, expect, it, vi } from "vitest";
import { InMemoryUserRepository } from "../data/InMemoryUserRepository";
import type { UserRepository } from "../data/UserRepository";
import { demoUsers } from "../data/fixtures/users";
import { UserNotFoundError } from "../domain/user";
import {
  UserManagementService,
  UserValidationError,
  type InvitationApi,
} from "./userManagementService";
import type { SessionService } from "./sessionService";

const valid = {
  name: " Ana ",
  email: "ana@example.test",
  role: "custom",
  status: "available",
};
const double = (): UserRepository => ({
  list: vi.fn(async () => demoUsers),
  create: vi.fn(async (input) => ({ id: "created", ...input })),
  update: vi.fn(async (id, input) => ({ id, ...input })),
  deactivate: vi.fn(async (id) => ({
    id,
    name: "Ana",
    email: "ana@example.test",
    role: "custom",
    status: "inactive",
  })),
});

describe("UserManagementService", () => {
  it("lists and normalizes valid drafts through the repository port", async () => {
    const repository = double();
    const service = new UserManagementService(repository);
    expect(await service.listUsers()).toEqual(demoUsers);
    await service.createUser(valid);
    expect(repository.create).toHaveBeenCalledWith({
      name: "Ana",
      email: valid.email,
      role: valid.role,
      status: valid.status,
    });
  });

  it("rejects every missing field before calling the repository", async () => {
    const repository = double();
    await expect(
      new UserManagementService(repository).createUser({
        name: "",
        email: " ",
        role: "",
        status: "\t",
      }),
    ).rejects.toBeInstanceOf(UserValidationError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("delegates updates and deactivation and preserves controlled errors", async () => {
    const repository = double();
    const service = new UserManagementService(repository);
    await service.updateUser("one", valid);
    await service.deactivateUser("one");
    const failure = new Error("controlled failure");
    repository.list = vi.fn(async () => {
      throw failure;
    });
    await expect(service.listUsers()).rejects.toBe(failure);
  });

  it("works with the real adapter, accepts repeated emails, and does not duplicate edits", async () => {
    const service = new UserManagementService(
      new InMemoryUserRepository(demoUsers),
    );
    const created = await service.createUser({
      ...valid,
      email: demoUsers[0].email,
    });
    const before = await service.listUsers();
    await service.updateUser(created.id, { ...valid, name: "Editado" });
    expect(await service.listUsers()).toHaveLength(before.length);
    expect((await service.deactivateUser(created.id)).status).toBe("inactive");
    await expect(service.updateUser("missing", valid)).rejects.toBeInstanceOf(
      UserNotFoundError,
    );
  });

  it("keeps administrative and public invitation seams separate", async () => {
    const publicApi: InvitationApi = {
      listAgentInvitations: vi.fn(),
      createAgentInvitation: vi.fn(),
      inspectAgentInvitation: vi.fn(async () => ({ requires_password: false, expires_at: "2030-01-01T00:00:00Z" })),
      acceptAgentInvitation: vi.fn(async () => ({ invitation_status: "accepted", membership_status: "pending", membership_id: "membership" })),
    };
    const request = vi.fn(async (path: string, _options?: unknown) => path.includes("agent-invitations") ? [] : undefined);
    const session = { request } as unknown as SessionService;
    const service = new UserManagementService(publicApi, session);
    await service.listInvitations();
    await service.createInvitation("agent@test");
    await service.inspectInvitation("token");
    await service.acceptInvitation("token");
    expect(request).toHaveBeenNthCalledWith(1, "/api/v1/tenant/agent-invitations", { method: "GET" });
    expect(request).toHaveBeenNthCalledWith(2, "/api/v1/tenant/agent-invitations", { method: "POST", body: { email: "agent@test" } });
    expect(publicApi.inspectAgentInvitation).toHaveBeenCalledWith("token");
    expect(publicApi.acceptAgentInvitation).toHaveBeenCalledWith("token", undefined, undefined);
    for (const [, options] of request.mock.calls) {
      const requestOptions = options as { body?: unknown };
      expect(Object.keys(requestOptions)).not.toContain("tenant_id");
      const body = requestOptions.body;
      if (body && typeof body === "object" && !Array.isArray(body)) {
        expect(Object.keys(body)).not.toContain("tenant_id");
      }
    }
  });
});
