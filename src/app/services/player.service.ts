import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Player } from '../core/entities/Player';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor(private http: HttpClient) {}

  saveScore(player: Player): Observable<any> {
  return this.http.put(`${environment.app_url}/player`, player);
}

showPlayer(player: Player): Observable<any> {
  return this.http.get(`${environment.app_url}/player/${player.id}`);
}
}
