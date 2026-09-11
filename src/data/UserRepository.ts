import type { User, UserDraft, UserId } from "../domain/user";

export interface UserRepository {
  list(): Promise<readonly User[]>;
  create(input: UserDraft): Promise<User>;
  update(id: UserId, input: UserDraft): Promise<User>;
  deactivate(id: UserId): Promise<User>;
}
