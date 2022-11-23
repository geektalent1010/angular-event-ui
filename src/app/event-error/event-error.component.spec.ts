import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventErrorComponent } from './event-error.component';

describe('EventErrorComponent', () => {
  let component: EventErrorComponent;
  let fixture: ComponentFixture<EventErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventErrorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
