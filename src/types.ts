export type MessageType = 'ner_current_page' | 'get_page_contents' | 'markup_page';

export interface Message {
    type: MessageType;
    body?: any;
}

export interface StringMessage extends Message {
    body: string;
}

export interface LeadmineMessage extends Message {
    body: Array<LeadminerEntity>;
}

export interface LogMessage extends Message {
    level: string;
    message: any;
}

export type LeadminerResult = {
    created: string;
    entities: LeadminerEntity[];
};

export type LeadminerEntity = {
    beg: number;
    begInNormalizedDoc: number;
    end: number;
    endInNormalizedDoc: number;
    entityText: string;
    possiblyCorrectedText: string;
    recognisingDict: Dictionary;
    resolvedEntity: string;
    sectionType: string;
    entityGroup: string;
};

export type Dictionary = {
    enforceBracketing: boolean;
    entityType: string;
    htmlColor: string;
    maxCorrectionDistance: number;
    minimumCorrectedEntityLength: number;
    minimumEntityLength: number;
    source: string;
};
