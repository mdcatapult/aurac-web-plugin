import {ChemblRepresentationElements, inchiKeyLength} from './types';


export module ChEMBL {

  // on ChEMBL, InChI, InChIKey and SMILES are inputs
  export function getChemblRepresentationElements(): ChemblRepresentationElements {

    // the same id is used on 8 different HTML elements!!!!! so cannot getElementById as only the first one is returned
    const chemblRepresentations = document.querySelectorAll('[id="CompReps-canonicalSmiles"]') as NodeListOf<Element>;

    const representationElements: ChemblRepresentationElements = {inchi: [], inchikey: [], smiles: []};

    chemblRepresentations.forEach((rep: Element) => {
      // if (rep.value.length === inchiKeyLength) {
      //   representationElements.inchikey.push(rep);
      // } else if (rep.value.startsWith('InChI=')) {
      //   representationElements.inchi.push(rep);
      // } else {
      //   representationElements.smiles.push(rep);
      // }
      console.log(rep);
      // <input id="CompReps-canonicalSmiles" type="text" value="XJDKPLZUXCIMIS-HMMYKYKNSA-N">
      console.log(' <--- element')
      console.log(rep.nodeValue);
      // null
      console.log(' <--- element.nodeValue')
      console.log(rep.outerHTML);
      // <input id="CompReps-canonicalSmiles" type="text" value="XJDKPLZUXCIMIS-HMMYKYKNSA-N">
      console.log(' <--- element.outerHTML')
      console.log(rep.textContent);
      // nothing?
      console.log(' <--- element.textContent')
      console.log(rep.innerHTML);
      // nothing?
      console.log(' <--- element.innerHTML')

    });

    return representationElements;
  }

  export function isChemblPage(): boolean {
    return document.location.href.includes('www.ebi.ac.uk/chembl')
  }

}
