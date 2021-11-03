export interface SidebarEntity {
  title: string
  entityName: string,
  identifiers: Array<Identifier>,
  synonyms: Array<string>,
  occurrences: Array<string> // HTML element IDs 
}

export interface Identifier {
  type: string
  value: string
}
