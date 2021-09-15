import {ChemblRepresentationElements, inchiKeyLength} from './types';


export module ChEMBL {

  // Find SMILES, InChI and InChIKey values in representations section of ChEMBL website
  export function chemblRepresentations(): Array<string> {

    function getRepresentationValue(className: string): string | null {
      return document.getElementsByClassName(className)[0]?.children[0].attributes[1].textContent;
    }

    const representations: Array<string> = ['BCK-CanonicalSmiles', 'BCK-StandardInchi', 'BCK-StandardInchiKey'];
    const representationValues: (string | null)[] = representations.map(representation => getRepresentationValue(representation));
    return representationValues.filter(<(val: string | null) => val is string> (val => typeof val === 'string'));
  }


  // on ChEMBL, InChI, InChIKey and SMILES are inputs - get these elements
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

  // check if current page is ChEMBL
  export function isChemblPage(): boolean {
    return document.location.href.includes('www.ebi.ac.uk/chembl');
  }

}
