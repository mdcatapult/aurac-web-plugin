import {ChemblRepresentationElements, inchiKeyLength} from './types';


export module ChEMBL {

  // on ChEMBL, InChI, InChIKey and SMILES are inputs
  export function getChemblRepresentationElements(): ChemblRepresentationElements {

    // the same id is used on 8 different HTML elements!!!!! so cannot getElementById as only the first one is returned
    const chemblRepresentations = document.querySelectorAll('[id="CompReps-canonicalSmiles"]') as NodeListOf<HTMLInputElement>;

    const representationElements: ChemblRepresentationElements = {inchi: [], inchikey: [], smiles: []};

    chemblRepresentations.forEach((rep: HTMLInputElement) => {
      if (rep.value.length === inchiKeyLength) {
        representationElements.inchikey.push(rep);
      } else if (rep.value.startsWith('InChI=')) {
        representationElements.inchi.push(rep);
      } else {
        representationElements.smiles.push(rep);
      }
    });

    return representationElements;
  }

  export function isChemblPage(): boolean {
    return document.location.href.includes('www.ebi.ac.uk/chembl')
  }

}
