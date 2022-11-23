import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentUserListingComponent } from './current-user-listing.component';

describe('CurrentUserListingComponent', () => {
  let component: CurrentUserListingComponent;
  let fixture: ComponentFixture<CurrentUserListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurrentUserListingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentUserListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
