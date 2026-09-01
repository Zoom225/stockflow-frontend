import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_ENDPOINT_PREFIX, AUTH_LOGIN_ENDPOINT } from '../auth/auth.constants';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthService).accessToken();
  const targetsStockFlowApi = request.url.startsWith(API_ENDPOINT_PREFIX);
  const targetsLogin = request.url === AUTH_LOGIN_ENDPOINT;

  if (!targetsStockFlowApi || targetsLogin || !token) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
