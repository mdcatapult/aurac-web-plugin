import {environment} from './environments/environment';

export type MessageType =
  'ner_current_page'
  | 'get_page_contents'
  | 'markup_page'
  | 'compound_x-refs'
  | 'x-ref_result'
  | 'settings-changed'
  | 'log'
  | 'content_script_toggle_sidebar'
  | 'content_script_open_sidebar'
  | 'content_script_close_sidebar'
  | 'sidebar_rendered'
  | 'ner_lookup_performed'
  | 'awaiting_response'
  | 'remove_highlights'
  | 'min-entity-length-changed'
  | 'export_csv'
  | 'open_modal'
  | 'settings_clicked'
  | 'sidebar_component_set_entities'
  | 'content_script_set_sidebar_ready'
  | 'content_script_await_sidebar_readiness'
  | 'ner_service_process_current_page'
  | 'content_script_get_page_contents'
  | 'settings_service_get_settings'
  | 'settings_service_set_settings'
  | 'settings_service_refresh_xref_sources'
  | 'content_script_open_loading_icon'
  | 'content_script_close_loading_icon';

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
  recognisingDict: LeadminerDictionary;
  resolvedEntity: string;
  sectionType: string;
  entityGroup: string;
};

export type LeadminerDictionary = {
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

export type DictionaryPath = 'proteins' | 'chemical-entities' | 'diseases'

export type Preferences = {
  minEntityLength: number,
  dictionary: DictionaryPath
}

export type XRefSources = {[key: string]: boolean}

export type Settings = {
  urls: DictionaryURLs,
  xRefSources: XRefSources,
  preferences: Preferences
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
  xRefSources: {},
  preferences: {
    minEntityLength: 2,
    dictionary: 'proteins'
  }
};

export const DictionaryURLKeys = {
  leadmineURL : 'leadmineURL',
  compoundConverterURL : 'compoundConverterURL',
  unichemURL : 'unichemURL',
  pdfConverterURL : 'pdfConverterURL'
};

type url = string
export type EntityCache = Map<url, Map<DictionaryPath, Array<LeadminerEntity>>>;


// Entity is a wrapper for a leadminer entity with any extra functional
// information.
export interface Entity {
  synonyms: Set<string>
  identifiers?: Map<string,string>;
  occurrences?: Array<string>; // contains the id's of highlighted spans.
  metadata?: Object
  // Other stuff should go here - e.g. cross references.
}

// DictionaryEntities is a wrapper for all the entities found when running NER.
export interface DictionaryEntities {
    show: boolean;
    entities: Map<string, Entity>;
}

// Holds all entities on a page in valid dictionaries.
export type TabEntities = {
    [key in DictionaryPath]?: DictionaryEntities;
}

export interface DictionaryID {
    tab: number;
    dictionary: DictionaryPath;
}

export interface EntityID extends DictionaryID {
    identifier: string;
}

export interface SynonymID extends EntityID {
    synonym: string;
}

export interface OccurrenceID extends EntityID {
    occurrence: string;
}

export type ChangeIdentifier = number | DictionaryID | EntityID | SynonymID | OccurrenceID

// EntityChange describes where a change to the cache has been made and the 
// result of the change.
export interface EntityChange {
    identifier: ChangeIdentifier;
    result: TabEntities | DictionaryEntities | Entity | Map<string,LeadminerEntity>;
}