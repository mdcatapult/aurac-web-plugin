import { Link } from './externalLinks'

export type Entity = {
  entityText: string,
  resolvedEntity: string,
  entityGroup: string,
  recognisingDict: {
    htmlColor: string,
    entityType: string,
    source: string,
  },
}

export type SavedCard = Entity & {
  time: string,
  originalURL: string,
  links: Link[]
}

export type ChemblRepresentationElements = {
  inchikey: HTMLInputElement[],
  inchi: HTMLInputElement[],
  smiles: HTMLInputElement[]
}

export type chemicalFormula = {
  formulaNode: Element;
  formulaText: string;
};

// An InChIKey is always 27 characters long (blocks of 14, 10 and 1 characters, separated by a dash)
export const inchiKeyLength = 27
