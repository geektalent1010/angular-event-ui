import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NBJComponent } from './nbj.component';

describe('NBJComponent', () => {
  let component: NBJComponent;
  let fixture: ComponentFixture<NBJComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NBJComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NBJComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
