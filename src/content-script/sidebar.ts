import {Entity} from './types';
import {Card} from './card';

export module Sidebar {

  let isExpanded = false;

  export function init(): void {

    const sidebar = document.createElement('span')

    const [logo, logoText] = createLogo();

    sidebar.appendChild(logo);
    sidebar.appendChild(logoText);
    sidebar.className = 'aurac-transform aurac-sidebar aurac-sidebar--collapsed';

    const sidebarToggleButton = document.createElement('button')
    sidebarToggleButton.innerHTML = Card.expandArrow;
    sidebarToggleButton.className = 'aurac-transform aurac-sidebar-button aurac-sidebar-button--collapsed'
    sidebarToggleButton.addEventListener('click', () => Sidebar.toggle());
    sidebar.appendChild(sidebarToggleButton);

    const cardContainer = document.createElement('div');
    cardContainer.id = 'card-container';
    sidebar.appendChild(cardContainer);

    document.body.classList.add('aurac-transform', 'aurac-body--sidebar-collapsed')
    document.body.appendChild(sidebar);
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
    const toggleButtonElements = document.getElementsByClassName('aurac-sidebar-button');
    toggleButtonElements[0].innerHTML = isExpanded ? Card.collapseArrow : Card.expandArrow;
  }

  export function addCard(card: HTMLDivElement): void {
    const cardContainer = document.getElementById('card-container');
    cardContainer!.appendChild(card)
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
    Array.from(Card.entityToCard.values()).forEach(div => {
      div.style.border = div === highlightedDiv ? '2px white solid' : '1px black solid';
    });
  }

  // TODO can this function return something ?
  // returns an event listener which creates a new element with passed info and appends it to the passed element
  export const populateAuracSidebar = (info: Entity, element: Element) => {
    return (event: Event) => {
      if (event.type !== 'click') {
        return;
      }

      // hides the narrative
      document.getElementById('aurac-narrative')!.style.display = 'none';

      if (getAuracHighlightChildren(element).some(child => child.className === 'aurac-highlight')
        && element.parentElement!.className === 'aurac-highlight') {
        removeEventListener('click', populateAuracSidebar(info, element));
      } else if (!Card.entityToCard.has(info.entityText)) {
          const card = Card.create(info)
          Card.entityToCard.set(info.entityText, card);
          Sidebar.addCard(card);
          // @ts-ignore
          browser.runtime.sendMessage({type: 'compound_x-refs', body: [info.entityText, info.resolvedEntity]})
            .catch(e => console.error(e));
      }

      const div = Card.entityToCard.get(info.entityText);
      if (div) {
        div.scrollIntoView({behavior: 'smooth'});
        setSidebarColors(div);
      }
    };
  };

  //TODO: should we use this for all non null assertions?
  // function getAuracElement(elementName: ElementName): HTMLElement {
  //   return document.getElementById(elementName);
  // }
}
