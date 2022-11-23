import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventGoalsComponent } from './event-goals.component';

describe('EventGoalsComponent', () => {
  let component: EventGoalsComponent;
  let fixture: ComponentFixture<EventGoalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventGoalsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
