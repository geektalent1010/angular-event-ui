import { CardDeck } from './card-deck';
import { Snapshot, snapshotRowFactory, TwoColumnRow } from './snapshot';
import { SnapshotDeck } from './snapshot-deck';
import { Card } from './card';
import { Column } from './column';
import { Top10Deck } from './top10-deck';
import { MapDataDeck } from './map-deck';
import worldData from './assets/world-map.json';
import usaData from './assets/us-map.json';
export const CARD_DECK_DATA: CardDeck[] = [
  {
    pos: 1,
    cards: [
      {
        pos: 1,
        title: 'Total Registrations',
        col1: { amount: 5202, detail_info: '2020' },
        col2: { amount: 3660, detail_info: '2019' },
        percent_variance: 42,
        variance: 1542,
        variance_symbol: '#'
      },
      {
        pos: 2,
        title: 'Total Domestic Registrations',
        col1: { amount: 4650, detail_info: '2020' },
        col2: { amount: 3286, detail_info: '2019' },
        percent_variance: 42,
        variance: 1364,
        variance_symbol: '#'
      },
      {
        pos: 3,
        title: 'Total International Registrations',
        col1: { amount: 552, detail_info: '2020' },
        col2: { amount: 374, detail_info: '2019' },
        percent_variance: 48,
        variance: 178,
        variance_symbol: '#'
      },
      {
        pos: 4,
        title: 'Attendees',
        col1: { amount: 5101, detail_info: '2020' },
        col2: { amount: 3648, detail_info: '2019' },
        percent_variance: 40,
        variance: 1453,
        variance_symbol: '#'
      },
      {
        pos: 5,
        title: 'Exhibitors',
        col1: { amount: 86, detail_info: '2020' },
        col2: { amount: 10, detail_info: '2019' },
        percent_variance: 760,
        variance: 76,
        variance_symbol: '#'
      },
      {
        pos: 6,
        title: 'Other',
        col1: { amount: 15, detail_info: '2020' },
        col2: { amount: 2, detail_info: '2019' },
        percent_variance: 650,
        variance: 13,
        variance_symbol: '#'
      },
      {
        pos: 7,
        title: 'Total Exhibiting Companies',
        col1: { amount: 142, detail_info: '2020' },
        col2: { amount: 142, detail_info: '2019' },
        percent_variance: 0,
        variance: 0,
        variance_symbol: '#'
      }
    ]
  },
  {
    pos: 2,
    cards: [
      {
        pos: 1,
        title: 'Total Sales',
        col1: { amount: 3318449, detail_info: '2020' },
        col2: { amount: 2777973, detail_info: '2019' },
        percent_variance: 19,
        variance: 540476,
        variance_symbol: '$'
      },
      {
        pos: 2,
        title: 'Total Badge Sales',
        col1: { amount: 3266789, detail_info: '2020' },
        col2: { amount: 2770378, detail_info: '2019' },
        percent_variance: 18,
        variance: 496411,
        variance_symbol: '$'
      },
      {
        pos: 3,
        title: 'Total Session Sales',
        col1: { amount: 51660, detail_info: '2020' },
        col2: { amount: 7595, detail_info: '2019' },
        percent_variance: 580,
        variance: 44065,
        variance_symbol: '$'
      }
    ]
  },
  {
    pos: 3,
    cards: [
      {
        pos: 1,
        title: 'Total Sessions Sold',
        col1: { amount: 2419, detail_info: '2020' },
        col2: { amount: 2411, detail_info: '2019' },
        percent_variance: 0,
        variance: 8,
        variance_symbol: '#'
      },
      // {
      //   pos: 2,
      //   title: 'Total Attendees',
      //   col1: { amount: 10, detail_info: 'In Person + Virtual' },
      //   col2: { amount: 20, detail_info: 'Virtual Only' },
      //   col3: { amount: 30, detail_info: '7-day Virtual' }
      // }
    ]
  }
];

let registrationData: [string, number][] = [
  ['Domestic - Attendees', 4557],
  ['International - Attendees', 544],
  ['Sub Total', 5101],
  ['Domestic - Exhibitors', 82],
  ['International - Exhibitors', 4],
  ['Sub Total', 86],
  ['Domestic - Other', 11],
  ['International - Other', 4],
  ['Sub Total', 15],
  ['Total Registrations', 5202]
];

let rowsRegistration: TwoColumnRow[] = [];

for (let data of registrationData) {
  let snapshotRow: TwoColumnRow = snapshotRowFactory(data[0], data[1]);
  snapshotRow.formatting.highlightColor = data[0].includes('Total')
    ? 'rgba(211,211,211,0.3)'
    : '';
  rowsRegistration = rowsRegistration.concat(snapshotRow);
}
let exhibitorData: [string, number][] = [
  ['Companies w/ Registrants', 9],
  ['Companies w/o Registrants', 133],
  ['Total Companies', 142],
  ['United States', 137],
  ['International', 5],
  ['Missing Country', 0],
  ['Total Companies', 142],
  ['Total Square Footage', 4100]
];
let rowsExhibitor: TwoColumnRow[] = [];
for (let data of exhibitorData) {
  let snapshotRow: TwoColumnRow = snapshotRowFactory(data[0], data[1]);
  snapshotRow.formatting.highlightColor = data[0].includes('Total')
    ? 'rgba(211,211,211,0.3)'
    : '';
  snapshotRow.formatting.col2Suffix = data[0].includes('Footage')
    ? ' sq ft'
    : '';
  rowsExhibitor = rowsExhibitor.concat(snapshotRow);
}

let financialData: [string, string, number][] = [
  ['+', 'Sales', 3318449],
  ['+', 'Debit Adjustments', 0],
  ['-', 'Credit Adjustments', 0],
  ['-', 'Purchase Orders', 0],
  ['', 'Total', 3318449],
  ['+', 'Payments', -3052245],
  ['-', 'Refunds', 0],
  ['+', 'Overpayments', 6642],
  ['', 'Total Collected', -3052245],
  ['', 'Left to Collect', 6140105]
];
let rowsFinancial: TwoColumnRow[] = [];
for (let data of financialData) {
  let snapshotRow: TwoColumnRow = snapshotRowFactory(
    data.slice(0, 2).join(' '),
    data[2]
  );
  snapshotRow.formatting.highlightColor = data[1].includes('Total')
    ? 'rgba(211,211,211,0.3)'
    : '';
  snapshotRow.formatting.col2Prefix = '$';
  rowsFinancial = rowsFinancial.concat(snapshotRow);
}

let sessionData: [string, number][] = [
  ['Sold Out', 0],
  ['75% - 99% Sold', 2],
  ['50% - 74% Sold', 2],
  ['25% - 49% Sold', 0],
  ['1% - 24% Sold', 19],
  ['Not Purchased', 47],
  ['Total', 70],
  ['Total Sessions Sold', 3791]
];

let rowsSession: TwoColumnRow[] = [];
for (let data of sessionData) {
  let snapshotRow: TwoColumnRow = snapshotRowFactory(data[0], data[1]);
  snapshotRow.formatting.highlightColor = data[0].includes('Total')
    ? 'rgba(211,211,211,0.3)'
    : '';
  rowsSession = rowsSession.concat(snapshotRow);
}
export const SNAPSHOT_DATA: SnapshotDeck[] = [
  {
    pos: 1,
    snapshots: [
      {
        title: 'Registration Snapshot',
        subtitle: 'Registration by Geographic Region',
        rows: rowsRegistration
      },
      {
        title: 'Exhibitor Snapshot',
        subtitle: 'Exhibiting Companies',
        rows: rowsExhibitor
      }
    ]
  },
  {
    pos: 2,
    snapshots: [
      {
        title: 'Financial Snapshot',
        subtitle: 'Balance Sheet',
        rows: rowsFinancial
      }
    ]
  },
  {
    pos: 3,
    snapshots: [
      {
        title: 'Session Snapshot',
        subtitle: 'Session Breakdown by Percentage Sold',
        rows: rowsSession
      }
    ]
  }
];

export interface AttendeeCompany {
  id: number;
  name: string;
  count: number;
  totalSales: number;
}

export function attendeeCompanyFactory(
  id: number,
  name: string,
  count: number,
  totalSales: number
): AttendeeCompany {
  return { id: id, name: name, count: count, totalSales: totalSales };
}

const attendeeCompanyData: [string, number, number][] = [
  ['---', 303, 195235],
  ['COMPUSYSTEMS, INC', 119, 67385],
  ['CSI', 64, 37090],
  ['SONY COMPUTER ENT AMERICA', 29, 20300],
  ['MICROSOFT CORPORATION', 21, 13000],
  ['PHILADELPHIA POLICE DEPT', 17, 13300],
  ['DISNEY INTERACTIVE', 12, 5800],
  ['TEST', 12, 4925],
  ['DISNEY INTERACTIVE MEDIA GROUP', 9, 6300],
  ['ACTIVISION PUBLISHING, INC.', 8, 4800]
];

let top10AttendeeCompanies: AttendeeCompany[] = [];
for (let i = 0; i < attendeeCompanyData.length; i++) {
  let data = attendeeCompanyData[i];
  top10AttendeeCompanies = top10AttendeeCompanies.concat(
    attendeeCompanyFactory(i, data[0], data[1], data[2])
  );
}
const TOP10_ATTENDEE_COMPANY_DATA = top10AttendeeCompanies;

export interface ExhibitorCompany {
  id: number;
  name: string;
  count: number;
  totalSales: number;
}
const exhibitorCompanyData: [string, number, number][] = [
  ['Builders Square', 27, 0],
  ['Advanced Building Magazine', 11, 90],
  ['GENERAL SHALE BRICK', 11, 750],
  ['Home Depot', 11, 41],
  ['Company', 9, 0],
  ['Home Automation Experts', 7, 7],
  ['Ace Hardware', 5, 2],
  ['Agilent Technologies, Inc.', 1, 1],
  ['Apollo Hard Wood Flooring', 1, 1],
  ['Braun Tooling', 1, 1]
];

function exhibitorCompanyFactory(
  id: number,
  name: string,
  count: number,
  totalSales: number
): ExhibitorCompany {
  return { id: id, name: name, count: count, totalSales: totalSales };
}
let top10ExhibitorCompanies: ExhibitorCompany[] = [];
for (let i = 0; i < exhibitorCompanyData.length; i++) {
  let data = exhibitorCompanyData[i];
  top10ExhibitorCompanies = top10ExhibitorCompanies.concat(
    exhibitorCompanyFactory(i, data[0], data[1], data[2])
  );
}
const TOP10_EXHIBITOR_COMPANIES: ExhibitorCompany[] = top10ExhibitorCompanies;

export interface SessionTableData {
  id: number;
  name: string;
  sold: number;
  allotted: number;
  percent_sold: number;
}
export function sessionTableDataFactory(
  id: number,
  name: string,
  sold: number,
  allotted: number,
  percent_sold: number
): SessionTableData {
  return {
    id: id,
    name: name,
    sold: sold,
    allotted: allotted,
    percent_sold: percent_sold
  };
}

export const TOP10_DECK_DATA: Top10Deck[] = [
  {
    pos: 1,
    top10s: [
      {
        pos: 1,
        title: 'Top 10 Attendee Companies',
        headers: [],
        // companies: top10AttendeeCompanies
        companies: [],
        sessions: []
      },
      {
        pos: 2,
        title: 'Top 10 Exhibitor Companies',

        headers: [],
        // companies: top10ExhibitorCompanies
        companies: [],
        sessions: []
      }
    ]
  },

  {
    pos: 2,
    top10s: [
      {
        pos: 1,
        title: 'Sessions Sold',
        headers: [],
        sessions: [],
        companies: []
      }
    ]
  }
];

export const MAP_DECK_DATA: MapDataDeck[] = [
  {
    pos: 1,
    mapDatas: [
      { chart: 'world', title: 'Registrations by Country', series: worldData },
      { chart: 'usa', title: 'Registrations by State', series: usaData }
    ]
  }
];

export const COMPLIMENTARY_PAID_DATA = {
  data: [
    { data: [14, 16, 126], label: 'Paid Registrations' },
    { data: [3172, 3644, 5076], label: 'Complimentary Registrations' }
  ],
  labels: ['2018', '2019', '2020']
};

export const REGISTRATION_SALES_DATA = {
  data: [
    {
      data: [2493.702, 3210, 5210],
      label: 'Sales'
    },
    { data: [], label: 'Registrants' }
  ],
  labels: ['2018', '2019', '2020']
};

export const WEEKS_OUT = {
  data: [
    { data: [14, 16, 126], label: '# of Registrants for 2020' },
    { data: [3172, 3644, 5076], label: '# of Registrants for 2019' },
    {
      data: [100, 200, 500],
      label: '# of Registrants for 2018'
    }
  ],
  labels: ['3', '2', '1']
};
