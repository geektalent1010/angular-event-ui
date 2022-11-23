import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelerikPreviewComponent } from './telerik-preview.component';

describe('TelerikPreviewComponent', () => {
  let component: TelerikPreviewComponent;
  let fixture: ComponentFixture<TelerikPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TelerikPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TelerikPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
