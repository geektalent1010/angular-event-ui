import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollingQuestionsDetailsComponent } from './polling-questions-details.component';

describe('PollingQuestionsDetailsComponent', () => {
  let component: PollingQuestionsDetailsComponent;
  let fixture: ComponentFixture<PollingQuestionsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PollingQuestionsDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PollingQuestionsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
