import { XRef, EntityID } from "src/types";
import {Link} from './links';

export interface SidebarEntity {
  title: string
  entityID: EntityID,
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
