import { PackageData } from './Package';

export interface EventCostData {
  isChecked: boolean;
  refCodes: string[];
  rates: RateData;
  customPackage: PackageData;
  zeroCost?: boolean;
  nonMember?: string;
}

export interface RateData {
  earlyBirdStartDate?: string;
  earlyBirdEndDate?: string;
  earlyBirdRate?: number;
  preEventBirdStartDate?: string;
  preEventBirdEndDate?: string;
  preEventBirdRate?: number;
  duringEventBirdStartDate?: string;
  duringEventBirdEndDate?: string;
  duringEventBirdRate?: number;
  duringEventBirdStartDate2?: string;
  duringEventBirdEndDate2?: string;
  duringEventBirdRate2?: number;
  duringEventBirdStartDate3?: string;
  duringEventBirdEndDate3?: string;
  duringEventBirdRate3?: number;
}
