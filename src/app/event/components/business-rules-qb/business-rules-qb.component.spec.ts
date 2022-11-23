import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessRulesQbComponent } from './business-rules-qb.component';

describe('BusinessRulesQbComponent', () => {
  let component: BusinessRulesQbComponent;
  let fixture: ComponentFixture<BusinessRulesQbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BusinessRulesQbComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessRulesQbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
