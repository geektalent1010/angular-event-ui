import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventMetricsComponent } from './event-metrics.component';

describe('EventMetricsComponent', () => {
  let component: EventMetricsComponent;
  let fixture: ComponentFixture<EventMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventMetricsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
