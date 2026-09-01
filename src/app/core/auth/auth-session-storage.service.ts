import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { AuthSession, isUserRole } from './auth.models';

const AUTH_SESSION_STORAGE_KEY = 'stockflow.auth.session';

@Injectable({ providedIn: 'root' })
export class AuthSessionStorage {
  private readonly document = inject(DOCUMENT);

  read(): AuthSession | null {
    const storage = this.getStorage();

    if (!storage) {
      return null;
    }

    try {
      const serializedSession = storage.getItem(AUTH_SESSION_STORAGE_KEY);

      if (!serializedSession) {
        return null;
      }

      const session: unknown = JSON.parse(serializedSession);

      if (!isAuthSession(session)) {
        storage.removeItem(AUTH_SESSION_STORAGE_KEY);
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  save(session: AuthSession): void {
    try {
      this.getStorage()?.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // La session reste disponible en mémoire si le navigateur refuse le stockage.
    }
  }

  clear(): void {
    try {
      this.getStorage()?.removeItem(AUTH_SESSION_STORAGE_KEY);
    } catch {
      // Aucun nettoyage supplémentaire n'est possible sans accès au stockage.
    }
  }

  private getStorage(): Storage | null {
    try {
      return this.document.defaultView?.sessionStorage ?? null;
    } catch {
      return null;
    }
  }
}

function isAuthSession(value: unknown): value is AuthSession {
  if (
    !isRecord(value) ||
    typeof value['accessToken'] !== 'string' ||
    !value['accessToken'].trim()
  ) {
    return false;
  }

  const user = value['user'];

  return (
    isRecord(user) &&
    typeof user['userId'] === 'number' &&
    Number.isInteger(user['userId']) &&
    typeof user['fullName'] === 'string' &&
    typeof user['email'] === 'string' &&
    isUserRole(user['role'])
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
