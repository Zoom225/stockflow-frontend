import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { AUTH_LOGIN_ENDPOINT } from './auth.constants';
import {
  AuthenticatedUser,
  AuthResponse,
  AuthSession,
  isUserRole,
  LoginRequest,
} from './auth.models';
import { AuthSessionStorage } from './auth-session-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionStorage = inject(AuthSessionStorage);
  private readonly session = signal<AuthSession | null>(this.sessionStorage.read());

  readonly currentUser = computed(() => this.session()?.user ?? null);
  readonly accessToken = computed(() => this.session()?.accessToken ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);

  login(request: LoginRequest): Observable<AuthenticatedUser> {
    return this.http.post<AuthResponse>(AUTH_LOGIN_ENDPOINT, request).pipe(
      map((response) => createSession(response)),
      tap((session) => {
        this.sessionStorage.save(session);
        this.session.set(session);
      }),
      map(({ user }) => user),
    );
  }

  logout(): void {
    this.clearSession();
  }

  clearSession(): void {
    this.sessionStorage.clear();
    this.session.set(null);
  }
}

function createSession(response: AuthResponse): AuthSession {
  const accessToken = response.accessToken?.trim();

  if (
    !accessToken ||
    typeof response.userId !== 'number' ||
    !Number.isInteger(response.userId) ||
    typeof response.fullName !== 'string' ||
    typeof response.email !== 'string' ||
    !isUserRole(response.role)
  ) {
    throw new Error("La réponse d'authentification reçue est incomplète.");
  }

  return {
    accessToken,
    user: {
      userId: response.userId,
      fullName: response.fullName,
      email: response.email,
      role: response.role,
    },
  };
}
