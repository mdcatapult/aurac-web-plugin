import {Entity, SavedCard} from './types'
import {EntityMap} from './entityMap'
import {ExternalLinks, Link} from './externalLinks';

export module Card {

  import links = ExternalLinks
  import dimensionsLink = ExternalLinks.dimensions

  export const entityToCard = new EntityMap<{ synonyms: string[], div: HTMLDivElement }>();
  export const entityToOccurrence = new EntityMap<Element[]>();
  const cardClassName = 'sidebar-text';
  export const collapseArrow = '&#60;';
  export const expandArrow = '&#62;';
  const rightArrow = '&#8594';
  const leftArrow = '&#8592';
  const crossButton = '&#215;';
  const highlightElements: Array<HighlightHtmlColours> = [];
  const geneAndProtein = 'Gene or Protein'
  const disease = 'Biological'
  const chemical = 'Chemical'
  const cardStorageKey = 'cards'

  // This class stores the HTML of all aurac-highlight elements before and after we change them. That way when they are no longer
  // highlighted by our search they can return to their original HTML state
  type HighlightHtmlColours = {
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

  // Creates a card for a given entity
  export function create(information: Entity, synonyms: string[]): HTMLDivElement {
    const card: HTMLDivElement = document.createElement('div');
    card.className = cardClassName;
    card.style.backgroundColor = information.recognisingDict.htmlColor;

    const entity: string = information.entityText.toLowerCase().replace(/\s/g, '%20');

    const entityLinks = getEntityLinks(information)
    const links = createListOfLinks(entity, entityLinks);

    card.appendChild(createCardControls(information, entityLinks, synonyms))

    card.insertAdjacentHTML('beforeend', `<p>${synonyms.toString()}</p>`);
    card.insertAdjacentHTML('beforeend', `<p>Links:</p>`)
    card.appendChild(links)
    card.insertAdjacentHTML('beforeend', `<p class='aurac-mdc-entity-type'>Entity Type: ${information.recognisingDict.entityType}</p>`);

    const xrefHTML: HTMLDivElement = document.createElement('div');
    xrefHTML.className = information.entityText;
    card.appendChild(xrefHTML);
    return card;
  }

  function createCardControls(entityData: Entity, entityLinks: Link[], synonyms: string[]): HTMLElement {
    const controls: HTMLSpanElement = document.createElement('span');
    controls.className = 'aurac-card-controls'

    const removeButton = createRemoveEntityFromSidebarButtonElement(entityData);
    controls.appendChild(removeButton)

    const saveButton = createSaveButton(entityData, entityLinks);
    controls.appendChild(saveButton);

    const arrowButtons = createArrowButtonElements(entityData, synonyms);
    controls.appendChild(arrowButtons)

    const occurrenceCounts = createOccurrenceCounts(entityData, synonyms);
    controls.appendChild(occurrenceCounts)

    return controls
  }

  function createArrowButtonElements(information: Entity, synonyms: string[]): HTMLElement {
    const arrowButtons: HTMLDivElement = document.createElement('div');
    arrowButtons.className = 'aurac-arrow-buttons';

    const leftArrowButtonElement = document.createElement('button');
    leftArrowButtonElement.innerHTML = leftArrow;
    leftArrowButtonElement.className = 'aurac-left-arrow-button';
    arrowButtons.appendChild(leftArrowButtonElement);

    const rightArrowButtonElement = document.createElement('button');
    rightArrowButtonElement.innerHTML = rightArrow;
    rightArrowButtonElement.className = 'aurac-right-arrow-button';
    arrowButtons.appendChild(rightArrowButtonElement);

    const nerTerm = synonyms.length > 1 ? information.resolvedEntity : information.entityText
    const arrowProperties: ArrowButtonProperties = {
      nerTerm: nerTerm,
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
    return arrowButtons;
  }

  function pressArrowButton(arrowProperties: ArrowButtonProperties, direction: 'left' | 'right'): void {
    Array.from(entityToOccurrence.values()).forEach(entity => {
      entity.forEach(occurrence => toggleHighlightColor(occurrence, highlightElements));
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

    highlightElements.push(...getNerHighlightColors(entityToOccurrence.get(arrowProperties.nerTerm)!))

    const targetElement = entityToOccurrence.get(arrowProperties.nerTerm)![arrowProperties.positionInArray];

    console.log(arrowProperties.nerTerm, entityToOccurrence)
    console.log(targetElement)
    targetElement.scrollIntoView({behavior: 'smooth'});

    toggleHighlightColor(targetElement, highlightElements);

    const occurrencesElement = document.getElementById(`${arrowProperties.nerTerm}-occurrences`);
    occurrencesElement!.innerText = `${arrowProperties.positionInArray + 1} / ${entityToOccurrence.get(arrowProperties.nerTerm)!.length}`;
    arrowProperties.isClicked = true;
  }

  function toggleHighlightColor(nerElement: Element, highlightedElements: HighlightHtmlColours[]): void {
    const auracHighlightArray = Array.from(highlightedElements);
    auracHighlightArray.forEach(element => {
      element.elementName.innerHTML = element.elementName === nerElement ? element.colourAfter : element.colourBefore;
    });
  }

  function createOccurrenceCounts(information: Entity, synonyms: string[]): HTMLElement {
    const entityText = synonyms.length === 1 ? information.entityText : information.resolvedEntity;
    const occurrenceElement = document.createElement('span');
    occurrenceElement.id = `${entityText}-occurrences`;
    occurrenceElement.style.display = 'flex';
    occurrenceElement.style.justifyContent = 'flex-end';

    let numOfOccurrences = 0
    synonyms.forEach(synonym => numOfOccurrences = numOfOccurrences + entityToOccurrence.get(synonym)!.length)
    occurrenceElement.innerText = `${numOfOccurrences} matches found`;
    return occurrenceElement
  }

  function createSaveButton(information: Entity, links: Link[]): HTMLElement {
    const saveButton = document.createElement('button')

    const storedCardsString = window.localStorage.getItem(cardStorageKey)
    const savedCards = storedCardsString === null ? [] : JSON.parse(storedCardsString) as SavedCard[]

    saveButton.innerHTML = savedCards.some(card => card.entityText === information.entityText) ? 'Saved' : '&#128190;'
    saveButton.className = 'save-button'
    saveButton.addEventListener('click', () => save(information, links, saveButton))
    return saveButton
  }

  function getNerHighlightColors(highlightedNerTerms: Element[]): HighlightHtmlColours[] {
    return highlightedNerTerms.map(element => {
      const index = highlightedNerTerms.indexOf(element);
      const elementName = element;
      const colourBefore = element.innerHTML;
      const colourAfter = element.textContent!.fontcolor('blue');
      return {index, elementName, colourBefore, colourAfter};
    });
  }

  function createRemoveEntityFromSidebarButtonElement(information: Entity): HTMLElement {
    const removeEntityFromSidebarButtonElement = document.createElement('button');
    removeEntityFromSidebarButtonElement.innerHTML = crossButton;
    removeEntityFromSidebarButtonElement.className = 'aurac-cross-button';

    removeEntityFromSidebarButtonElement.addEventListener('click', () => {
      pressRemoveEntityFromSidebarButtonElement(information);
    });
    return removeEntityFromSidebarButtonElement
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

  // saves the card data in local storage if it doesn't already exist
  function save(cardData: Entity, links: Link[], saveButton: HTMLButtonElement): void {

    const storedValue = window.localStorage.getItem(cardStorageKey)
    const savedCards = storedValue === null ? [] : JSON.parse(storedValue) as SavedCard[]

    if (savedCards.some(card => card.entityText === cardData.entityText)) {
      return
    }

    savedCards.push({
      ...cardData,
      time: new Date().toString(),
      originalURL: window.location.href,
      links: links,
    })

    window.localStorage.setItem(cardStorageKey, JSON.stringify(savedCards))
    saveButton.innerHTML = 'Saved'

  }

  export function getEntityLinks(entity: Entity): Link[] {
    let entityLinks: Array<Link> = [];
    switch (entity.entityGroup || entity.recognisingDict.entityType) {
      case geneAndProtein: {
        entityLinks = [links.ncbi, links.geneNames, links.genecards, links.ensembl,
          links.antibodies, links.pubmed, dimensionsLink, links.addGene, links.patents, links.geneProteinChemicalClinicalTrial];
        break;
      }
      case disease: {
        entityLinks = [links.drugBank, links.pubmed, dimensionsLink, links.patents, links.diseaseClinicalTrial];
        break;
      }
      case chemical: {
        entityLinks = [links.pubchem, links.drugBank, links.pubmed,
          dimensionsLink, links.patents, links.geneProteinChemicalClinicalTrial];
        break;
      }
    }
    return entityLinks
  }
}
