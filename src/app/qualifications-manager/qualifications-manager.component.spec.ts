import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationsManagerComponent } from './qualifications-manager.component';

describe('QualificationsManagerComponent', () => {
  let component: QualificationsManagerComponent;
  let fixture: ComponentFixture<QualificationsManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QualificationsManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QualificationsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
