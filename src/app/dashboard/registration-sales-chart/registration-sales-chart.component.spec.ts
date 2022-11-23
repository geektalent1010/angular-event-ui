import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationSalesChartComponent } from './registration-sales-chart.component';

describe('RegistrationSalesChartComponent', () => {
  let component: RegistrationSalesChartComponent;
  let fixture: ComponentFixture<RegistrationSalesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrationSalesChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationSalesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
