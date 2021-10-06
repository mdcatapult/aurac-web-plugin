import {Entity} from './types';
import {Card} from './card';
import {SidebarButtons} from './sidebarButtons';
import {CardButtons} from './cardButtons';

export module Sidebar {

  const listOfEntities: Entity[] = []
  const cardContainer = document.createElement('div');
  const toolsContainer = document.createElement('div');

  let toggleButtonElement: HTMLButtonElement;
  let clearButtonElement: HTMLButtonElement;
  let downloadResultsButtonElement: HTMLButtonElement;

  export function create(): HTMLElement {

    const [logo, logoText] = createLogo();

    const sidebar = document.createElement('span');
    sidebar.appendChild(logo);
    sidebar.appendChild(logoText);
    sidebar.appendChild(toolsContainer)
    sidebar.className = 'aurac-transform aurac-sidebar aurac-sidebar--collapsed';

    toggleButtonElement = SidebarButtons.createToggleButton();
    clearButtonElement = SidebarButtons.createClearButton(listOfEntities);
    downloadResultsButtonElement = SidebarButtons.createDownloadResultsButton(listOfEntities);

    sidebar.appendChild(toggleButtonElement);
    sidebar.appendChild(clearButtonElement);
    sidebar.appendChild(cardContainer);

    toolsContainer.className = 'aurac-sidebar-tools'
    toolsContainer.appendChild(clearButtonElement);
    toolsContainer.appendChild(downloadResultsButtonElement);

    return sidebar;
  }

  export function addCard(card: HTMLDivElement): void {
    cardContainer.appendChild(card);
  }

  function createLogo(): [HTMLImageElement, HTMLHeadingElement] {
    const auracLogo = document.createElement('img');
    const logoText = document.createElement('h4');
    logoText.style.color = '#b9772e';
    auracLogo.className = 'aurac-logo';
    // @ts-ignore
    auracLogo.src = browser.runtime.getURL('assets/head-brains.png');

    logoText.innerText = 'Click on a highlighted entity to display further information and links below...';
    logoText.id = 'aurac-narrative';

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
        browser.runtime.sendMessage({
          type: 'compound_x-refs',
          body: [info.entityText, info.resolvedEntity, info.entityGroup, info.recognisingDict.entityType]
        }).catch(e => console.error(e));

      } else { // entity is a synonym of existing sidecard
        const synonyms = SidebarButtons.entityToCard.get(entityId)!.synonyms


        const lowerCaseSynonyms = synonyms.map(syn => syn.toLowerCase());
        const lowerCaseEntityText = info.entityText.toLowerCase()

        // prevent adding entity text to synonyms with the same characters but different case
        if (!lowerCaseSynonyms.includes(lowerCaseEntityText)) {
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
