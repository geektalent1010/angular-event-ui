export interface QuestionData {
    id?:number,
    order?:number,
    PollingType: string,
    category: string,
    demDetails: [
        {
            dedDescription: string,
            dedValue:number,
            demQuestion: string
        }
    ],
    question: string,
    questionName: string,
    responseLayout: string,
    checked?: boolean,
    columns?: number,
    additionalInfoName?: string,
    additionalInfoValue?: string
}