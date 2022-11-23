export interface FieldData {
    label?: String,
    name?: String,
    type?: String,
    value?: any,
    static?: Boolean,
    disable?: Boolean,
    required?: Boolean | string[],
    visible?: Boolean,
    isActive?: Boolean,
    lookup?: Boolean,
    column?: Number,
}

export interface SectionData {
    label: String,
    name: String,
    fieldsList: FieldData[],
    hidden?: Boolean,
    editType?: String
}

export interface PageData {
    label: String,
    name: String,
    sectionsList: SectionData[]
}

export interface WorkflowData {
    workflow: String,
    pageList: PageData[],
}

export interface PageCustomizationConfig {
    selectedWorkflow: WorkflowData,
    selectedPage: PageData,
    selectedSection: SectionData,
    stepIndex: number,
}