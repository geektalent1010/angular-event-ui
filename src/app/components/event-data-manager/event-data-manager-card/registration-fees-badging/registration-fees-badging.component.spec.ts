import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationFeesBadgingComponent } from './registration-fees-badging.component';

describe('RegistrationFeesBadgingComponent', () => {
  let component: RegistrationFeesBadgingComponent;
  let fixture: ComponentFixture<RegistrationFeesBadgingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrationFeesBadgingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationFeesBadgingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
