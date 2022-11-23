import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationEventComponent } from './registration-event.component';

describe('RegistrationEventComponent', () => {
  let component: RegistrationEventComponent;
  let fixture: ComponentFixture<RegistrationEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrationEventComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
