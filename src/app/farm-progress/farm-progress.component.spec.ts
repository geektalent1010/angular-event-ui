import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmProgressComponent } from './farm-progress.component';

describe('FarmProgressComponent', () => {
  let component: FarmProgressComponent;
  let fixture: ComponentFixture<FarmProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FarmProgressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
