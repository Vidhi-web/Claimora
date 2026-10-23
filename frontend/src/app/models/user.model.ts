export type UserRole = 'ADMIN' | 'INVESTIGATOR' | 'STAFF';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
