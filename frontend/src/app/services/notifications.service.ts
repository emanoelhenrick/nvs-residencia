import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/enviroment';
import { INotification } from '../models';

/** Notificações do usuário autenticado (a API identifica o usuário pelo token). */
@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.api}/notifications`;

  list(): Observable<INotification[]> {
    return this._http.get<INotification[]>(this._url);
  }

  markRead(id: string): Observable<void> {
    return this._http.patch<void>(`${this._url}/${encodeURIComponent(id)}`, { read: true });
  }

  markAllRead(): Observable<void> {
    return this._http.post<void>(`${this._url}/read-all`, {});
  }
}
