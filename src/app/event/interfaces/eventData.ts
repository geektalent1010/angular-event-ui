import { WorkflowData } from './customPage';
import { EventCostData } from './EventCost';
export interface EventData {
  noSessions: Boolean;
  noDiscounts: Boolean;
  noQualifications: Boolean;
  pageBuilderLaunched: Boolean;
  EventInfo: any;
  GooglePaymentData: any;
  regtypesList: any[];
  eventCosts: EventCostData[];
  discountList: any[];
  addedQualifications: any[];
  sessionList: any[];
  questionsList: any[];
  exhibitorAllotmentList: any[];
  membershipInfoList: any[];
  businessRules: any[];
  pageList: WorkflowData[];
  // emailBuilder: { [key: string]: any };
  emailBuilder: any;
  badgeDesigner: { [key: string]: any };
}
