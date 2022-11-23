import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegacyReportsComponent } from './legacy-reports.component';

describe('LegacyReportsComponent', () => {
  let component: LegacyReportsComponent;
  let fixture: ComponentFixture<LegacyReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LegacyReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LegacyReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
