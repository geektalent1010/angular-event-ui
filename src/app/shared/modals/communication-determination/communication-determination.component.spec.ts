import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationDeterminationComponent } from './communication-determination.component';

describe('CommunicationDeterminationComponent', () => {
  let component: CommunicationDeterminationComponent;
  let fixture: ComponentFixture<CommunicationDeterminationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommunicationDeterminationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationDeterminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
