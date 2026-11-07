import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environment/enviroment';
import { SessionStore } from '../session/session.store';
import { readToken } from '../session/token.storage';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApi = req.url.startsWith(environment.api);
  if (!isApi) return next(req);

  const isPublic = PUBLIC_PATHS.some((p) => req.url === `${environment.api}${p}`);
  if (isPublic) return next(req);

  const session = inject(SessionStore);
  const token = readToken();
  const request = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && session.isLoggedIn())
        session.end();
      return throwError(() => err);
    }),
  );
};
