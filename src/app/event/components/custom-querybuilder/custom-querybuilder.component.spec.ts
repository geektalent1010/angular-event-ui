import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomQuerybuilderComponent } from './custom-querybuilder.component';

describe('CustomQuerybuilderComponent', () => {
  let component: CustomQuerybuilderComponent;
  let fixture: ComponentFixture<CustomQuerybuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomQuerybuilderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomQuerybuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
