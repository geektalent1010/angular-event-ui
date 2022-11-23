import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDataManagerSessionEventsComponent } from './event-data-manager-session-events.component';

describe('EventDataManagerSessionEventsComponent', () => {
  let component: EventDataManagerSessionEventsComponent;
  let fixture: ComponentFixture<EventDataManagerSessionEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventDataManagerSessionEventsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDataManagerSessionEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
