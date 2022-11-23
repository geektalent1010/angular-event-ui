import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventPagesComponent } from './event-pages.component';

describe('EventPagesComponent', () => {
  let component: EventPagesComponent;
  let fixture: ComponentFixture<EventPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventPagesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
