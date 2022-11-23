import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveSessionVideoComponent } from './live-session-video.component';

describe('LiveSessionVideoComponent', () => {
  let component: LiveSessionVideoComponent;
  let fixture: ComponentFixture<LiveSessionVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveSessionVideoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveSessionVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
