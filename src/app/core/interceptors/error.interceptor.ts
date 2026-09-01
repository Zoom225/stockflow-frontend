import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_ENDPOINT_PREFIX, AUTH_LOGIN_ENDPOINT } from '../auth/auth.constants';
import { AuthService } from '../auth/auth.service';
import { ApiError } from '../services/api-error';

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
        () => new ApiError(error.status, getErrorMessage(error.status, request.url)),
      );
    }),
  );
};

function getErrorMessage(status: number, requestUrl: string): string {
  const isLoginRequest = requestUrl === AUTH_LOGIN_ENDPOINT;

  switch (status) {
    case 0:
      return 'Le serveur StockFlow est actuellement inaccessible.';
    case 400:
      return isLoginRequest
        ? 'Les informations de connexion sont invalides.'
        : 'Les informations envoyées sont invalides.';
    case 401:
      return isLoginRequest
        ? 'Adresse e-mail ou mot de passe incorrect.'
        : 'Votre session est invalide ou a expiré.';
    case 403:
      return "Vous n'avez pas les droits nécessaires pour cette action.";
    case 404:
      return 'La ressource demandée est introuvable.';
    case 409:
      return 'Cette action entre en conflit avec des données existantes.';
    case 422:
      return 'Certaines informations fournies ne peuvent pas être traitées.';
    default:
      return status >= 500
        ? 'Une erreur interne est survenue. Réessayez ultérieurement.'
        : "Une erreur inattendue empêche l'opération.";
  }
}
