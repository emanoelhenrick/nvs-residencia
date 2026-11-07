import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/enviroment';
import { INewUser, IUser, IUserAccessChange, IUserQuery } from '../models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.api}/users`;

  list(query: IUserQuery = {}): Observable<IUser[]> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query))
      if (value !== undefined) params = params.set(key, String(value));
    return this._http.get<IUser[]>(this._url, { params });
  }

  create(payload: INewUser): Observable<IUser> {
    return this._http.post<IUser>(this._url, payload);
  }

  updateAccess(id: string, change: IUserAccessChange): Observable<IUser> {
    return this._http.patch<IUser>(`${this._url}/${encodeURIComponent(id)}`, change);
  }

  delete(id: string): Observable<IUser> {
    return this._http.delete<IUser>(`${this._url}/${encodeURIComponent(id)}`);
  }
}
