import { XRef, Link } from "src/types";

export interface SidebarEntity {
  title: string
  entityName: string,
  identifiers: Array<Identifier>,
  synonyms: Array<string>,
  occurrences: Array<string> // HTML element IDs 
  xrefs?: Array<XRef>
  links?: Array<Link>
}

export interface Identifier {
  type: string
  value: string
}
