import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/enviroment';
import { IAccessLog } from '../models';

@Injectable({ providedIn: 'root' })
export class AccessLogsService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.api}/access-logs`;

  /** Registros de alteração de acesso, do mais recente para o mais antigo. */
  list(limit = 1): Observable<IAccessLog[]> {
    return this._http.get<IAccessLog[]>(this._url, {
      params: new HttpParams().set('limit', limit),
    });
  }
}
