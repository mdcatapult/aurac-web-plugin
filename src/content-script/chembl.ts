import {ChemblRepresentations, Entity, inchiKeyLength} from './types';
import {Card} from './card';
import {Sidebar} from './sidebar';
import {Globals} from './globals'


export module ChEMBL {

  // on ChEMBL, InChI, InChIKey and SMILES values are in input tags
  function getChemblRepresentations(): HTMLInputElement[] {
    return Array.from(document.querySelectorAll('[id="CompReps-canonicalSmiles"]') as NodeListOf<HTMLInputElement>);
  }

  // return an array of unique SMILES, InChI and InChIKey values from ChEMBL representations
  export function getChemblRepresentationValues(): Array<string> {
    const uniqueRepresentations = new Set(getChemblRepresentations().map(representation => representation.value));
    return Array.from(uniqueRepresentations);
  }


  export function createChemblRepresentationsObject(): ChemblRepresentations {
    // the same id is used on 8 different HTML elements!!!!! so cannot getElementById as only the first one is returned
    const chemblRepresentations = getChemblRepresentations();

    const representationElements: ChemblRepresentations = {inchi: [], inchikey: [], smiles: []};

    // populate ChemblRepresentations object based on format of string
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
    return Globals.document.location.href.includes('www.ebi.ac.uk/chembl');
  }

  // wraps input tag in aurac-highlight and adds event listener
  export function highlight(selector: HTMLInputElement[], entity: Entity) {
    selector.forEach(element => {
      try {
        // create a copy of the input element
        const clonedElement = element.cloneNode(true);

        // create the highlight span and set classname and styling
        const auracHighlightSpan = Globals.document.createElement('span');
        auracHighlightSpan.className = 'aurac-highlight';
        auracHighlightSpan.style.backgroundColor = `${entity.recognisingDict.htmlColor}`;
        auracHighlightSpan.style.position = 'relative';
        auracHighlightSpan.style.cursor = 'pointer';

        // append the cloned input element to the highlight span
        auracHighlightSpan.appendChild(clonedElement);

        // add highlight span to the DOM and remove unhighlighted input element
        element.parentNode?.insertBefore(auracHighlightSpan, element);
        element.parentNode?.removeChild(element);

        // add listener
        Card.populateEntityToOccurrences(entity.entityText, auracHighlightSpan);
        auracHighlightSpan.addEventListener('click', Sidebar.entityClickHandler(entity, auracHighlightSpan));
      } catch (e) {
        console.error(e);
      }
    });
  }

  export function highlightHandler(entity: Entity, chemblRepresentationElements: ChemblRepresentations) {
    switch (entity.recognisingDict.entityType) {
      case 'SMILES':
        ChEMBL.highlight(chemblRepresentationElements.smiles, entity);
        break;
      case 'InChI':
        if (entity.entityText.length === inchiKeyLength) {
          ChEMBL.highlight(chemblRepresentationElements.inchikey, entity);
        } else {
          ChEMBL.highlight(chemblRepresentationElements.inchi, entity);
        }
        break;
    }
  }

}
