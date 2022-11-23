import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelerikDesignerComponent } from './telerik-designer.component';

describe('TelerikDesignerComponent', () => {
  let component: TelerikDesignerComponent;
  let fixture: ComponentFixture<TelerikDesignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TelerikDesignerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TelerikDesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
