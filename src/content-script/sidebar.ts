import {Entity} from './types';
import {Card} from './card';
import {Buttons} from './buttons';

export module Sidebar {

  const cardContainer = document.createElement('div');
  let toggleButtonElement: HTMLButtonElement;
  let clearButtonElement: HTMLButtonElement;
  let isExpanded = false;


  export function create(): HTMLElement {

    const [logo, logoText] = createLogo();

    const sidebar = document.createElement('span')
    sidebar.appendChild(logo);
    sidebar.appendChild(logoText);
    sidebar.className = 'aurac-transform aurac-sidebar aurac-sidebar--collapsed';

    toggleButtonElement = Buttons.createToggleButton();
    clearButtonElement = Buttons.createClearButton(clearButtonElement);

    sidebar.appendChild(toggleButtonElement);
    sidebar.appendChild(clearButtonElement);
    sidebar.appendChild(cardContainer);
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
        Buttons.toggleClearButton(true, clearButtonElement);
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


  export function toggleNarrative(on: boolean): void {
    document.getElementById('aurac-narrative')!.style.display = on ? 'block' : 'none';
  }
}
