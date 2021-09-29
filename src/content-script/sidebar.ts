import {Entity} from './types';
import {Card} from './card';
import {SidebarButtons} from './sidebarButtons';
import {CardButtons} from './cardButtons';
import { IBrowser } from './IBrowser';

export module Sidebar {

  let browserObject: IBrowser
  let documentObject: Document

  const listOfEntities: Entity[] = []
  let cardContainer: HTMLElement
  let toolsContainer: HTMLElement

  let toggleButtonElement: HTMLButtonElement;
  let clearButtonElement: HTMLButtonElement;
  export const clearButtonId = 'aurac-clear-button'
  let downloadResultsButtonElement: HTMLButtonElement;

  export const sidebarClass = 'aurac-transform aurac-sidebar aurac-sidebar--collapsed'

  export const narrativeId = 'aurac-narrative'
  export const toolsId = 'aurac-sidebar-tools'

  export function create(b: IBrowser, doc: Document): HTMLElement {

    browserObject = b
    documentObject = doc
    cardContainer = documentObject.createElement('div');
    cardContainer.id = 'card-container'
    toolsContainer = documentObject.createElement('div');


    const [logo, logoText] = createLogo();

    const sidebar = documentObject.createElement('span');
    sidebar.appendChild(logo);
    sidebar.appendChild(logoText);
    sidebar.appendChild(toolsContainer)
    sidebar.className = sidebarClass

    toggleButtonElement = SidebarButtons.createToggleButton();
    clearButtonElement = SidebarButtons.createClearButton(listOfEntities);
    clearButtonElement.id = clearButtonId
    downloadResultsButtonElement = SidebarButtons.createDownloadResultsButton(listOfEntities);

    sidebar.appendChild(toggleButtonElement);
    sidebar.appendChild(cardContainer);

    toolsContainer.className = 'aurac-sidebar-tools'
    toolsContainer.id = toolsId
    toolsContainer.appendChild(clearButtonElement);
    toolsContainer.appendChild(downloadResultsButtonElement);

    return sidebar;
  }

  export function addCard(card: HTMLDivElement): void {

    console.log(card, card.innerHTML)
    console.log('before:', cardContainer.innerHTML)
    cardContainer.appendChild(card);
    console.log('after:', cardContainer.innerHTML)
    console.log('full:')
    console.log(documentObject.body.innerHTML)
  }

  function createLogo(): [HTMLImageElement, HTMLHeadingElement] {
    const auracLogo = documentObject.createElement('img');
    const logoText = documentObject.createElement('h4');
    logoText.style.color = '#b9772e';
    auracLogo.className = 'aurac-logo';
    // @ts-ignore
    auracLogo.src = browserObject.getURL('assets/head-brains.png');

    logoText.innerText = 'Click on a highlighted entity to display further information and links below...';
    logoText.id = narrativeId;

    return [auracLogo, logoText];
  }

  export function getAuracHighlightChildren(element: Element) {
    return Array.from(element.children).filter(child => child.className === 'aurac-highlight');
  }

  // TODO move style
  function setSidebarColors(highlightedDiv: HTMLDivElement): void {
    Array.from(SidebarButtons.entityToCard.values()).forEach(card => {
      card.div.style.border = card.div === highlightedDiv ? '2px white solid' : '1px black solid';
    });
  }

  // returns an event listener which creates a new element with passed info and appends it to the passed element
  export function entityClickHandler(info: Entity, element: Element): (event: Event) => void {
    return (event: Event) => {
      if (event.type !== 'click') {
        return;
      }

      SidebarButtons.toggleNarrative(false);

      const entityId = info.resolvedEntity || info.entityText;
      if (!SidebarButtons.entityToCard.has(entityId)) {  // entity is a new sidecard
        const card = Card.create(info, [info.entityText], listOfEntities);
        SidebarButtons.entityToCard.set(entityId, {synonyms: [info.entityText], div: card});

        Sidebar.addCard(card);
        clearButtonElement = SidebarButtons.toggleClearButton(true)
        downloadResultsButtonElement = SidebarButtons.toggleDownloadButton(true);

        // @ts-ignore
        browserObject.sendMessage({type: 'compound_x-refs', body: [info.entityText, info.resolvedEntity]})
          .catch(e => console.error(e));
      } else { // entity is a synonym of existing sidecard
        const synonyms = SidebarButtons.entityToCard.get(entityId)!.synonyms;

        if (!synonyms.includes(info.entityText)) {
          synonyms.push(info.entityText);

          let synonymOccurrences: Element[] = [];
          synonyms.forEach(synonym => {
            synonymOccurrences = synonymOccurrences.concat(CardButtons.entityToOccurrence.get(synonym)!);
          });
          synonymOccurrences.sort((a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y);
          CardButtons.entityToOccurrence.set(entityId, synonymOccurrences);
          SidebarButtons.entityToCard.get(entityId)!.div.replaceWith(Card.create(info, synonyms, listOfEntities));
        }
      }
      const div = SidebarButtons.entityToCard.get(info.entityText)?.div;
      if (div) {
        div.scrollIntoView({behavior: 'smooth'});
        setSidebarColors(div);
      }
    };
  }

}
