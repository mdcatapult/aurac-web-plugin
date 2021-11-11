import {Entity, XRef} from 'src/types/types';

export interface SidebarEntity {
  metadata: any,
  title: string
  entityName: string,
  identifiers: Array<Identifier>,
  synonyms: Array<string>,
  occurrences: Array<string> // HTML element IDs
  xrefs?: Array<XRef>
}

export interface Identifier {
  type: string
  value: string
}
