import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeDesignerComponent } from './badge-designer.component';

describe('BadgeDesignerComponent', () => {
  let component: BadgeDesignerComponent;
  let fixture: ComponentFixture<BadgeDesignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BadgeDesignerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeDesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
