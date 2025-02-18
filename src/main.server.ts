import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { CarruselFotosComponent } from './app/component/carrusel-fotos/carrusel-fotos.component';
import { MusicaFondoComponent } from './app/component/musica-fondo/musica-fondo.component';

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
