export const SUPABASE_AUTH_PORT = Symbol('SupabaseAuthPort');

export interface SupabaseAuthPort {
  createUser(email: string, password: string): Promise<{ id: string; email: string }>;
  signInWithPassword(email: string, password: string): Promise<{ accessToken: string; userId: string }>;
  getGoogleOAuthUrl(redirectTo: string): Promise<{ url: string }>;
  sendPasswordResetEmail(email: string): Promise<void>;
  updatePassword(userId: string, newPassword: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  updateUserRole(userId: string, role: string): Promise<void>;
}
