import {Entity} from './types';
import {Card} from './card';
import {SidebarButtons} from './sidebarButtons';
import {CardButtons} from './cardButtons';
import {saveAs} from 'file-saver';

export module Sidebar {

  const listOfEntities = Card.listOfEntities;
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
    clearButtonElement = SidebarButtons.createClearButton();
    downloadResultsButtonElement = SidebarButtons.createDownloadResultsButton();

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

  export function exportEntityToCSV() {
    if (listOfEntities.length === 0) {
      return;
    }
    const headings = ['entityText',
      'resolvedEntity',
      'entityGroup',
      'htmlColor',
      'entityType',
      'source']
    let text = headings.join(',') + '\n'
    listOfEntities.forEach(entity => {
      text = text + `"${entity.entityText}"` + ','
        + entity.resolvedEntity + ','
        + entity.entityGroup + ','
        + entity.recognisingDict.htmlColor + ','
        + entity.recognisingDict.entityType + ','
        + entity.recognisingDict.source + '\n'
    })
    exportToCSV(text)
  }

  export function exportToCSV(text: string): void {
    const currentUrl = window.location.href
    const urlWithoutHTTP = currentUrl.replace(/^(https?|http):\/\//, '')
    const blob = new Blob([text], {type: 'text/csv;charset=utf-8'})
    saveAs(blob, 'aurac_results_' + urlWithoutHTTP + '.csv')
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
        const card = Card.create(info, [info.entityText]);
        SidebarButtons.entityToCard.set(entityId, {synonyms: [info.entityText], div: card});

        Sidebar.addCard(card);
        clearButtonElement = SidebarButtons.toggleClearButton(true)
        downloadResultsButtonElement = SidebarButtons.toggleDownloadButton(true);

        // @ts-ignore
        browser.runtime.sendMessage({type: 'compound_x-refs', body: [info.entityText, info.resolvedEntity]})
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
          SidebarButtons.entityToCard.get(entityId)!.div.replaceWith(Card.create(info, synonyms));
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
