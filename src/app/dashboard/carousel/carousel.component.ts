import { Component, OnInit, Input } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { TwoColumnInfoCardComponent } from '../two-column-info-card/two-column-info-card.component';
import { CardDeck } from '../card-deck';
import { SnapshotDeck } from '../snapshot-deck';
import { Top10Deck } from '../top10-deck';
import { MapDataDeck } from '../map-deck';
import { Snapshot } from '../snapshot';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  providers: [NgbCarouselConfig]
})
export class CarouselComponent implements OnInit {
  @Input() cardDecks?: CardDeck[];
  @Input() snapshotDecks?: SnapshotDeck[];
  @Input() top10Decks?: Top10Deck[];
  @Input() mapDataDecks?: MapDataDeck[];
  @Input() waiting: boolean[];
  @Input() timeRange = 4;
  constructor(config: NgbCarouselConfig) {
    // customize default values of carousels used by this component tree
    config.interval = 10000;
    config.wrap = true;
    config.keyboard = false;
    config.pauseOnHover = false;
    config.animation = false;
  }
  ngOnInit(): void {}
}
