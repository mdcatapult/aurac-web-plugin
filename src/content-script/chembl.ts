import {ChemblRepresentationElements, Entity, inchiKeyLength} from './types';
import {Card} from './card';
import {Sidebar} from './sidebar';


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

  // wraps input tag in aurac-highlight and adds event listener
  export function highlight(selector: HTMLInputElement[], entity: Entity) {
    selector.map(element => {
      try {
        // create a copy of the input element
        const clonedElement = element.cloneNode(true);

        // create the highlight span and set classname and styling
        const auracHighlightSpan = document.createElement('span');
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

}
