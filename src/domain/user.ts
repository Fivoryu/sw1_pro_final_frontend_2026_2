export type UserId = string;
export interface User { readonly id: UserId; readonly name: string; readonly email: string; readonly role: string; readonly status: string; }
export type UserDraft = Omit<User, 'id'>;
export type UserField = keyof UserDraft;
export type ValidationErrors = Partial<Record<UserField, string>>;
export const INACTIVE_STATUS = 'inactive';

const fields: UserField[] = ['name', 'email', 'role', 'status'];
const labels: Record<UserField, string> = { name: 'nombre', email: 'correo', role: 'rol', status: 'estado' };
export const normalizeUserDraft = (input: UserDraft): UserDraft => Object.fromEntries(fields.map(field => [field, input[field].trim()])) as UserDraft;
export const validateUserDraft = (input: UserDraft): ValidationErrors => Object.fromEntries(fields.filter(field => !input[field].trim()).map(field => [field, `El ${labels[field]} es obligatorio`])) as ValidationErrors;
export const cloneUser = (user: User): User => ({ ...user });
export class UserNotFoundError extends Error { constructor(id: UserId) { super(`No se encontró el usuario local ${id}`); this.name = 'UserNotFoundError'; } }
