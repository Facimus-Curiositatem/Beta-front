import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AceptarInvitacionComponent } from './aceptar-invitacion.component';

describe('AceptarInvitacionComponent', () => {
  let component: AceptarInvitacionComponent;
  let fixture: ComponentFixture<AceptarInvitacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AceptarInvitacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AceptarInvitacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
