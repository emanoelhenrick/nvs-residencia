import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/enviroment';
import {
  ICommentPayload,
  IDiscardIncidentPayload,
  IEvidencePayload,
  ILinkIncidentPayload,
  ILinkIncidentResponse,
  INewTicket,
  ITicket,
  ITicketQuery,
  ITriagePayload,
  IWaitPayload,
} from '../models';

/** Somente chamadas HTTP. Regras de negócio ficam na API; telas refazem o GET após cada ação. */
@Injectable({ providedIn: 'root' })
export class TicketsService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.api}/tickets`;

  list(query: ITicketQuery = {}): Observable<ITicket[]> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query))
      if (value) params = params.set(key, String(value));
    return this._http.get<ITicket[]>(this._url, { params });
  }

  get(id: string): Observable<ITicket> {
    return this._http.get<ITicket>(`${this._url}/${encodeURIComponent(id)}`);
  }

  create(payload: INewTicket): Observable<ITicket> {
    return this._http.post<ITicket>(this._url, payload);
  }

  startTriage(id: string): Observable<ITicket> {
    return this._action(id, 'start-triage', {});
  }

  triage(id: string, payload: ITriagePayload): Observable<ITicket> {
    return this._action(id, 'triage', payload);
  }

  comment(id: string, payload: ICommentPayload): Observable<ITicket> {
    return this._action(id, 'comments', payload);
  }

  attachEvidence(id: string, payload: IEvidencePayload): Observable<ITicket> {
    return this._action(id, 'evidences', payload);
  }

  wait(id: string, payload: IWaitPayload): Observable<ITicket> {
    return this._action(id, 'wait', payload);
  }

  resume(id: string, text: string): Observable<ITicket> {
    return this._action(id, 'resume', { text });
  }

  sendInfo(id: string, payload: ICommentPayload): Observable<ITicket> {
    return this._action(id, 'send-info', payload);
  }

  resolve(id: string, text: string): Observable<ITicket> {
    return this._action(id, 'resolve', { text });
  }

  cancel(id: string, text: string): Observable<ITicket> {
    return this._action(id, 'cancel', { text });
  }

  reopen(id: string, text: string): Observable<ITicket> {
    return this._action(id, 'reopen', { text });
  }

  continueAttendance(id: string): Observable<ITicket> {
    return this._action(id, 'continue', {});
  }

  requestReassessment(id: string, text: string): Observable<ITicket> {
    return this._action(id, 'reassess', { text });
  }

  reviewEscalation(id: string, text: string): Observable<ITicket> {
    return this._action(id, 'escalate', { text });
  }

  linkIncident(payload: ILinkIncidentPayload): Observable<ILinkIncidentResponse> {
    return this._http.post<ILinkIncidentResponse>(`${environment.api}/incidents/link`, payload);
  }

  discardIncident(payload: IDiscardIncidentPayload): Observable<void> {
    return this._http.post<void>(`${environment.api}/incidents/discard`, payload);
  }

  private _action(id: string, name: string, body: object): Observable<ITicket> {
    return this._http.post<ITicket>(`${this._url}/${encodeURIComponent(id)}/${name}`, body);
  }
}
