
export interface Identifier {
    type: string;
    value: string;
}

export interface SidebarEntity {
    identifiers: Array<Identifier>;
    synonyms: Array<string>;
    occurrences: Array<string>;
    metadata?: object;
}
  