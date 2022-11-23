export interface QuestionData {
    id?:number,
    order?:number,
    pollingType: string,
    category: string[],
    demDetails: DemDetailData[],
    question: string,
    questionName: string,
    responseLayout: string,
    checked?: boolean,
    columns?: number,
    additionalInfoName?: string,
    additionalInfoValue?: string,
    chooseResponse: boolean
}

export interface DemDetailData {
    dedDescription: string,
    dedValue: string,
    dedDisplaySeq: string,
    demQuestion?: string
}