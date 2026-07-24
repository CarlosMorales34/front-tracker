export interface User {
  id: string;
  email: string;
  name: string;
  // El backend solo lo manda en el response de /register; en /login y en
  // el user derivado del accessToken (ver AuthContext) puede no venir.
  createdAt?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}
