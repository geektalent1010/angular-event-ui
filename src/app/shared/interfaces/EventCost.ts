import { PackageData } from "./Package";

export interface EventCostData {
    refCodes: string,
    rates: RateData,
    customPackage: PackageData,
    nonMember?: boolean
};

export interface RateData {
    earlyBirdStartDate: string,
    earlyBirdEndDate: string,
    earlyBirdRate: string,
    preEventBirdStartDate: string,
    preEventBirdEndDate: string,
    preEventBirdRate: string,
    duringEventBirdStartDate: string,
    duringEventBirdEndDate: string,
    duringEventBirdRate: string,
};