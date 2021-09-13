import {Entity, SavedCard} from './types'
import {EntityMap} from './entityMap'
import {ExternalLinks, Link} from './externalLinks';

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
  const cardStorageKey = 'cards'

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

  // Creates a card for a given entity
  export function create(information: Entity): HTMLDivElement {
    const card: HTMLDivElement = document.createElement('div');
    card.className = cardClassName;
    card.style.backgroundColor = information.recognisingDict.htmlColor;

    const entity: string = information.entityText.toLowerCase().replace(/\s/g, '%20');

    const entityLinks = getEntityLinks(information)
    const links = createListOfLinks(entity, entityLinks);

    card.appendChild(renderCardControls(card, information, entityLinks))

    card.insertAdjacentHTML('beforeend', `<p>${information.entityText}</p>`);
    card.insertAdjacentHTML('beforeend', `<p>Links:</p>`)
    card.appendChild(links)
    card.insertAdjacentHTML('beforeend', `<p class='aurac-mdc-entity-type'>Entity Type: ${information.recognisingDict.entityType}</p>`);

    const xrefHTML: HTMLDivElement = document.createElement('div');
    xrefHTML.className = information.entityText;
    card.appendChild(xrefHTML);
    return card;
  }

  function renderCardControls(card: HTMLElement, information: Entity, entityLinks: Link[]): HTMLElement {
    const controls: HTMLSpanElement = document.createElement('span');
    controls.className = 'aurac-card-controls'
    card.appendChild(controls)

    const removeButton = renderRemoveEntityFromSidebarButtonElement(information);
    controls.appendChild(removeButton)

    const saveButton = renderSaveButton(information, entityLinks);
    controls.appendChild(saveButton);

    const arrowButtons = renderArrowButtonElements(controls, information);
    controls.appendChild(arrowButtons)

    const occurrenceCounts = renderOccurrenceCounts(controls, information);
    controls.appendChild(occurrenceCounts)

    return controls
  }

  function renderArrowButtonElements(parent: HTMLElement, information: Entity): HTMLElement {
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
    return arrowButtons;
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

  function renderOccurrenceCounts(card: HTMLElement, information: Entity): HTMLElement {
    const entityText = information.entityText;
    const occurrenceElement = document.createElement('span');
    occurrenceElement.id = `${entityText}-occurrences`;
    occurrenceElement.style.display = 'flex';
    occurrenceElement.style.justifyContent = 'flex-end';

    occurrenceElement.innerText = `${entityToOccurrence.get(entityText)!.length} matches found`;
    return occurrenceElement
  }

  function renderSaveButton(information: Entity, links: Link[]): HTMLElement {
    const saveButton = document.createElement('button')

    const storedCardsString = window.localStorage.getItem(cardStorageKey)
    const savedCards = storedCardsString === null ? [] : JSON.parse(storedCardsString) as SavedCard[]

    saveButton.innerHTML = savedCards.some(card => card.entityText === information.entityText) ? 'Saved' : '&#128190;'
    saveButton.className = 'save-button'
    saveButton.addEventListener('click', () => save(information, links, saveButton))
    return saveButton
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

  function renderRemoveEntityFromSidebarButtonElement(information: Entity): HTMLElement {
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
    return entityLinks
  }
}
