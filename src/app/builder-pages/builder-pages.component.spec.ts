import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderPagesComponent } from './builder-pages.component';

describe('BuilderPagesComponent', () => {
  let component: BuilderPagesComponent;
  let fixture: ComponentFixture<BuilderPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuilderPagesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
