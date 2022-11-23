import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveVideoChatComponent } from './live-video-chat.component';

describe('LiveVideoChatComponent', () => {
  let component: LiveVideoChatComponent;
  let fixture: ComponentFixture<LiveVideoChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveVideoChatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveVideoChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
