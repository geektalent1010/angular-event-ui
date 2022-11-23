import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopNTableComponent } from './top-n-table.component';

describe('TopNTableComponent', () => {
  let component: TopNTableComponent;
  let fixture: ComponentFixture<TopNTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopNTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopNTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
