import {environment} from './environments/environment';

export type MessageType =
  'ner_current_page'
  | 'get_page_contents'
  | 'markup_page'
  | 'compound_x-refs'
  | 'x-ref_result'
  | 'settings-changed'
  | 'log'
  | 'toggle_sidebar'
  | 'sidebar_rendered'
  | 'ner_lookup_performed'
  | 'export_csv';

export interface Message {
  type: MessageType;
  body?: any;
  level?: MessageLevel;
}

export type MessageLevel = 'debug' | 'info' | 'log' | 'warn' | 'error';

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
  level: MessageLevel;
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
  urls: DictionaryURLs,
  xRefConfig: {[key: string]: boolean},
}

export type DictionaryURLs = {
  leadmineURL: string,
  compoundConverterURL: string,
  unichemURL: string,
  pdfConverterURL: string,
};

export const defaultSettings: Settings = {
  urls: {
    leadmineURL: environment.leadmineURL,
    compoundConverterURL: environment.compoundConverterURL,
    unichemURL: environment.unichemURL,
    pdfConverterURL: environment.pdfConverterURL,
  },
  xRefConfig: {},
};

export const DictionaryURLKeys = {
  leadmineURL : 'leadmineURL',
  compoundConverterURL : 'compoundConverterURL',
  unichemURL : 'unichemURL',
  pdfConverterURL : 'pdfConverterURL'
};
