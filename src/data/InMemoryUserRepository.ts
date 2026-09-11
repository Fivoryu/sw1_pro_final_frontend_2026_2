import {
  cloneUser,
  INACTIVE_STATUS,
  normalizeUserDraft,
  UserNotFoundError,
  type User,
  type UserDraft,
  type UserId,
} from "../domain/user";
import type { UserRepository } from "./UserRepository";
import { demoUsers } from "./fixtures/users";

export class InMemoryUserRepository implements UserRepository {
  private users: User[];
  private nextId: number;

  constructor(seed: readonly User[] = demoUsers) {
    this.users = seed.map(cloneUser);
    this.nextId = seed.length + 1;
  }
  async list() {
    return this.users.map(cloneUser);
  }
  async create(input: UserDraft) {
    const user = { id: `local-${this.nextId++}`, ...normalizeUserDraft(input) };
    this.users = [...this.users, user];
    return cloneUser(user);
  }
  async update(id: UserId, input: UserDraft) {
    const index = this.users.findIndex((user) => user.id === id);
    if (index < 0) throw new UserNotFoundError(id);
    const user = { id, ...normalizeUserDraft(input) };
    this.users = this.users.map((current, position) =>
      position === index ? user : current,
    );
    return cloneUser(user);
  }
  async deactivate(id: UserId) {
    const current = this.users.find((user) => user.id === id);
    if (!current) throw new UserNotFoundError(id);
    const user = { ...current, status: INACTIVE_STATUS };
    this.users = this.users.map((item) => (item.id === id ? user : item));
    return cloneUser(user);
  }
}
