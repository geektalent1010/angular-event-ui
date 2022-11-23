import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder
} from '@angular/forms';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CardDeck } from '../card-deck';
import { DashboardService } from '../dashboard.service';
import { SnapshotDeck } from '../snapshot-deck';
import { Top10Deck } from '../top10-deck';
import { MapDataDeck } from '../map-deck';
import {
  CARD_DECK_DATA,
  SNAPSHOT_DATA,
  TOP10_DECK_DATA,
  attendeeCompanyFactory,
  sessionTableDataFactory,
  MAP_DECK_DATA
} from '../mock-data';
import evtInfo from '../evt_ids.json';

@Component({
  selector: 'app-dashboard-dropdown',
  styleUrls: ['./dashboard.component.scss'],
  template: `
    <div ngbDropdown class="d-inline-block">
      <button class="btn btn-outline-primary" id="dateMenu" ngbDropdownToggle>
        {{ selectedDateRange }}
      </button>
      <div ngbDropdownMenu aria-labelledby="dateMenu">
        <button
          class="dropdown-item"
          *ngFor="let dateRange of dateRanges"
          (click)="sendNotification(dateRange.id)"
        >
          {{ dateRange.name }}
        </button>
      </div>
    </div>
  `
})
export class DashboardDropdownComponent implements OnInit {
  dateRanges = [
    { id: 0, name: 'Today' },
    { id: 1, name: 'Yesterday' },
    { id: 2, name: 'Last 7 Days' },
    { id: 3, name: 'Last 30 Days' },
    { id: 4, name: 'Entire Event' }
  ];

  selectedDateRange: string;
  @Output() notifyParent: EventEmitter<any> = new EventEmitter();

  constructor() {}
  ngOnInit() {
    this.selectedDateRange = this.dateRanges[4].name;
  }

  sendNotification(selected: number) {
    this.selectedDateRange = this.dateRanges[selected].name;
    this.notifyParent.emit(selected);
  }
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  title = 'dashboard';
  cardDecks: CardDeck[] = [];
  snapshotDecks: SnapshotDeck[] = [];
  top10Decks: Top10Deck[] = [];
  mapDataDecks: MapDataDeck[] = [];

  selectedTimeRange: string = '4';
  waiting = {
    card: true,
    snapshot: true,
    top10: true,
    map: true
  };
  show_ids: string[] = [];
  evt_uids: string[] = [];
  // show_id_0: string;
  // evt_uid_0: string;
  // show_id_1: string;
  // evt_uid_1: string;
  // show_id_2: string;
  // evt_uid_2: string
  constructor(
    private dashboardService: DashboardService,
    private route: ActivatedRoute
  ) {}
  getSelectedTimeRange(evt: number) {
    this.selectedTimeRange = `${evt}`;
    this.waiting = {
      card: true,
      snapshot: true,
      top10: true,
      map: true
    };
    this.getData();
  }
  getData(): void {
    this.cardDecks = [];
    this.snapshotDecks = [];
    this.top10Decks = [];
    this.mapDataDecks = [];

    this.getCardDecks();
    this.getSnapshotDecks();
    this.getTableDecks();
    this.getMapDeck();
  }
  getCardDecks(): void {
    // const show_id_0 = SHOW_ID_0;
    // const evt_uid_0 = EVT_UID_0;
    // const show_id_1 = SHOW_ID_1;
    // const evt_uid_1 = EVT_UID_1;

    const year_0 = new Date().getFullYear();
    const year_1 = year_0 - 1;
    let waiting_deck = [true, true, true];

    this.cardDecks = JSON.parse(JSON.stringify(CARD_DECK_DATA));
    for (let i = 0; i < 3; i++) {
      let cardDeck: CardDeck = this.cardDecks[i];

      this.dashboardService
        .getCardDeck(
          this.show_ids[0],
          this.evt_uids[0],
          this.show_ids[1],
          this.evt_uids[1],
          i + 1,
          this.selectedTimeRange
        )
        .subscribe(results => {
          for (let j = 1; j <= cardDeck.cards.length; j++) {
            let amounts = results[`card${j}`];
            if (amounts.length > 2) {
              cardDeck.cards[j - 1].col1 = {
                amount: amounts[0],
                detail_info: 'In Person + Virtual'
              };
              cardDeck.cards[j - 1].col2 = {
                amount: amounts[1],
                detail_info: 'Virtual Only'
              };
              cardDeck.cards[j - 1].col3 = {
                amount: amounts[2],
                detail_info: '7-Day Virtual'
              };
            } else {
              let curr = amounts[0];
              let past = amounts[1];
              cardDeck.cards[j - 1].col1 = {
                amount: curr,
                detail_info: results['col1_year'] || year_0.toString()
              };
              cardDeck.cards[j - 1].col2 = {
                amount: past,
                detail_info: results['col2_year'] || year_1.toString()
              };
              let variance = curr - past;
              let percent_var = Math.round((variance / past) * 100);
              cardDeck.cards[j - 1].variance = variance;
              cardDeck.cards[j - 1].percent_variance = percent_var;
            }
          }

          this.cardDecks[i] = cardDeck;
          waiting_deck[i] = false;
          this.waiting.card = !waiting_deck.every(x => x == false);
        });
    }
  }
  getSnapshotDecks(): void {
    // const show_id_0 = SHOW_ID_0;
    // const evt_uid_0 = EVT_UID_0;

    this.snapshotDecks = JSON.parse(JSON.stringify(SNAPSHOT_DATA));

    let waiting_deck = Array(this.snapshotDecks.length).fill(true);
    for (let i = 0; i < this.snapshotDecks.length; i++) {
      let snapshotDeck = this.snapshotDecks[i];
      this.dashboardService
        .getSnapShotDeck(
          this.show_ids[0],
          this.evt_uids[0],
          i + 1,
          this.selectedTimeRange
        )
        .subscribe(results => {
          for (let j = 1; j <= snapshotDeck.snapshots.length; j++) {
            let rows = results[`snapshot${j}`];
            for (let k = 0; k < rows.length; k++) {
              snapshotDeck.snapshots[j - 1].rows[k].col2 = rows[k];
            }
          }
          this.snapshotDecks[i] = snapshotDeck;
          waiting_deck[i] = false;
          this.waiting.snapshot = !waiting_deck.every(x => x == false);
        });
    }
  }

  getTableDecks(): void {
    // const show_id_0 = SHOW_ID_0;
    // const evt_uid_0 = EVT_UID_0;

    this.top10Decks = JSON.parse(JSON.stringify(TOP10_DECK_DATA));
    let waiting_deck = Array(this.top10Decks.length).fill(true);
    for (let i = 0; i < this.top10Decks.length; i++) {
      let top10Deck = this.top10Decks[i];
      this.dashboardService
        .getTableDeck(
          this.show_ids[0],
          this.evt_uids[0],
          i + 1,
          this.selectedTimeRange
        )
        .subscribe(results => {
          for (let j = 1; j <= top10Deck.top10s.length; j++) {
            top10Deck.top10s[j - 1].headers = results['header'];
            if (top10Deck.top10s[j - 1].headers.length === 3) {
              top10Deck.top10s[j - 1].companies = top10Deck.top10s[
                j - 1
              ].companies.concat(
                results[`table${j}`].map(x =>
                  attendeeCompanyFactory(x[0], x[1], x[2], x[3])
                )
              );
            } else {
              top10Deck.top10s[j - 1].sessions = top10Deck.top10s[
                j - 1
              ].sessions.concat(
                results[`table${j}`].map(x =>
                  sessionTableDataFactory(
                    x[0],
                    x[1],
                    x[2],
                    x[3],
                    Math.round(x[4])
                  )
                )
              );
            }
          }
          this.top10Decks[i] = top10Deck;
          waiting_deck[i] = false;
          this.waiting.top10 = !waiting_deck.every(x => x == false);
        });
    }
  }
  getMapDeck(): void {
    // const show_id_0 = SHOW_ID_0;
    // const evt_uid_0 = EVT_UID_0;

    const colno = 1;
    this.mapDataDecks = JSON.parse(JSON.stringify(MAP_DECK_DATA));
    let mapDeck = this.mapDataDecks[0];
    let waiting_deck = Array(this.mapDataDecks.length).fill(true);
    this.dashboardService
      .getMapDeck(
        this.show_ids[0],
        this.evt_uids[0],
        colno,
        this.selectedTimeRange
      )
      .subscribe(results => {
        for (let i = 0; i < mapDeck.mapDatas.length; i++) {
          let chartType = mapDeck.mapDatas[i].chart;
          let coordData = results[chartType];
          let series = mapDeck.mapDatas[i].series;
          mapDeck.mapDatas[i].series = [{ ...series, data: coordData }];
        }
        this.mapDataDecks[0] = mapDeck;
        waiting_deck[0] = false;
        this.waiting.map = !waiting_deck.every(x => x == false);
      });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      console.log(params);
      let evt_uids = [];
      let show_ids = [];
      evt_uids.push(661);
      show_ids.push('661HRS21');
      // evt_uids.push(params.get('evtUid'));
      // show_ids.push(params.get('showId'));
      console.log(evt_uids);
      console.log(show_ids);
      // let info = evtInfo[+this.evt_uid_0];
      // get current + past 2 years events based on showid and evtUid
      this.dashboardService
        .getMostCurrentThreeShows(show_ids[0], evt_uids[0])
        .subscribe(results => {
          results.mostCurrentThreeShows.map(function(currentElement, index) {
            if (index > 0) {
              show_ids.push(currentElement.showId);
              evt_uids.push(currentElement.evtUid);
            }
          });
          this.show_ids = show_ids;
          this.evt_uids = evt_uids;
          this.getData();
        });

      // Returns the new value instead of the item

      // this.show_id_0 = info.show_id_0;
      // this.evt_uid_1 = info.evt_uid_1;
      // this.show_id_1 = info.show_id_1;
      // this.evt_uid_2 = info.evt_uid_2;
      // this.show_id_2 = info.show_id_2;
    });
  }
}
