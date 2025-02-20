import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SongService } from './services/song.service';
import { MusicaFondoComponent } from './component/musica-fondo/musica-fondo.component';
import { CarruselFotosComponent } from "./component/carrusel-fotos/carrusel-fotos.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, MusicaFondoComponent, CarruselFotosComponent],
  providers: [SongService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Cielitos';
}
