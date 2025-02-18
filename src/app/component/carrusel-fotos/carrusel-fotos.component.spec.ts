import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarruselFotosComponent } from './carrusel-fotos.component';

describe('CarruselFotosComponent', () => {
  let component: CarruselFotosComponent;
  let fixture: ComponentFixture<CarruselFotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarruselFotosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarruselFotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
