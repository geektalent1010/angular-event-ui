import { TestBed } from '@angular/core/testing';

import { SessionFinderService } from './session-finder.service';

describe('SessionFinderService', () => {
  let service: SessionFinderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionFinderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
