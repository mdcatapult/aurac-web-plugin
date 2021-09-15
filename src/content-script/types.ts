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

export type ChemblRepresentationElements = {
  inchikey: Element[],
  inchi: Element[],
  smiles: Element[]
}

export type chemicalFormula = {
  formulaNode: Element;
  formulaText: string;
};

// An InChIKey is always 27 characters long (blocks of 14, 10 and 1 characters, separated by a dash)
export const inchiKeyLength = 27
