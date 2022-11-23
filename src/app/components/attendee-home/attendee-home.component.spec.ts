import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendeeHomeComponent } from './attendee-home.component';

describe('AttendeeHomeComponent', () => {
  let component: AttendeeHomeComponent;
  let fixture: ComponentFixture<AttendeeHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendeeHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendeeHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
