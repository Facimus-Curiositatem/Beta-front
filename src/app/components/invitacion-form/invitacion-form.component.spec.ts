import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitacionFormComponent } from './invitacion-form.component';

describe('InvitacionFormComponent', () => {
  let component: InvitacionFormComponent;
  let fixture: ComponentFixture<InvitacionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitacionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitacionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
