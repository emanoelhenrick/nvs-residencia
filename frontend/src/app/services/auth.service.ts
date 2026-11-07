import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/enviroment';
import {
  IAuthResponse,
  ILoginPayload,
  IRegisterPayload,
  IRegisterResponse,
} from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _url = environment.api;

  login(credential: ILoginPayload): Observable<IAuthResponse> {
    return this._http.post<IAuthResponse>(`${this._url}/login`, credential);
  }

  register(payload: IRegisterPayload): Observable<IRegisterResponse> {
    return this._http.post<IRegisterResponse>(`${this._url}/register`, payload);
  }

  forgotPassword(email: string): Observable<void> {
    return this._http.post<void>(`${this._url}/forgot-password`, { email });
  }
}
