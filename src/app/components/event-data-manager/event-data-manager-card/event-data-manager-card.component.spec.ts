import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDataManagerCardComponent } from './event-data-manager-card.component';

describe('EventDataManagerCardComponent', () => {
  let component: EventDataManagerCardComponent;
  let fixture: ComponentFixture<EventDataManagerCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventDataManagerCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDataManagerCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
