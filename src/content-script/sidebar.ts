import {Entity} from './types';
import {Card} from './card';
import {waitForAsync} from '@angular/core/testing';
import {saveAs} from 'file-saver';

export module Sidebar {

  import listOfEntities = Card.listOfEntities;
  const cardContainer = document.createElement('div');
  const toolsContainer = document.createElement('div');
  let toggleButtonElement: HTMLButtonElement;
  let clearButtonElement: HTMLButtonElement;
  let downloadResultsButtonElement: HTMLButtonElement;
  let isExpanded = false;

  export function create(): HTMLElement {

    const [logo, logoText] = createLogo();

    const sidebar = document.createElement('span')
    sidebar.appendChild(logo);
    sidebar.appendChild(logoText);
    sidebar.appendChild(toolsContainer)
    sidebar.className = 'aurac-transform aurac-sidebar aurac-sidebar--collapsed';

    toggleButtonElement = createToggleButton();
    clearButtonElement = createClearButton();
    downloadResultsButtonElement = createDownloadResultsButton();

    sidebar.appendChild(toggleButtonElement);
    sidebar.appendChild(cardContainer);

    toolsContainer.className = 'aurac-sidebar-tools'
    toolsContainer.appendChild(clearButtonElement);
    toolsContainer.appendChild(downloadResultsButtonElement);

    return sidebar
  }

  export function open(): void {
    isExpanded || Sidebar.toggle()
  }

  export function toggle(): void {

    Array.from(document.getElementsByClassName('aurac-transform')).forEach(e => {
      e.className = e.className.replace(/(expanded|collapsed)/, (g) => {
        return g === 'expanded' ? 'collapsed' : 'expanded'
      })
    })
    isExpanded = !isExpanded
    toggleButtonElement.innerHTML = isExpanded ? Card.collapseArrow : Card.expandArrow;
  }

  export function addCard(card: HTMLDivElement): void {
    cardContainer.appendChild(card)
  }

  // initialise the toggle sidebar button
  function createToggleButton(): HTMLButtonElement {
    const toggleButton = document.createElement('button')
    toggleButton.innerHTML = Card.expandArrow;
    toggleButton.className = 'sidebar-button';
    toggleButton.className = 'aurac-transform aurac-sidebar-button aurac-sidebar-button--collapsed'
    toggleButton.addEventListener('click', () => Sidebar.toggle());
    return toggleButton;
  }

  // initialise clear cards button
  function createClearButton(): HTMLButtonElement {
    const clearButton = document.createElement('button')
    clearButton.style.display = 'none';
    clearButton.innerHTML = 'Clear'
    clearButton.className = 'clear-button'
    clearButton.addEventListener('click', () => {
      Card.clear()
      toggleToolsButtons(false)
      toggleNarrative(true)
    })
    return clearButton
  }

  function createDownloadResultsButton(): HTMLButtonElement {
    const downloadResultsButton = document.createElement('button')
    downloadResultsButton.style.display = 'none';
    downloadResultsButton.innerHTML = 'Download Results'
    downloadResultsButton.className = 'download-results-button'

    downloadResultsButton.addEventListener('click', () => {
      exportToCSV()
    })
    return downloadResultsButton
  }

  function exportToCSV(): void {
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
    text = text + entity.entityText + ','
      + entity.resolvedEntity + ','
      + entity.entityGroup + ','
      + entity.recognisingDict.htmlColor + ','
      + entity.recognisingDict.entityType + ','
      + entity.recognisingDict.source + '\n'
    })
    const currentUrl = window.location.href
    const blob = new Blob([text], {type: 'text/csv;charset=utf-8'})
    saveAs(blob, 'aurac_results' + currentUrl + '.csv')
  }

  export function toggleToolsButtons(on: boolean): void {
    clearButtonElement.style.display = on ? 'block' : 'none';
    downloadResultsButtonElement.style.display = on ? 'block' : 'none';
  }

  function createLogo(): [HTMLImageElement, HTMLHeadingElement] {
    const auracLogo = document.createElement('img');
    const logoText = document.createElement('h4');
    logoText.style.color = '#b9772e'
    auracLogo.className = 'aurac-logo';
    // @ts-ignore
    auracLogo.src = browser.runtime.getURL('assets/head-brains.png')

    logoText.innerText = 'Click on a highlighted entity to display further information and links below...';
    logoText.id = 'aurac-narrative';

    return [auracLogo, logoText];
  }

  export function getAuracHighlightChildren(element: Element) {
    return Array.from(element.children).filter(child => child.className === 'aurac-highlight');
  }

  // TODO move style
  function setSidebarColors(highlightedDiv: HTMLDivElement): void {
    Array.from(Card.entityToCard.values()).forEach(card => {
      card.div.style.border = card.div === highlightedDiv ? '2px white solid' : '1px black solid';
    });
  }

  // returns an event listener which creates a new element with passed info and appends it to the passed element
  export function entityClickHandler(info: Entity, element: Element): (event: Event) => void {
    return (event: Event) => {
      if (event.type !== 'click') {
        return;
      }

      toggleNarrative(false)

      const entityId = info.resolvedEntity || info.entityText
      if (!Card.entityToCard.has(entityId)) {  // entity is a new sidecard
        const card = Card.create(info, [info.entityText])
        Card.entityToCard.set(entityId, {synonyms: [info.entityText], div: card});

        Sidebar.addCard(card);
        toggleToolsButtons(true);
        // @ts-ignore
        browser.runtime.sendMessage({type: 'compound_x-refs', body: [info.entityText, info.resolvedEntity]})
          .catch(e => console.error(e));
      } else { // entity is a synonym of existing sidecard
        const synonyms = Card.entityToCard.get(entityId)!.synonyms

        if (!synonyms.includes(info.entityText)) {
          synonyms.push(info.entityText)

          let synonymOccurrences: Element[] = []
          synonyms.forEach(synonym => {
            synonymOccurrences = synonymOccurrences.concat(Card.entityToOccurrence.get(synonym)!)
          })
          synonymOccurrences.sort((a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y)
          Card.entityToOccurrence.set(entityId, synonymOccurrences)
          Card.entityToCard.get(entityId)!.div.replaceWith(Card.create(info, synonyms))
        }
      }
      const div = Card.entityToCard.get(info.entityText)?.div;
      if (div) {
        div.scrollIntoView({behavior: 'smooth'});
        setSidebarColors(div);
      }
    }
  }

  function toggleNarrative(on: boolean): void {
    document.getElementById('aurac-narrative')!.style.display = on ? 'block' : 'none';
  }
}
