import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SongService {
  private apiUrl = 'https://webboda.vercel.app/api/agregar-cancion';
  // private apiUrl = 'localhost:5000/api/spotify/add';

  constructor(private http: HttpClient) {}

  agregarCancion(link: string): Observable<any> {
    const songId = this.extraerSpotifyID(link);
    if (!songId) {
      throw new Error('Enlace de Spotify no válido');
    }
    return this.http.post(this.apiUrl, { songId });
  }

  private extraerSpotifyID(url: string): string | null {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }
}
