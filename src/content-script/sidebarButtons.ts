import {cardClassName} from './types';
import {EntityMap} from './entityMap';
import {Sidebar} from './sidebar';


export module SidebarButtons {

  let toggleButtonElement: HTMLButtonElement;
  let clearButtonElement: HTMLButtonElement;
  let downloadResultsButtonElement: HTMLButtonElement;
  let isExpanded = false;
  export const entityToCard = new EntityMap<{ synonyms: string[], div: HTMLDivElement }>();
  export const collapseArrow = '&#60;';
  export const expandArrow = '&#62;';

  export function createToggleButton(): HTMLButtonElement {
    toggleButtonElement = document.createElement('button');
    toggleButtonElement.innerHTML = expandArrow;
    toggleButtonElement.className = 'sidebar-button';
    toggleButtonElement.className = 'aurac-transform aurac-sidebar-button aurac-sidebar-button--collapsed';
    toggleButtonElement.addEventListener('click', () => toggle());
    return toggleButtonElement;
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

  export function toggleNarrative(on: boolean): void {
    document.getElementById('aurac-narrative')!.style.display = on ? 'block' : 'none';
  }

  export function createClearButton(): HTMLButtonElement {
    clearButtonElement = document.createElement('button');
    clearButtonElement.style.display = 'none';
    clearButtonElement.innerHTML = 'Clear';
    clearButtonElement.className = 'clear-button';
    clearButtonElement.addEventListener('click', () => {
      clear();
      toggleClearButton(false);
      toggleDownloadButton(false);
      toggleNarrative(false);
    });
    return clearButtonElement;
  }

  export function createDownloadResultsButton(): HTMLButtonElement {
    downloadResultsButtonElement = document.createElement('button')
    downloadResultsButtonElement.style.display = 'none';
    downloadResultsButtonElement.innerHTML = 'Download Results'
    downloadResultsButtonElement.className = 'download-results-button'

    downloadResultsButtonElement.addEventListener('click', () => {
      Sidebar.exportToCSV()
    })
    return downloadResultsButtonElement;
  }

  export function toggleClearButton(on: boolean): HTMLButtonElement {
    clearButtonElement.style.display = on ? 'block' : 'none';
    return clearButtonElement;
  }

  export function toggleDownloadButton(on: boolean): HTMLButtonElement {
    downloadResultsButtonElement.style.display = on ? 'block' : 'none';
    return downloadResultsButtonElement;
  }
}
