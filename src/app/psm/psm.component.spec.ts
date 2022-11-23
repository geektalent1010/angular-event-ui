import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsmComponent } from './psm.component';

describe('PsmComponent', () => {
  let component: PsmComponent;
  let fixture: ComponentFixture<PsmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PsmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PsmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
