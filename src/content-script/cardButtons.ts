import {cardClassName, cardStorageKey, Entity, HighlightHtmlColours, SavedCard} from './types';
import {Link} from './externalLinks';
import {SidebarButtons} from './sidebarButtons';
import {EntityMap} from './entityMap';
import {Globals} from './globals'

export module CardButtons {

  const rightArrow = '&#8594';
  const leftArrow = '&#8592';
  const crossButton = '&#215;';
  const highlightElements: Array<HighlightHtmlColours> = [];
  export const entityToOccurrence = new EntityMap<Element[]>();
  export const controlsClass = 'aurac-card-controls'
  export const baseRemoveId = 'aurac-cross-button'
  export const baseArrowId = 'aurac-arrow-button'
  export const baseSaveId = 'aurac-save-button'
  export const highlightColor = 'blue'

  type ArrowButtonProperties = {
    nerTerm: string,
    nerColor: string,
    positionInArray: number,
    isClicked: boolean,
  };

  export function getOccurrenceCounts(synonyms: string[]): number {
    let numOfOccurrences = 0;
    synonyms.forEach(synonym => numOfOccurrences = numOfOccurrences + CardButtons.entityToOccurrence.get(synonym)!.length);
    return numOfOccurrences
  }

  function createOccurrenceCounts(information: Entity, synonyms: string[]): HTMLElement {
    const entityText = synonyms.length === 1 ? information.entityText : information.resolvedEntity;
    const occurrenceElement = Globals.document.createElement('span');
    occurrenceElement.id = `${entityText}-occurrences`;
    occurrenceElement.style.display = 'flex';
    occurrenceElement.style.justifyContent = 'flex-end';

    const numOfOccurrences = getOccurrenceCounts(synonyms);
    occurrenceElement.innerText = `${numOfOccurrences} matches found`;
    return occurrenceElement;
  }

  function createRemoveEntityFromSidebarButtonElement(information: Entity, listOfEntities: Entity[]): HTMLElement {
    const removeEntityFromSidebarButtonElement = Globals.document.createElement('button');
    removeEntityFromSidebarButtonElement.innerHTML = crossButton;
    removeEntityFromSidebarButtonElement.className = 'aurac-cross-button';
    removeEntityFromSidebarButtonElement.id = `${baseRemoveId}-${information.entityText}`

    removeEntityFromSidebarButtonElement.addEventListener('click', () => {
      pressRemoveEntityFromSidebarButtonElement(information, listOfEntities);
    });
    return removeEntityFromSidebarButtonElement;
  }

  function pressRemoveEntityFromSidebarButtonElement(information: Entity, listOfEntities: Entity[]): void {
    if (!Globals.document.getElementById(information.entityText)) {
      return;
    }
    information.resolvedEntity != null ? SidebarButtons.entityToCard.delete(information.resolvedEntity, Globals.document)
      : SidebarButtons.entityToCard.delete(information.entityText, Globals.document);

    const element = Globals.document.getElementById(`${cardClassName}.${information.entityText}`);
    element?.remove();

    listOfEntities.forEach((value, index) => {
      if (value.entityText === information.entityText) {
        listOfEntities.splice(index, 1)
      }
    });

    if (Array.from(SidebarButtons.entityToCard.values()).length === 0) {
      SidebarButtons.toggleNarrative(true);
      SidebarButtons.toggleDownloadButton(false);
      SidebarButtons.toggleClearButton(false);
    }
  }

  export function createCardControls(entityData: Entity, entityLinks: Link[], synonyms: string[], listOfEntities: Entity[]): HTMLElement {
    const controls: HTMLSpanElement = Globals.document.createElement('span');
    controls.className = controlsClass;

    const removeButton = createRemoveEntityFromSidebarButtonElement(entityData, listOfEntities);
    controls.appendChild(removeButton);

    const saveButton = createSaveButton(entityData, entityLinks);
    controls.appendChild(saveButton);

    const arrowButtons = createArrowButtonElements(entityData, synonyms);
    controls.appendChild(arrowButtons);

    const occurrenceCounts = createOccurrenceCounts(entityData, synonyms);
    controls.appendChild(occurrenceCounts);

    return controls;
  }

  function createArrowButtonElements(information: Entity, synonyms: string[]): HTMLElement {
    const arrowButtons: HTMLDivElement = Globals.document.createElement('div');
    arrowButtons.className = 'aurac-arrow-buttons';

    const leftArrowButtonElement = Globals.document.createElement('button');
    leftArrowButtonElement.innerHTML = leftArrow;
    leftArrowButtonElement.className = 'aurac-left-arrow-button';
    leftArrowButtonElement.id = `left-${baseArrowId}-${information.entityText}`
    arrowButtons.appendChild(leftArrowButtonElement);

    const rightArrowButtonElement = Globals.document.createElement('button');
    rightArrowButtonElement.innerHTML = rightArrow;
    rightArrowButtonElement.className = 'aurac-right-arrow-button';
    rightArrowButtonElement.id = `right-${baseArrowId}-${information.entityText}`
    arrowButtons.appendChild(rightArrowButtonElement);

    const nerTerm = synonyms.length > 1 ? information.resolvedEntity : information.entityText;
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

  function toggleHighlightColour(nerElement: Element, highlightedElements: HighlightHtmlColours[]): void {
    const auracHighlightArray = Array.from(highlightedElements);
    auracHighlightArray.forEach(element => {
      element.elementName.innerHTML = element.elementName === nerElement ? element.colourAfter : element.colourBefore;
    });
  }

  function getNerHighlightColours(highlightedNerTerms: Element[]): HighlightHtmlColours[] {
    return highlightedNerTerms.map(element => {
      const index = highlightedNerTerms.indexOf(element);
      const elementName = element;
      const colourBefore = element.innerHTML;
      const colourAfter = element.textContent!.fontcolor(highlightColor);
      return {index, elementName, colourBefore, colourAfter};
    });
  }

  function pressArrowButton(arrowProperties: ArrowButtonProperties, direction: 'left' | 'right'): void {
    Array.from(entityToOccurrence.values()).forEach(entity => {
      entity.forEach(occurrence => toggleHighlightColour(occurrence, highlightElements));
    });

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

    highlightElements.push(...getNerHighlightColours(entityToOccurrence.get(arrowProperties.nerTerm)!));

    const targetElement = entityToOccurrence.get(arrowProperties.nerTerm)![arrowProperties.positionInArray];
    targetElement.scrollIntoView({behavior: 'smooth', block: 'center'});

    toggleHighlightColour(targetElement, highlightElements);

    const occurrencesElement = Globals.document.getElementById(`${arrowProperties.nerTerm}-occurrences`);
    occurrencesElement!.innerText = `${arrowProperties.positionInArray + 1} / ${entityToOccurrence.get(arrowProperties.nerTerm)!.length}`;
    arrowProperties.isClicked = true;
  }

  // saves the card data in local storage if it doesn't already exist
  function save(cardData: Entity, links: Link[], saveButton: HTMLButtonElement): void {

    const storedValue = window.localStorage.getItem(cardStorageKey);
    const savedCards = storedValue === null ? [] : JSON.parse(storedValue) as SavedCard[];

    if (savedCards.some(card => card.entityText === cardData.entityText)) {
      return;
    }

    savedCards.push({
      ...cardData,
      time: new Date().toString(),
      originalURL: window.location.href,
      links: links,
    });

    window.localStorage.setItem(cardStorageKey, JSON.stringify(savedCards));
    saveButton.innerHTML = 'Saved';
  }

  function createSaveButton(information: Entity, links: Link[]): HTMLElement {
    const saveButton = Globals.document.createElement('button');
    const savedCards = Globals.browser.getStoredCards(cardStorageKey)

    saveButton.innerHTML = savedCards.some(card => card.entityText === information.entityText) ? 'Saved' : '&#128190;';
    saveButton.className = 'save-button';
    saveButton.id = `${baseSaveId}-${information.entityText}`
    saveButton.addEventListener('click', () => save(information, links, saveButton));
    return saveButton;
  }

}
