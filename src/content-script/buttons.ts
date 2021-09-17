import {Card} from './card';
import {Sidebar} from './sidebar';


export module Buttons {

  // sidebar buttons

  export function createToggleButton(): HTMLButtonElement {
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = Card.expandArrow;
    toggleButton.className = 'sidebar-button';
    toggleButton.className = 'aurac-transform aurac-sidebar-button aurac-sidebar-button--collapsed';
    toggleButton.addEventListener('click', () => Sidebar.toggle());
    return toggleButton;
  }

  export function createClearButton(clearButtonElement: HTMLButtonElement): HTMLButtonElement {
    const clearButton = document.createElement('button');
    clearButton.style.display = 'none';
    clearButton.innerHTML = 'Clear';
    clearButton.className = 'clear-button';
    clearButton.addEventListener('click', () => {
      Card.clear();
      toggleClearButton(false, clearButtonElement);
      Sidebar.toggleNarrative(true);
    });
    return clearButton;
  }

  export function toggleClearButton(on: boolean, clearButtonElement: HTMLButtonElement): void {
    clearButtonElement.style.display = on ? 'block' : 'none';
  }

}
