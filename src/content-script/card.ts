import {Entity} from './types'
import {EntityMap} from './entityMap'
import { ExternalLinks, Link} from './externalLinks';

export module Card {

  import ncbi = ExternalLinks.ncbi;
  import geneNames = ExternalLinks.geneNames;
  import antibodies = ExternalLinks.antibodies;
  import pubmed = ExternalLinks.pubmed;
  import addGene = ExternalLinks.addGene;
  import patents = ExternalLinks.patents;
  import dimensions = ExternalLinks.dimensions;
  import drugBank = ExternalLinks.drugBank;
  import pubchem = ExternalLinks.pubchem;
  import geneProteinChemicalClinicalTrial = ExternalLinks.geneProteinChemicalClinicalTrial;
  import diseaseClinicalTrial = ExternalLinks.diseaseClinicalTrial;
  import genecards = ExternalLinks.genecards;
  import ensembl = ExternalLinks.ensembl;

  export const entityToCard = new EntityMap<HTMLDivElement>();
  const entityToOccurrence = new EntityMap<Element[]>();
  const cardClassName = 'sidebar-text';
  export const collapseArrow = '&#60;';
  export const expandArrow = '&#62;';
  const rightArrow = '&#8594';
  const leftArrow = '&#8592';
  const crossButton = '&#215;';
  const highlightElements: Array<AuracHighlightHtmlColours> = [];
  const geneAndProtein = 'Gene or Protein'
  const disease = 'Biological'
  const chemical = 'Chemical'

  // This class stores the HTML of all aurac-highlight elements before and after we change them. That way when they are no longer
  // highlighted by our search they can return to their original HTML state
  type AuracHighlightHtmlColours = {
    index: number;
    elementName: Element;
    colourBefore: string;
    colourAfter: string;
  }

  type ArrowButtonProperties = {
    nerTerm: string,
    nerColor: string,
    positionInArray: number,
    isClicked: boolean,
  };

  function createListOfLinks(categoryName: string, hrefList: Array<Link>): HTMLUListElement {
    const htmlListOfLinks: HTMLUListElement = document.createElement('ul')
    htmlListOfLinks.classList.add('aurac-mdc-href-list-style')
    hrefList.forEach(element => {
      const link: string = element.createUrl(categoryName)
      htmlListOfLinks.insertAdjacentHTML('beforeend', `<li><a href=${link} target="_blank"> ${element.name}</a></li>`)
    });
    return htmlListOfLinks
  }

  // Creates a card for `information`
  export function create(information: Entity): HTMLDivElement {
    const card: HTMLDivElement = document.createElement('div');
    const arrowButtonProperties = renderArrowButtonElements(card, information);
    renderOccurrenceCounts(card, information);
    renderRemoveEntityFromSidebarButtonElement(information, arrowButtonProperties);

    card.className = cardClassName;
    card.style.backgroundColor = information.recognisingDict.htmlColor;

    card.insertAdjacentHTML('beforeend', `<p>${information.entityText}</p>`);
    const entity: string = information.entityText.toLowerCase().replace(/\s/g, '%20');
    let entityLinks: Array<Link> = [];
    switch (information.entityGroup || information.recognisingDict.entityType) {
      case geneAndProtein: {
        entityLinks = [ncbi, geneNames, genecards, ensembl, antibodies, pubmed, dimensions, 
          addGene, patents, geneProteinChemicalClinicalTrial];
        break;
      }
      case disease: {
        entityLinks = [drugBank, pubmed, dimensions, patents, diseaseClinicalTrial];
        break;
      }
      case chemical: {
        entityLinks = [pubchem, drugBank, pubmed, dimensions, patents, geneProteinChemicalClinicalTrial];
        break;
      }
    }
    card.insertAdjacentHTML('beforeend', `<p>Links:</p>`)
    const links = createListOfLinks(entity, entityLinks);
    card.appendChild(links)
    card.insertAdjacentHTML('beforeend', `<p class='aurac-mdc-entity-type'>Entity Type: ${information.recognisingDict.entityType}</p>`);

    const xrefHTML: HTMLDivElement = document.createElement('div');

    xrefHTML.className = information.entityText;
    card.appendChild(xrefHTML);
    return card;
  }

  function renderArrowButtonElements(card: HTMLDivElement, information: Entity): HTMLDivElement {
    const arrowFlexProperties: HTMLDivElement = document.createElement('div');
    arrowFlexProperties.className = 'aurac-arrow-buttons';
    card.appendChild(arrowFlexProperties);

    const leftArrowButtonElement = document.createElement('button');
    leftArrowButtonElement.innerHTML = leftArrow;
    leftArrowButtonElement.className = 'aurac-left-arrow-button';
    arrowFlexProperties.appendChild(leftArrowButtonElement);

    const rightArrowButtonElement = document.createElement('button');
    rightArrowButtonElement.innerHTML = rightArrow;
    rightArrowButtonElement.className = 'aurac-right-arrow-button';
    arrowFlexProperties.appendChild(rightArrowButtonElement);

    const arrowProperties: ArrowButtonProperties = {
      nerTerm: information.entityText,
      nerColor: information.recognisingDict.htmlColor,
      positionInArray: 0,
      isClicked: false
    };

    leftArrowButtonElement.addEventListener('click', () => {
      pressArrowButton(arrowProperties, 'left');
    });

    rightArrowButtonElement.addEventListener('click', () => {
      pressArrowButton(arrowProperties, 'right');
    });
    return arrowFlexProperties;
  }

  function pressArrowButton(arrowProperties: ArrowButtonProperties, direction: 'left' | 'right'): void {
    Array.from(entityToOccurrence.values()).forEach(entity => {
      entity.forEach(occurrence => toggleHighlightColor(occurrence));
    });

    // TODO can we use a modulo here?
    if (direction === 'right') {
      if (arrowProperties.positionInArray >= entityToOccurrence.get(arrowProperties.nerTerm)!.length - 1) {
        // gone off the end of the array - reset
        arrowProperties.positionInArray = 0;
      } else if (arrowProperties.isClicked) {
        arrowProperties.positionInArray++;
      }
    } else if (arrowProperties.positionInArray > 0) { // direction is 'left'
      arrowProperties.positionInArray--;
    }

    setNerHtmlColours(entityToOccurrence.get(arrowProperties.nerTerm)!);

    const targetElement = entityToOccurrence.get(arrowProperties.nerTerm)![arrowProperties.positionInArray];
    targetElement.scrollIntoView({behavior: 'smooth'});

    toggleHighlightColor(targetElement);

    const occurrencesElement = document.getElementById(`${arrowProperties.nerTerm}-occurrences`);
    occurrencesElement!.innerText = `${arrowProperties.positionInArray + 1} / ${entityToOccurrence.get(arrowProperties.nerTerm)!.length}`;
    arrowProperties.isClicked = true;
  }

  function toggleHighlightColor(nerElement: Element): void {
    const auracHighlightArray = Array.from(highlightElements);
    auracHighlightArray.forEach(element => {
      element.elementName.innerHTML = element.elementName === nerElement ? element.colourAfter : element.colourBefore;
    });
  }

  function renderOccurrenceCounts(card: HTMLDivElement, information: Entity): void {
    const entityText = information.entityText;
    const occurrenceElement = document.createElement('span');
    occurrenceElement.id = `${entityText}-occurrences`;
    occurrenceElement.style.display = 'flex';
    occurrenceElement.style.justifyContent = 'flex-end';

    occurrenceElement.innerText = `${entityToOccurrence.get(entityText)!.length} matches found`;
    card.appendChild(occurrenceElement);
  }

  function setNerHtmlColours(highlightedNerTerms: Element[]): void {
    highlightedNerTerms.forEach(element => {
      const index = highlightedNerTerms.indexOf(element);
      const elementName = element;
      const colourBefore = element.innerHTML;
      const colourAfter = element.textContent!.fontcolor('blue');
      const nerHtmlColour = {index, elementName, colourBefore, colourAfter};
      highlightElements.push(nerHtmlColour);
    });
  }

  function renderRemoveEntityFromSidebarButtonElement(information: Entity, arrowProperties: HTMLDivElement): void {
    const removeEntityFromSidebarButtonElement = document.createElement('button');
    removeEntityFromSidebarButtonElement.innerHTML = crossButton;
    removeEntityFromSidebarButtonElement.className = 'aurac-cross-button';
    arrowProperties.appendChild(removeEntityFromSidebarButtonElement);

    removeEntityFromSidebarButtonElement.addEventListener('click', () => {
      pressRemoveEntityFromSidebarButtonElement(information);
    });
  }

  function pressRemoveEntityFromSidebarButtonElement(information: Entity): void {
    if (!document.getElementsByClassName(information.entityText).length) {
      return;
    }
    entityToCard.delete(information.entityText, document);
    const elementList: HTMLCollectionOf<Element> = document.getElementsByClassName(information.entityText);
    for (let i = 0; i < elementList.length; i++) {
      if (elementList.item(i)!.className === information.entityText) {
        const elementLocator: Element = elementList.item(i)!;
        const divToDelete: Element = elementLocator.parentElement!;
        divToDelete.remove();
      }
    }
  }

  export function setXRefHTML(xrefs: { databaseName: string, url: string, compoundName: string }[]): void {
    Array.from(document.getElementsByClassName(xrefs[0] ? xrefs[0].compoundName : '')).forEach(element => element.innerHTML = '');
    xrefs.forEach(xref => {
      const xrefElement = document.getElementsByClassName(xref.compoundName).item(0);
      xrefElement!.innerHTML += `<p> ${xref.databaseName}: <a href=${xref.url} target="_blank">${xref.url}</a></p>`;
    });
  }

  export function populateEntityToOccurrences(entityText: string, occurrence: Element): void {
    if (!entityToOccurrence.has(entityText)) {
      entityToOccurrence.set(entityText, [occurrence]);
    } else {
      entityToOccurrence.get(entityText)!.push(occurrence);
    }
  }

  export function clear(): void {
    entityToCard.clear()
    Array.from(document.getElementsByClassName(cardClassName)).forEach(card => card.parentNode!.removeChild(card))
  }
}
