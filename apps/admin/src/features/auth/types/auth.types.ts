export interface AuthUser {
  id: string;
  roleId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
  role: { name: string };
}

export interface LoginResponse {
  accessToken: string;
  userId: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}
