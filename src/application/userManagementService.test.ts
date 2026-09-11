import { describe, expect, it, vi } from "vitest";
import { InMemoryUserRepository } from "../data/InMemoryUserRepository";
import type { UserRepository } from "../data/UserRepository";
import { demoUsers } from "../data/fixtures/users";
import { UserNotFoundError } from "../domain/user";
import {
  UserManagementService,
  UserValidationError,
} from "./userManagementService";

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
});
