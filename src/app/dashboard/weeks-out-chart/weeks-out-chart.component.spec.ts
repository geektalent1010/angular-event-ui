import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeksOutChartComponent } from './weeks-out-chart.component';

describe('WeeksOutChartComponent', () => {
  let component: WeeksOutChartComponent;
  let fixture: ComponentFixture<WeeksOutChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeeksOutChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeeksOutChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
