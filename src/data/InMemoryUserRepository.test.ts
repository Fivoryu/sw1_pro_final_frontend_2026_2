import { describe, expect, it } from "vitest";
import { InMemoryUserRepository } from "./InMemoryUserRepository";
import { demoUsers } from "./fixtures/users";

const draft = {
  name: "Nuevo",
  email: "demo@example.test",
  role: "cualquier-rol",
  status: "cualquier-estado",
};

describe("InMemoryUserRepository", () => {
  it("lists cloned fixtures and accepts repeated email values", async () => {
    const repo = new InMemoryUserRepository(demoUsers);
    const first = await repo.list();
    expect(first).toHaveLength(demoUsers.length);
    expect(first[0]).toMatchObject(demoUsers[0]);
    const created = await repo.create(draft);
    const repeated = await repo.create({ ...draft, name: "Repetido" });
    expect(created.email).toBe(draft.email);
    expect(repeated.email).toBe(draft.email);
    expect(
      (await repo.list()).filter((user) => user.email === draft.email),
    ).toHaveLength(2);
    (first[0] as { name: string }).name = "copia mutada";
    expect((await repo.list())[0].name).toBe(demoUsers[0].name);
  });

  it("updates the selected record without increasing the collection", async () => {
    const repo = new InMemoryUserRepository(demoUsers);
    const before = await repo.list();
    const updated = await repo.update(before[0].id, {
      ...draft,
      email: before[0].email,
    });
    const after = await repo.list();
    expect(after).toHaveLength(before.length);
    expect(updated.id).toBe(before[0].id);
    expect(after[0]).toMatchObject({ id: before[0].id, name: draft.name });
  });

  it("deactivates without removing or changing the other fields", async () => {
    const repo = new InMemoryUserRepository(demoUsers);
    const original = (await repo.list())[0];
    const result = await repo.deactivate(original.id);
    expect(result).toEqual({ ...original, status: "inactive" });
    expect((await repo.list()).find((user) => user.id === original.id)).toEqual(
      result,
    );
  });

  it("rejects a missing record and exposes no destructive operation", async () => {
    const repo = new InMemoryUserRepository(demoUsers);
    await expect(repo.update("missing", draft)).rejects.toThrow();
    expect("delete" in repo).toBe(false);
    expect("activate" in repo).toBe(false);
    expect("saveToStorage" in repo).toBe(false);
  });
});
