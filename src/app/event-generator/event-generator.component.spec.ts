import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventGeneratorComponent } from './event-generator.component';

describe('EventGeneratorComponent', () => {
  let component: EventGeneratorComponent;
  let fixture: ComponentFixture<EventGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventGeneratorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
