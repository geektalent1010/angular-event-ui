import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalReportingComponent } from './global-reporting.component';

describe('GlobalReportingComponent', () => {
  let component: GlobalReportingComponent;
  let fixture: ComponentFixture<GlobalReportingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalReportingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
