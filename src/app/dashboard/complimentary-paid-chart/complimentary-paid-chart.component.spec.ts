import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplimentaryPaidChartComponent } from './complimentary-paid-chart.component';

describe('ComplimentaryPaidChartComponent', () => {
  let component: ComplimentaryPaidChartComponent;
  let fixture: ComponentFixture<ComplimentaryPaidChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplimentaryPaidChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplimentaryPaidChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
