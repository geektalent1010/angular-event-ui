import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExhibitorProfileComponent } from './exhibitor-profile.component';

describe('ExhibitorProfileComponent', () => {
  let component: ExhibitorProfileComponent;
  let fixture: ComponentFixture<ExhibitorProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExhibitorProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExhibitorProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
