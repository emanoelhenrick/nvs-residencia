import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/enviroments';
import { ITicket } from '../models/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  private readonly _http = Inject(HttpClient);

  postTicket(payload: ITicket) {
    return this._http.post(`${environment.api}/tickets`, payload);
  }

  getAllTickets() {
    return this._http.get(`${environment.api}/tickets`);
  }

  getTicketById(id: string) {
    return this._http.get(`${environment.api}/tickets/${id}`);
  }

  getHistoryTicket(id: string) {
    return this._http.get(`${environment.api}/tickets/${id}/history`);
  }
}
