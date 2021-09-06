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

  export const entityToCard = new EntityMap<HTMLDivElement>();
  const entityToOccurrence = new EntityMap<Element[]>();
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
    renderArrowButtonElements(card, information);
    renderOccurrenceCounts(card, information);
    renderRemoveEntityFromSidebarButtonElement(card, information);

    card.className = 'sidebar-text';
    card.style.backgroundColor = information.recognisingDict.htmlColor;

    // If possible link directly to the gene/protein using the resolvedEntity from the entityText
    // We could move this to the externalLinks class (or elsewhere) and make them for each type of entity.
    if (information.entityGroup === 'Gene or Protein' && information.resolvedEntity) {
      const geneNameLink = geneNames.createUrl(information.resolvedEntity);
      card.insertAdjacentHTML('beforeend', `<p><a target="_blank" href="${geneNameLink}" title="Link to HGNC for this gene/protein">${information.entityText}</a></p>`);
    } else {
      card.insertAdjacentHTML('beforeend', `<p>${information.entityText}</p>`);
    }
    const entity: string = information.entityText.toLowerCase().replace(/\s/g, '%20');
    let entityLinks: Array<Link> = [];
    switch (information.entityGroup || information.recognisingDict.entityType) {
      case geneAndProtein: {
        entityLinks = [ncbi, geneNames, antibodies, pubmed, dimensions, addGene, patents, geneProteinChemicalClinicalTrial];
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

    card.insertAdjacentHTML('beforeend', `<p>Links:</p>`);
    const links = createListOfLinks(entity, entityLinks);
    card.appendChild(links)

    const xrefHTML: HTMLDivElement = document.createElement('div');
    xrefHTML.classList.add('aurac-mdc-hidden');
    xrefHTML.title = 'Links direct to pages on external sources for this entity';
    const htmlParagraphElement: HTMLParagraphElement = document.createElement('p');
    htmlParagraphElement.innerHTML = 'Cross references:'

    xrefHTML.id = information.entityText;
    xrefHTML.appendChild(htmlParagraphElement);
    card.appendChild(xrefHTML);

    const xrefHTMLList: HTMLUListElement = document.createElement('ul');
    xrefHTMLList.className = 'aurac-mdc-href-list-style';
    xrefHTMLList.id = information.entityText + '_list';
    xrefHTML.appendChild(xrefHTMLList);

    card.insertAdjacentHTML('beforeend', `<p class='aurac-mdc-entity-type'>Entity Type: ${information.recognisingDict.entityType}</p>`);

    return card;
  }

  function renderArrowButtonElements(card: HTMLDivElement, information: Entity): void {
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
  }

  function pressArrowButton(arrowProperties: ArrowButtonProperties, direction: 'left' | 'right'): void {
    Array.from(entityToOccurrence.values()).forEach(entity => {
      entity.forEach(occurrence => toggleHighlightColor(occurrence));
    });

    // TODO can we use a modulo here?
    if (direction === 'right') {
      if (arrowProperties.positionInArray >= entityToOccurrence.get(arrowProperties.nerTerm).length - 1) {
        // gone off the end of the array - reset
        arrowProperties.positionInArray = 0;
      } else if (arrowProperties.isClicked) {
        arrowProperties.positionInArray++;
      }
    } else if (arrowProperties.positionInArray > 0) { // direction is 'left'
      arrowProperties.positionInArray--;
    }

    setNerHtmlColours(entityToOccurrence.get(arrowProperties.nerTerm));

    const targetElement = entityToOccurrence.get(arrowProperties.nerTerm)[arrowProperties.positionInArray];
    targetElement.scrollIntoView({block: 'center'});

    toggleHighlightColor(targetElement);

    const occurrencesElement = document.getElementById(`${arrowProperties.nerTerm}-occurrences`);
    occurrencesElement!.innerText = `${arrowProperties.positionInArray + 1} / ${entityToOccurrence.get(arrowProperties.nerTerm).length}`;
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

    occurrenceElement.innerText = `${entityToOccurrence.get(entityText).length} matches found`;
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

  function renderRemoveEntityFromSidebarButtonElement(card: HTMLDivElement, information: Entity): void {

    const removeEntityFromSidebarButtonElement = document.createElement('button');
    removeEntityFromSidebarButtonElement.innerHTML = crossButton;
    removeEntityFromSidebarButtonElement.className = 'cross-button';
    card.appendChild(removeEntityFromSidebarButtonElement);

    removeEntityFromSidebarButtonElement.addEventListener('click', () => {
      pressRemoveEntityFromSidebarButtonElement(information);
    });
  }

  function pressRemoveEntityFromSidebarButtonElement(information: Entity): void {
    if (!document.getElementById(information.entityText)) {
      return;
    }
    entityToCard.delete(information.entityText, document);
    const element  = document.getElementById(information.entityText);
    element.parentElement.remove();
  }

  export function setXRefHTML(xrefs: { databaseName: string, url: string, compoundName: string }[]): void {
    // Remove existing xrefs
    const xrefHolder = document.getElementById(xrefs[0].compoundName + '_list');
    while (xrefHolder.firstChild) {
      xrefHolder.removeChild(xrefHolder.lastChild);
    }
    const xrefParent: Element = document.getElementById(xrefs[0].compoundName);
    // Show the parent div if there are any xrefs
    xrefs.length > 0 ? xrefParent.classList.remove('aurac-mdc-hidden') : '';
    // Then add the xrefs
    xrefs.forEach(xref => {
      const htmlListElement: HTMLLIElement = document.createElement('li');
      htmlListElement.innerHTML = `<a href=${xref.url} target="_blank" title="Link to ${xref.databaseName} reference for this entity">${xref.databaseName}</a>`;
      xrefHolder.appendChild(htmlListElement);
    });
  }

  export function populateEntityToOccurrences(entityText: string, occurrence: Element): void {
    if (!entityToOccurrence.has(entityText)) {
      entityToOccurrence.set(entityText, [occurrence]);
    } else {
      entityToOccurrence.get(entityText).push(occurrence);
    }
  }

}
