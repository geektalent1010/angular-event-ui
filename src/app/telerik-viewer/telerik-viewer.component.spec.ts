import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelerikViewerComponent } from './telerik-viewer.component';

describe('TelerikViewerComponent', () => {
  let component: TelerikViewerComponent;
  let fixture: ComponentFixture<TelerikViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TelerikViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TelerikViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
