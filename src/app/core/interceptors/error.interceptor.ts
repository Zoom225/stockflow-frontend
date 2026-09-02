import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_ENDPOINT_PREFIX, AUTH_LOGIN_ENDPOINT } from '../auth/auth.constants';
import { AuthService } from '../auth/auth.service';
import { ApiError } from '../services/api-error';
import { ApiErrorResponse } from '../../shared/models/api-error-response.model';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || !request.url.startsWith(API_ENDPOINT_PREFIX)) {
        return throwError(() => error);
      }

      if (error.status === 401) {
        authService.clearSession();

        if (request.url !== AUTH_LOGIN_ENDPOINT && !router.url.startsWith('/login')) {
          void router.navigate(['/login'], {
            queryParams: { returnUrl: router.url },
          });
        }
      }

      return throwError(
        () =>
          new ApiError(
            error.status,
            getErrorMessage(error.status, request.url, error.error),
            getFieldErrors(error.error),
          ),
      );
    }),
  );
};

function getErrorMessage(status: number, requestUrl: string, responseBody: unknown): string {
  const isLoginRequest = requestUrl === AUTH_LOGIN_ENDPOINT;
  const backendMessage = getBackendMessage(responseBody);

  switch (status) {
    case 0:
      return 'Le serveur StockFlow est actuellement inaccessible.';
    case 400:
      return isLoginRequest
        ? 'Les informations de connexion sont invalides.'
        : (backendMessage ?? 'Les informations envoyées sont invalides.');
    case 401:
      return isLoginRequest
        ? 'Adresse e-mail ou mot de passe incorrect.'
        : 'Votre session est invalide ou a expiré.';
    case 403:
      return "Vous n'avez pas les droits nécessaires pour cette action.";
    case 404:
      return backendMessage ?? 'La ressource demandée est introuvable.';
    case 409:
      return backendMessage ?? 'Cette action entre en conflit avec des données existantes.';
    case 422:
      return backendMessage ?? 'Certaines informations fournies ne peuvent pas être traitées.';
    default:
      return status >= 500
        ? 'Une erreur interne est survenue. Réessayez ultérieurement.'
        : "Une erreur inattendue empêche l'opération.";
  }
}

function getBackendMessage(responseBody: unknown): string | null {
  if (!isApiErrorResponse(responseBody)) {
    return null;
  }

  const message = responseBody.message.trim();
  return message.length > 0 ? message : null;
}

function getFieldErrors(responseBody: unknown): Readonly<Record<string, string>> {
  if (!isApiErrorResponse(responseBody) || !responseBody.fieldErrors) {
    return {};
  }

  return responseBody.fieldErrors;
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return 'message' in value && typeof value.message === 'string';
}
