import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendeeVerificationComponent } from './attendee-verification.component';

describe('AttendeeVerificationComponent', () => {
  let component: AttendeeVerificationComponent;
  let fixture: ComponentFixture<AttendeeVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendeeVerificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendeeVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
