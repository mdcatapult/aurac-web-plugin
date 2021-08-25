import * as Constants from './constants';
import {ElementProperties, Entity} from './types';
import {Card} from './card';

export module Sidebar {

  const cardContainer = document.createElement('div')
  const toggleButtonElement = document.createElement('button')
  const imageElement = document.createElement('img');
  const headerElement = document.createElement('h4');
  let isExpanded = true;

  export function init(sidebar: HTMLSpanElement): void {

    const [logo, logoText] = createLogo(imageElement, headerElement);

    sidebar.appendChild(logo);
    sidebar.appendChild(logoText);
    sidebar.className = `aurac-transform aurac-sidebar aurac-sidebar--${isExpanded ? 'expanded' : 'collapsed'}`;

    const sidebarToggleButton: HTMLButtonElement =
      initToggleButton(
        toggleButtonElement,
        sidebar,
        document.body
      );

    sidebar.appendChild(sidebarToggleButton);
    sidebar.appendChild(cardContainer);
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
    toggleButtonElement.innerHTML = isExpanded ? Card.collapseArrow : Card.expandArrow;
  }

  export function addCard(card: HTMLDivElement): void {
    console.log('adding card: ', card)
    cardContainer.appendChild(card)
  }

  // initialise the toggle sidebar button
  function initToggleButton(toggleButton: HTMLButtonElement,
                            sidebar: HTMLSpanElement,
                            documentBody: HTMLElement): HTMLButtonElement {

    toggleButton.innerHTML = Card.collapseArrow;
    toggleButton.className = 'sidebar-button';
    toggleButton.className = `aurac-transform aurac-sidebar-button aurac-sidebar-button--${isExpanded ? 'expanded' : 'collapsed'}`

    // document.body.id = 'body'; // TODO what on earth?!

    toggleButton.addEventListener('click', () => Sidebar.toggle());

    return toggleButton;
  }

  function createLogo(auracLogo: HTMLImageElement,
                      logoText: HTMLHeadingElement): [HTMLImageElement, HTMLHeadingElement] {
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
    return (event) => {
      if (event.type !== 'click') {
        return;
      }

      // hides the narrative
      document.getElementById('aurac-narrative').style.display = 'none';

      if (getAuracHighlightChildren(element).some(child => child.className === 'aurac-highlight')
        && element.parentElement.className === 'aurac-highlight') {
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

  // function getAuracElement(elementName: ElementName): HTMLElement {
  //   return document.getElementById(elementName);
  // }

}
