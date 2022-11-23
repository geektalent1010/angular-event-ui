import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalMailingComponent } from './internal-mailing.component';

describe('InternalMailingComponent', () => {
  let component: InternalMailingComponent;
  let fixture: ComponentFixture<InternalMailingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InternalMailingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InternalMailingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
