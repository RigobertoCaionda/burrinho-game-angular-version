import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Player } from '../core/entities/Player';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

    private apiUrl = 'http://77.42.85.245:3333';

  constructor(private http: HttpClient) {}

  saveScore(player: Player): Observable<any> {
  return this.http.put(`${this.apiUrl}/player`, player);
}

showPlayer(player: Player): Observable<any> {
  return this.http.get(`${this.apiUrl}/player/${player.id}`);
}
}
