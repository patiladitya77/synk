// types/auth.ts
export interface User {
  name: string;
  emailId: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
}
