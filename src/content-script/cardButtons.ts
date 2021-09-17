import {cardClassName, cardStorageKey, Entity, HighlightHtmlColours, SavedCard} from './types';
import {Link} from './externalLinks';
// TODO card is circular ref
import {Card} from './card';
import {SidebarButtons} from './sidebarButtons';
import {EntityMap} from './entityMap';


export module CardButtons {

  const rightArrow = '&#8594';
  const leftArrow = '&#8592';
  const crossButton = '&#215;';
  const highlightElements: Array<HighlightHtmlColours> = [];
  export const entityToOccurrence = new EntityMap<Element[]>();


  type ArrowButtonProperties = {
    nerTerm: string,
    nerColor: string,
    positionInArray: number,
    isClicked: boolean,
  };

  export function createCardControls(entityData: Entity, entityLinks: Link[], synonyms: string[]): HTMLElement {
    const controls: HTMLSpanElement = document.createElement('span');
    controls.className = 'aurac-card-controls';

    const removeButton = createRemoveEntityFromSidebarButtonElement(entityData);
    controls.appendChild(removeButton);

    const saveButton = createSaveButton(entityData, entityLinks);
    controls.appendChild(saveButton);

    const arrowButtons = createArrowButtonElements(entityData, synonyms);
    controls.appendChild(arrowButtons);

    // TODO circular ref
    const occurrenceCounts = Card.createOccurrenceCounts(entityData, synonyms);
    controls.appendChild(occurrenceCounts);

    return controls;
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

  function pressArrowButton(arrowProperties: ArrowButtonProperties, direction: 'left' | 'right'): void {
    Array.from(entityToOccurrence.values()).forEach(entity => {
      entity.forEach(occurrence => Card.toggleHighlightColour(occurrence, highlightElements));
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

    // TODO circular ref
    highlightElements.push(...Card.getNerHighlightColours(entityToOccurrence.get(arrowProperties.nerTerm)!));

    const targetElement = entityToOccurrence.get(arrowProperties.nerTerm)![arrowProperties.positionInArray];
    targetElement.scrollIntoView({behavior: 'smooth'});

    // TODO circular ref
    Card.toggleHighlightColour(targetElement, highlightElements);

    const occurrencesElement = document.getElementById(`${arrowProperties.nerTerm}-occurrences`);
    occurrencesElement!.innerText = `${arrowProperties.positionInArray + 1} / ${entityToOccurrence.get(arrowProperties.nerTerm)!.length}`;
    arrowProperties.isClicked = true;
  }


  function createSaveButton(information: Entity, links: Link[]): HTMLElement {
    const saveButton = document.createElement('button');

    const storedCardsString = window.localStorage.getItem(cardStorageKey);
    const savedCards = storedCardsString === null ? [] : JSON.parse(storedCardsString) as SavedCard[];

    saveButton.innerHTML = savedCards.some(card => card.entityText === information.entityText) ? 'Saved' : '&#128190;';
    saveButton.className = 'save-button';
    // TODO circular ref
    saveButton.addEventListener('click', () => Card.save(information, links, saveButton));
    return saveButton;
  }


  function createRemoveEntityFromSidebarButtonElement(information: Entity): HTMLElement {
    const removeEntityFromSidebarButtonElement = document.createElement('button');
    removeEntityFromSidebarButtonElement.innerHTML = crossButton;
    removeEntityFromSidebarButtonElement.className = 'aurac-cross-button';

    removeEntityFromSidebarButtonElement.addEventListener('click', () => {
      pressRemoveEntityFromSidebarButtonElement(information);
    });
    return removeEntityFromSidebarButtonElement;
  }


  function pressRemoveEntityFromSidebarButtonElement(information: Entity): void {
    if (!document.getElementById(information.entityText)) {
      return;
    }
    information.resolvedEntity != null ? SidebarButtons.entityToCard.delete(information.resolvedEntity, document)
      : SidebarButtons.entityToCard.delete(information.entityText, document);

    const element = document.getElementById(`${cardClassName}.${information.entityText}`);
    element?.remove();

    if (Array.from(SidebarButtons.entityToCard.values()).length === 0) {
      SidebarButtons.toggleClearButton(false);
    }
  }

}
