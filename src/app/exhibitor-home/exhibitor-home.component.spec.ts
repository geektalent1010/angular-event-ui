import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExhibitorHomeComponent } from './exhibitor-home.component';

describe('ExhibitorHomeComponent', () => {
  let component: ExhibitorHomeComponent;
  let fixture: ComponentFixture<ExhibitorHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExhibitorHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExhibitorHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
