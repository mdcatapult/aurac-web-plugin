import {environment} from './environments/environment';

export type MessageType =
  'ner_current_page'
  | 'get_page_contents'
  | 'markup_page'
  | 'compound_x-refs'
  | 'x-ref_result'
  | 'save-settings'
  | 'load-settings';

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

export interface XRefMessage extends Message {
  body: Array<XRef>;
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

export type LeadmineResult = {
  entities: {
    resolvedEntity: string,
  }[],
};

export type ConverterResult = {
  input: string,
  output: string,
};

export type XRef = {
  compoundName: string,
  databaseName: string,
  url: string,
};

export type Settings = {
  leadmineURL: string,
  compoundConverterURL: string,
  unichemURL: string,
};

export const defaultSettings: Settings = {
  leadmineURL: environment.leadmineURL,
  compoundConverterURL: environment.compoundConverterURL,
  unichemURL: environment.unichemURL,
};
