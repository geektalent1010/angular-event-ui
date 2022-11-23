import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessRulesComponent } from './business-rules.component';

describe('BusinessRulesComponent', () => {
  let component: BusinessRulesComponent;
  let fixture: ComponentFixture<BusinessRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessRulesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
