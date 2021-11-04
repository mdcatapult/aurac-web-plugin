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
  | 'content_script_close_loading_icon'
  | 'content_script_highlight_entities'
  | 'settings_service_get_current_recogniser'
  | 'entity_messenger_service_highlight_clicked'
  | 'sidebar_data_service_inspect_highlight'
  | 'content_script_scroll_to_highlight'
  | 'csv_exporter_service_export_csv';

export interface Message {
  type: MessageType;
  body?: any;
  level?: MessageLevel;
}

export type MessageLevel = 'debug' | 'info' | 'log' | 'warn' | 'error';

export interface StringMessage extends Message {
  body: string;
}

export interface XRefMessage extends Message {
  body: Array<XRef>;
}

export interface LogMessage extends Message {
  level: MessageLevel;
  message: any;
}

export type ConverterResult = {
  input: string,
  output: string,
};

export type XRef = {
  compoundName: string,
  databaseName: string,
  url: string,
};

export function allRecognisers(): Recogniser[] {
  return ALL_RECOGNISERS.map(e => e)
}

const ALL_RECOGNISERS = [
  'leadmine-proteins',
  'leadmine-chemical-entities',
  'leadmine-diseases'
] as const;
type RecognisersTuple = typeof ALL_RECOGNISERS;
export type Recogniser = RecognisersTuple[number];

export type Preferences = {
  minEntityLength: number,
  recogniser: Recogniser
}

export type XRefSources = {[key: string]: boolean}

export type Settings = {
  urls: APIURLs,
  xRefSources: XRefSources,
  preferences: Preferences
}

export type APIURLs = {
  nerURL: string,
  compoundConverterURL: string,
  unichemURL: string,
  pdfConverterURL: string,
};

const devAPIURLs: APIURLs = {
  nerURL: 'http://localhost:8081',
  compoundConverterURL: 'http://localhost:8082/convert',
  unichemURL: 'http://localhost:8080',
  pdfConverterURL: 'http://localhost:8083/html'
}

const productionAPIURLs: APIURLs = {
  nerURL: 'https://ner-api.wopr.inf.mdc',
  compoundConverterURL: 'https://compound-converter.wopr.inf.mdc/convert',
  unichemURL: 'https://unichem-plus.wopr.inf.mdc',
  pdfConverterURL: 'https://pdf.wopr.inf.mdc/html',
}

export const defaultSettings: Settings = {
  urls: environment.production ? productionAPIURLs : devAPIURLs,
  xRefSources: {},
  preferences: {
    minEntityLength: 2,
    recogniser: 'leadmine-proteins'
  }
};

export interface Occurrences {
  count: number,
  id?: string[];
}

export type XPath = string
export type SynonymText = string

interface SynonymData {
  xpaths: Array<XPath>;
}

// Entity is a wrapper for a leadminer entity with any extra functional
// information.
export interface Entity {
  synonyms: Map<SynonymText, SynonymData>
  identifiers?: Map<string, string>;
  metadata?: any;
  htmlTagIDs?: Array<string>;
  // Other stuff should go here - e.g. cross references.
}

// RecogniserEntities is a wrapper for all the entities found when running NER.
export interface RecogniserEntities {
    show: boolean;
    entities: Map<string, Entity>;
}

// Holds all entities on a page in valid dictionaries.
export type TabEntities = {
    [key in Recogniser]?: RecogniserEntities;
}

export interface RecogniserID {
    tab: number;
    recogniser: Recogniser;
}

export interface EntityID extends RecogniserID {
    identifier: string;
}

export interface SynonymID extends EntityID {
    synonym: string;
}

export interface OccurrenceID extends EntityID {
    occurrence: string;
}

export type ChangeIdentifier = number | RecogniserID | EntityID | SynonymID | OccurrenceID

// EntityChange describes where a change to the cache has been made and the
// result of the change.
export interface EntityChange {
    identifier: ChangeIdentifier;
    result: TabEntities | RecogniserEntities | Entity | Map<string,Entity>;
    setterInfo?: SetterInfo
}

// Sometimes we need to pass in extra information so that the setter doesn't get in a pickle!
export type SetterInfo = 'noPropagate'

export const HIGHLIGHTED_ELEMENT_ID_DELIMITER = '@@'

export function highlightID(entityName: string, entityOccurrences: number, synonymName: string, xpathIndex: number): string {
  return [entityName, entityOccurrences, synonymName, xpathIndex].join(HIGHLIGHTED_ELEMENT_ID_DELIMITER)
}

export function parseHighlightID(id: string): [entityName: string, entityOccurrences: number, synonymName: string, xpathIndex: number] {
  const [entityName, entityOccurrences, synonymName, xpathIndex] = id.split(HIGHLIGHTED_ELEMENT_ID_DELIMITER)
  return [entityName, parseInt(entityOccurrences), synonymName, parseInt(xpathIndex)]
}

export type InspectedHighlightData = {
  entityName: string; // key for entity map
  entity: Entity;
  entityOccurrence: number;
  clickedSynonymName: string;
  synonymOccurrence: number;
}
