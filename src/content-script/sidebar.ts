// import {browser as Browser} from 'webextension-polyfill';
import * as Constants from './constants';
import {ElementProperties, Entity} from './types';
import {Card} from './card';
import {SidebarAnimations} from './sidebarAnimations';

export module Sidebar {


  const sidebarOpenScreenWidth = '80vw';
  const sidebarClosedScreenWidth = '100vw';

  // rename to 'cardsElement'?
  const sidebarTexts = document.createElement('div')
  const toggleButtonElement = document.createElement('button')
  const imageElement = document.createElement('img');
  const headerElement = document.createElement('h4');
  let isExpanded = true;
  let hasNERLookupOccurred = false;

  // TODO maybe we need this boyo
  // export function getSidebar(): HTMLSpanElement {
  //   return sidebarElement;
  // }


  export function init(sidebar: HTMLSpanElement): HTMLSpanElement {

    const [logo, logoText] = createLogo(imageElement, headerElement);

    sidebar.appendChild(logo);
    sidebar.appendChild(logoText);

    const sidebarToggleButton: HTMLButtonElement =
      initToggleButton(
        toggleButtonElement,
        sidebar,
        document.body
      );

    sidebar.appendChild(sidebarToggleButton);

    sidebar.appendChild(sidebarTexts);
    return sidebar;
  }

  export function open(sidebarElement: HTMLSpanElement): void {
    document.body.style.width = '80vw';
    document.body.style.marginLeft = '20vw';
    sidebarElement.className = 'aurac-sidebar';
    document.body.appendChild(sidebarElement);
    //TODO: fix this mess. Why is SidebarAnimations the source of styles? Why do we need to pass things many times?
    document.head.appendChild(
      SidebarAnimations.newAuracStyleElement(
        SidebarAnimations.getElementPropertyArray(toggleButtonElement, sidebarElement, document.body),
        sidebarElement, toggleButtonElement
      )
    );
  }

  export function toggle(sidebarElement: HTMLSpanElement): void {
    // just do toggleButtonElement.click(); ?
    if (document.body.style.width === sidebarOpenScreenWidth || document.body.style.width === sidebarClosedScreenWidth) {
      SidebarAnimations.animateElements(SidebarAnimations.
      getElementPropertyArray(toggleButtonElement, sidebarElement, document.body), isExpanded);
      toggleButtonElement.innerHTML = isExpanded ? Card.collapseArrow : Card.expandArrow;
    }
  }

  export function addCard(card: HTMLDivElement): void {
    sidebarTexts.appendChild(card)
  }

  // initialise the toggle sidebar button
  function initToggleButton(toggleButton: HTMLButtonElement,
                            auracSidebar: HTMLSpanElement,
                            documentBody: HTMLElement): HTMLButtonElement {

    toggleButton.innerHTML = Card.collapseArrow;
    toggleButton.className = 'sidebar-button';
    toggleButton.className = 'button-id';
    auracSidebar.className = 'aurac-sidebar-id';

    // document.body.id = 'body'; // TODO what on earth?!

    const elementProperties =
      SidebarAnimations.getElementPropertyArray(
        toggleButton,
        auracSidebar,
        documentBody
      );

    toggleButton.addEventListener('click', () => {
      if (document.body.style.width === sidebarOpenScreenWidth ||
        document.body.style.width === sidebarClosedScreenWidth) {
        isExpanded = SidebarAnimations.animateElements(elementProperties, isExpanded);
      }

      toggleButton.innerHTML = isExpanded ? Card.collapseArrow : Card.expandArrow;
      document.head.appendChild(SidebarAnimations.newAuracStyleElement(elementProperties, auracSidebar, toggleButton));
    });

    return toggleButton;
  }

  function createLogo(auracLogo: HTMLImageElement,
                      logoText: HTMLHeadingElement): [HTMLImageElement, HTMLHeadingElement] {
    auracLogo.className = 'aurac-logo';
    // @ts-ignore
    auracLogo.src = browser.runtime.getURL('assets/head-brains.png')

    logoText.innerText = 'Click on a highlighted entity to display further information and links below...';
    logoText.className = 'aurac-narrative';

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

      document.getElementById('aurac-narrative').style.display = 'none';

      if (getAuracHighlightChildren(element).some(child => child.className === 'aurac-highlight')
        && element.parentElement.className === 'aurac-highlight') {
        removeEventListener('click', populateAuracSidebar(info, element));
      } else {
        if (!Card.entityToCard.has(info.entityText)) {
          const card = Card.create(info)
          Card.entityToCard.set(info.entityText, card);
          Sidebar.addCard(card);
          // @ts-ignore
          browser.runtime.sendMessage({type: 'compound_x-refs', body: [info.entityText, info.resolvedEntity]})
            .catch(e => console.error(e));
        }
      }

      const div = Card.entityToCard.get(info.entityText);
      if (div) {
        div.scrollIntoView({behavior: 'smooth'});
        setSidebarColors(div);
      }
    };
  };

}
