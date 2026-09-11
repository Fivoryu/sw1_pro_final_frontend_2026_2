import {
  normalizeUserDraft,
  validateUserDraft,
  type User,
  type UserDraft,
  type UserId,
  type ValidationErrors,
} from "../domain/user";
import type { UserRepository } from "../data/UserRepository";

export class UserValidationError extends Error {
  constructor(readonly errors: ValidationErrors) {
    super("Revise los campos obligatorios");
    this.name = "UserValidationError";
  }
}

export class UserManagementService {
  constructor(private readonly repository: UserRepository) {}
  listUsers(): Promise<readonly User[]> {
    return this.repository.list();
  }
  createUser(input: UserDraft): Promise<User> {
    return this.mutate("create", input);
  }
  updateUser(id: UserId, input: UserDraft): Promise<User> {
    return this.mutate("update", input, id);
  }
  deactivateUser(id: UserId): Promise<User> {
    return this.repository.deactivate(id);
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
      ? this.repository.create(normalized)
      : this.repository.update(id!, normalized);
  }
}
