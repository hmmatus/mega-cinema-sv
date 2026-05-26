import type { User } from '@cinema/database';

export const USER_REPOSITORY = Symbol('UserRepository');

export interface CreateUserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  preferredLanguage?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  preferredLanguage?: string;
}

export type UserWithRole = User & { role: { name: string } };

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByIdWithRole(id: string): Promise<UserWithRole | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  upsertProfile(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  deactivate(id: string): Promise<User>;
}
