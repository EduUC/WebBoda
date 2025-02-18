import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicaFondoComponent } from './musica-fondo.component';

describe('MusicaFondoComponent', () => {
  let component: MusicaFondoComponent;
  let fixture: ComponentFixture<MusicaFondoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicaFondoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicaFondoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
