export const userRoles = ['ROLE_ADMIN', 'ROLE_USER'] as const;

export type UserRole = (typeof userRoles)[number];

/** Corps de requête exposé par LoginRequest dans OpenAPI. */
export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

/** Réponse exposée par AuthResponse dans OpenAPI. */
export interface AuthResponse {
  readonly accessToken?: string;
  readonly tokenType?: string;
  readonly userId?: number;
  readonly fullName?: string;
  readonly email?: string;
  readonly role?: string;
}

export interface AuthenticatedUser {
  readonly userId: number;
  readonly fullName: string;
  readonly email: string;
  readonly role: UserRole;
}

export interface AuthSession {
  readonly accessToken: string;
  readonly user: AuthenticatedUser;
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && userRoles.some((role) => role === value);
}
