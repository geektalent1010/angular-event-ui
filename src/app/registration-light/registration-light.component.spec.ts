import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationLightComponent } from './registration-light.component';

describe('RegistrationLightComponent', () => {
  let component: RegistrationLightComponent;
  let fixture: ComponentFixture<RegistrationLightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrationLightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationLightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
