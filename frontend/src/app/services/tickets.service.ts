import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/enviroments';
import { ITicket } from '../models/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  private readonly _http = inject(HttpClient);

  postTicket(payload: ITicket) {
    return this._http.post(`${environment.api}/api/v1/tickets`, payload);
  }

  getAllTickets() {
    return this._http.get(`${environment.api}/api/v1/tickets`);
  }

  getTicketById(id: string) {
    return this._http.get(`${environment.api}/api/v1/tickets/${id}`);
  }

  getHistoryTicket(id: string) {
    return this._http.get(`${environment.api}/api/v1/tickets/${id}/history`);
  }
}
