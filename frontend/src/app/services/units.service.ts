import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/enviroment';
import { INewUnit, IUnit, IUnitChange } from '../models';

@Injectable({ providedIn: 'root' })
export class UnitsService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.api}/units`;

  list(): Observable<IUnit[]> {
    return this._http.get<IUnit[]>(this._url);
  }

  create(unit: INewUnit): Observable<IUnit> {
    return this._http.post<IUnit>(this._url, unit);
  }

  update(id: string, change: IUnitChange): Observable<IUnit> {
    return this._http.put<IUnit>(`${this._url}/${encodeURIComponent(id)}`, change);
  }

  delete(id: string): Observable<IUnit> {
    return this._http.delete<IUnit>(`${this._url}/${encodeURIComponent(id)}`);
  }
}
