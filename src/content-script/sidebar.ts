import {browser as Browser} from 'webextension-polyfill';
import * as Constants from './constants';


export module Sidebar {

  const collapseArrow = '&#60;';
  const expandArrow = '&#62;';
  const rightArrow = '&#8594';
  const leftArrow = '&#8592';
  const crossButton = '&#215;';
  const sidebarOpenScreenWidth = '80vw';
  const sidebarClosedScreenWidth = '100vw';

  const sidebarElement: HTMLSpanElement = document.createElement('span');

  let isExpanded = true;

  type ElementProperties = {
    element: HTMLElement,
    position: {
      expanding: number,
      collapsing: number
    },
    property: 'left' | 'marginLeft' | 'width',
    isReversed?: boolean
  };


  const elementProperties = getElementProperties(buttonElement, sidebarElement)



  export function init(): void {

    const imageElement = document.createElement('img');
    const headerElement = document.createElement('h4');

    const [logo, logoText] = createLogo(imageElement, headerElement);

    createLogo(imageElement, headerElement);

    sidebarElement.appendChild(logo);
    sidebarElement.appendChild(logoText);


    const buttonElement: HTMLButtonElement = initSidebarButton(document.createElement('button'));
    sidebarElement.appendChild(buttonElement);

  }

  // toggle the sidebar
  function initSidebarButton(buttonElement: HTMLButtonElement, sidebarElement: HTMLSpanElement): HTMLButtonElement {

    buttonElement.innerHTML = Constants.collapseArrow;
    buttonElement.className = 'sidebar-button';
    buttonElement.id = 'button-id';
    sidebarElement.id = 'aurac-sidebar-id';

    // document.body.id = 'body'; // TODO what on earth?!

    buttonElement.addEventListener('click', () => {
      if (document.body.style.width === Constants.sidebarOpenScreenWidth ||
        document.body.style.width === Constants.sidebarClosedScreenWidth) {
        animateElements(elementProperties);
      }

      buttonElement.innerHTML = isExpanded ? Constants.collapseArrow : Constants.expandArrow;
      document.head.appendChild(newAuracStyleElement());
    });


    return buttonElement;

  }

  function createLogo(auracLogo: HTMLImageElement, logoText: HTMLHeadingElement): [HTMLImageElement, HTMLHeadingElement]  {
    auracLogo.id = 'aurac-logo';
    auracLogo.src = browser.runtime.getURL('assets/head-brains.png')

    logoText.innerText = 'Click on a highlighted entity to display further information and links below...';
    logoText.id = 'aurac-narrative';

    return [auracLogo, logoText]
  }

  // TODO move this to a style/animations class/file ?
// TODO take in state/return state?
// This function will animate the sidebar opening and closing
  function animateElements(element: ElementProperties[]): void {
    element.forEach(elementProperty => {
      let id = null;
      // If the sidebar is currently open, then it will keep moving until it has reached its target position, otherwise
      // It will keep closing until it has reached its closed position
      let pos = isExpanded ? elementProperty.position.expanding : elementProperty.position.collapsing;
      const target = isExpanded ? elementProperty.position.collapsing : elementProperty.position.expanding;
      const elementDistanceSpeed = 0.5;
      id = setInterval(frame, 1);
      // The frame function is used to animate the sidebar moving in and out. setInterval will call this function every seconds/ms
      // depending on what number you pass to it
      function frame() {
        if (pos === target) { // If the position is equal to its target then it has reached its new position and should stop moving
          clearInterval(id); // We reset the timer of the element back to nothing when its reached its target
        } else {
          if (!elementProperty.isReversed) { // The 'isReversed' boolean relates to the document body width, as the sidebar expands
            // on the screen, the width of the document body needs to contract and vice versa
            pos = isExpanded ? pos + elementDistanceSpeed : pos - elementDistanceSpeed;
          } else { // The elementDistanceSpeed is how much the element will move by within this timeframe
            pos = isExpanded ? pos - elementDistanceSpeed : pos + elementDistanceSpeed;
          }
          elementProperty.element.style[elementProperty.property] = pos + 'vw'; // Moves the respective element by a directional property
        }
      }
    });
    isExpanded = !isExpanded;
  }


  export function getSidebar(): HTMLSpanElement {
    return sidebarElement;
  }

  // TODO move CSS stuff to it's own class/file
  function getElementProperties(buttonElement: HTMLButtonElement, auracSidebar: HTMLSpanElement): ElementProperties[] {
    return [
      {
        element: buttonElement,
        property: 'left',
        position: {
          expanding: 20,
          collapsing: 0
        },
      },
      {
        element: auracSidebar,
        property: 'left',
        position: {
          expanding: 0,
          collapsing: -21
        },
      },
      {
        element: document.body,
        property: 'width',
        position: {
          expanding: 80,
          collapsing: 100
        },
        isReversed: true,
      },
      {
        element: document.body,
        property: 'marginLeft',
        position: {
          expanding: 20,
          collapsing: 0
        },
      },
    ]
  }
}

// export class Sidebar {
//
//   static element ?: HTMLSpanElement;
//
//   constructor(document: Document) {
//     Sidebar.element = document.createElement('span');
//
//     Browser.runtime.onMessage
//   }
//
//   static init() {
//     this.createLogo();
//   }
//
//   static createLogo() {
//     const auracLogo = document.createElement('img');
//     auracLogo.id = 'aurac-logo';
//     auracLogo.src = browser.runtime.getURL('assets/head-brains.png')
//
//     Sidebar.element.appendChild(auracLogo);
//
//
//     const narrative = document.createElement('h4');
//     narrative.innerText = 'Click on a highlighted entity to display further information and links below...'
//     narrative.id = 'aurac-narrative';
//
//     Sidebar.element.appendChild(narrative);
//
//   }
//
//
//   static getSidebar() {
//
//   }
//

// }
