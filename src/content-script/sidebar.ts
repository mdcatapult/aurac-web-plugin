import {browser as Browser} from 'webextension-polyfill';
import * as Constants from './constants';
import {ElementProperties} from './types';
import {SidebarAnimations} from './sidebarAnimations';

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

  // TODO maybe we need this boyo
  // export function getSidebar(): HTMLSpanElement {
  //   return sidebarElement;
  // }


  export function init(auracSidebar: HTMLSpanElement): void {

    const imageElement = document.createElement('img');
    const headerElement = document.createElement('h4');

    const [logo, logoText] = createLogo(imageElement, headerElement);

    auracSidebar.appendChild(logo);
    auracSidebar.appendChild(logoText);

    const buttonElement = document.createElement('button');

    const sidebarToggleButton: HTMLButtonElement =
      initSidebarButton(
        buttonElement,
        auracSidebar,
        document.body
      );

    auracSidebar.appendChild(sidebarToggleButton);
  }

  // toggle the sidebar
  function initSidebarButton(toggleButton: HTMLButtonElement,
                             auracSidebar: HTMLSpanElement,
                             documentBody: HTMLElement): HTMLButtonElement {

    toggleButton.innerHTML = Constants.collapseArrow;
    toggleButton.className = 'sidebar-button';
    toggleButton.id = 'button-id';
    auracSidebar.id = 'aurac-sidebar-id';

    // document.body.id = 'body'; // TODO what on earth?!

    const elementProperties =
      SidebarAnimations.getElementPropertyArray(
        toggleButton,
        auracSidebar,
        documentBody
      );

    toggleButton.addEventListener('click', () => {
      if (document.body.style.width === Constants.sidebarOpenScreenWidth ||
        document.body.style.width === Constants.sidebarClosedScreenWidth) {
        isExpanded = SidebarAnimations.animateElements(elementProperties, isExpanded);
      }

      toggleButton.innerHTML = isExpanded ? Constants.collapseArrow : Constants.expandArrow;
      document.head.appendChild(SidebarAnimations.newAuracStyleElement(elementProperties, auracSidebar, toggleButton));
    });

    return toggleButton;
  }

  function createLogo(auracLogo: HTMLImageElement,
                      logoText: HTMLHeadingElement): [HTMLImageElement, HTMLHeadingElement] {
    auracLogo.id = 'aurac-logo';
    auracLogo.src = browser.runtime.getURL('assets/head-brains.png')

    logoText.innerText = 'Click on a highlighted entity to display further information and links below...';
    logoText.id = 'aurac-narrative';

    return [auracLogo, logoText];
  }

}
