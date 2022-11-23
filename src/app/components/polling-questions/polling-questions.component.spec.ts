import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollingQuestionsComponent } from './polling-questions.component';

describe('PollingQuestionsComponent', () => {
  let component: PollingQuestionsComponent;
  let fixture: ComponentFixture<PollingQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PollingQuestionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PollingQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
