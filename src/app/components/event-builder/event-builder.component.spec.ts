import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventBuilderComponent } from './event-builder.component';

describe('EventBuilderComponent', () => {
  let component: EventBuilderComponent;
  let fixture: ComponentFixture<EventBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventBuilderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
