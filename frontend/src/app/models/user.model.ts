export type Role = 'ADMIN' | 'INVESTIGATOR' | 'STAFF';
export type UserRole = Role; // Alias for backward compatibility
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  userId: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type UserResponse = User;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType?: string;
  user: UserResponse;
}

export type AuthResponse = LoginResponse;

export interface AdminCreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
  status: UserStatus;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
