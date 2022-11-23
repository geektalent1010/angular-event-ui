import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportExplorerComponent } from './report-explorer.component';

describe('ReportExplorerComponent', () => {
  let component: ReportExplorerComponent;
  let fixture: ComponentFixture<ReportExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportExplorerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
