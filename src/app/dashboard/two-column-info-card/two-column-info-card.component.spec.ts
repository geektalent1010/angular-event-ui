import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoColumnInfoCardComponent } from './two-column-info-card.component';

describe('TwoColumnInfoCardComponent', () => {
  let component: TwoColumnInfoCardComponent;
  let fixture: ComponentFixture<TwoColumnInfoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwoColumnInfoCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoColumnInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
