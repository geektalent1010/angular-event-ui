import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDataManagerDemographicsComponent } from './event-data-manager-demographics.component';

describe('EventDataManagerDemographicsComponent', () => {
  let component: EventDataManagerDemographicsComponent;
  let fixture: ComponentFixture<EventDataManagerDemographicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventDataManagerDemographicsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDataManagerDemographicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
