// types/auth.ts
export interface User {
  id: string;
  name: string;
  emailId: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
}
