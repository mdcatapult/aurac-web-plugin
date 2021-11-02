export interface SidebarEntity {
    // populate
  title: string
  entityName: string,
  identifiers: Array<Identifier>,
  synonyms: Array<string>,
  occurrences: Array<string>
}

export interface Identifier {
  type: string
  value: string
}
