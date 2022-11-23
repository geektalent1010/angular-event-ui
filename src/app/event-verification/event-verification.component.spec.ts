import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventVerificationComponent } from './event-verification.component';

describe('EventVerificationComponent', () => {
  let component: EventVerificationComponent;
  let fixture: ComponentFixture<EventVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventVerificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
