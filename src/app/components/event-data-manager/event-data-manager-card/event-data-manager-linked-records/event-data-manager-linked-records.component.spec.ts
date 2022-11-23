import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDataManagerLinkedRecordsComponent } from './event-data-manager-linked-records.component';

describe('EventDataManagerLinkedRecordsComponent', () => {
  let component: EventDataManagerLinkedRecordsComponent;
  let fixture: ComponentFixture<EventDataManagerLinkedRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventDataManagerLinkedRecordsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDataManagerLinkedRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
