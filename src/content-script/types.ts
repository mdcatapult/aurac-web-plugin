import {Link} from './externalLinks'

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

export type ChemblRepresentations = {
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

// This class stores the HTML of all aurac-highlight elements before and after we change them. That way when they are no longer
// highlighted by our search they can return to their original HTML state
export type HighlightHtmlColours = {
  index: number;
  elementName: Element;
  colourBefore: string;
  colourAfter: string;
}


export const EntityGroupColours: { [name: string]: string }   = {
  'Chemical Identifiers' : "#C3FCF1",
  'Chemical General' : "#00C9AD",
  'Other' : "#009962",
  'Chemical' : "#1A7E55",
  'Biological' : "#C35354",
  'Biological Identifiers' : "#FF8885",
  'General Chemical Identifiers' : "#E0B288",
  'Gene or Protein Class' : "#FFC0BA",
  'Gene or Protein' : "#B9A89A",
  'Noise' : "#DFE0DF",
  'Activity Terms' : "#F0972D",
  'Identifiers' : "#9CB0A4"
}

export const cardClassName = 'sidebar-text';

export const cardStorageKey = 'cards';

