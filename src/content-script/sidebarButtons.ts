import {Sidebar} from './sidebar';
import {cardClassName} from './types';
import {EntityMap} from './entityMap';


export module SidebarButtons {

  let toggleButtonElement: HTMLButtonElement;
  let clearButtonElement: HTMLButtonElement;
  let isExpanded = false;
  export const entityToCard = new EntityMap<{ synonyms: string[], div: HTMLDivElement }>();
  const collapseArrow = '&#60;';
  const expandArrow = '&#62;';

  export function createToggleButton(): HTMLButtonElement {
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = expandArrow;
    toggleButton.className = 'sidebar-button';
    toggleButton.className = 'aurac-transform aurac-sidebar-button aurac-sidebar-button--collapsed';
    toggleButton.addEventListener('click', () => toggle());
    return toggleButton;
  }


  export function open(): void {
    isExpanded || SidebarButtons.toggle();
  }


  export function toggle(): void {

    Array.from(document.getElementsByClassName('aurac-transform')).forEach(e => {
      e.className = e.className.replace(/(expanded|collapsed)/, (g) => {
        return g === 'expanded' ? 'collapsed' : 'expanded';
      });
    });
    isExpanded = !isExpanded;
    toggleButtonElement.innerHTML = isExpanded ? collapseArrow : expandArrow;
  }

  export function clear(): void {
    entityToCard.clear();
    Array.from(document.getElementsByClassName(cardClassName)).forEach(card => card.parentNode!.removeChild(card));
  }

  export function createClearButton(): HTMLButtonElement {
    const clearButton = document.createElement('button');
    clearButton.style.display = 'none';
    clearButton.innerHTML = 'Clear';
    clearButton.className = 'clear-button';
    clearButton.addEventListener('click', () => {
      clear();
      toggleClearButton(false);
      // TODO circular ref
      Sidebar.toggleNarrative(true);
    });
    return clearButton;
  }


  export function toggleClearButton(on: boolean): void {
    clearButtonElement.style.display = on ? 'block' : 'none';
  }

}
