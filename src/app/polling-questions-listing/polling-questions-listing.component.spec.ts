import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollingQuestionsListingComponent } from './polling-questions-listing.component';

describe('PollingQuestionsListingComponent', () => {
  let component: PollingQuestionsListingComponent;
  let fixture: ComponentFixture<PollingQuestionsListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PollingQuestionsListingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PollingQuestionsListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
