import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SongService } from './services/song.service';
import { MusicaFondoComponent } from './component/musica-fondo/musica-fondo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, MusicaFondoComponent],
  providers: [SongService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Cielitos';
}
