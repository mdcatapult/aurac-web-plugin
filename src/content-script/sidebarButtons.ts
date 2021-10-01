import {cardClassName, Entity} from './types';
import {EntityMap} from './entityMap';
import {saveAs} from 'file-saver';
import {Globals} from './globals'

export module SidebarButtons {

  let toggleButtonElement: HTMLButtonElement;
  let clearButtonElement: HTMLButtonElement;
  let downloadResultsButtonElement: HTMLButtonElement;
  let isExpanded = false;
  export const entityToCard = new EntityMap<{ synonyms: string[], div: HTMLDivElement }>();
  export const collapseArrow = '&#60;';
  export const expandArrow = '&#62;';
  export const childIDs = {
    toggleButton: 'toggle-button',
    clearButton: 'clear-button',
  }

  export function createToggleButton(): HTMLButtonElement {
    toggleButtonElement = Globals.document.createElement('button');
    toggleButtonElement.innerHTML = expandArrow;
    toggleButtonElement.id = childIDs.toggleButton
    toggleButtonElement.className = 'sidebar-button';
    toggleButtonElement.className = 'aurac-transform aurac-sidebar-button aurac-sidebar-button--collapsed';
    toggleButtonElement.addEventListener('click', () => toggle());
    return toggleButtonElement;
  }

  export function open(): void {
    isExpanded || SidebarButtons.toggle();
  }

  export function toggle(): void {
    Array.from(Globals.document.getElementsByClassName('aurac-transform')).forEach(e => {
      e.className = e.className.replace(/(expanded|collapsed)/, (g) => {
        return g === 'expanded' ? 'collapsed' : 'expanded';
      });
    });
    isExpanded = !isExpanded;
    toggleButtonElement.innerHTML = isExpanded ? collapseArrow : expandArrow;
  }

  export function toggleNarrative(on: boolean): void {
    Globals.document.getElementById('aurac-narrative')!.style.display = on ? 'block' : 'none';
  }

  export function createClearButton(listOfEntities: Entity[]): HTMLButtonElement {
    clearButtonElement = Globals.document.createElement('button');
    clearButtonElement.style.display = 'none';
    clearButtonElement.innerHTML = 'Clear';
    clearButtonElement.id = childIDs.clearButton
    clearButtonElement.className = 'clear-button';
    clearButtonElement.addEventListener('click', () => {

      entityToCard.clear();
      listOfEntities.length = 0;
      Array.from(Globals.document.getElementsByClassName(cardClassName)).forEach(card => card.parentNode!.removeChild(card));
      toggleClearButton(false);
      toggleDownloadButton(false);
      toggleNarrative(false);
    });
    return clearButtonElement;
  }

  export function createDownloadResultsButton(listOfEntities: Entity[]): HTMLButtonElement {
    downloadResultsButtonElement = Globals.document.createElement('button')
    downloadResultsButtonElement.style.display = 'none';
    downloadResultsButtonElement.innerHTML = 'Download Results'
    downloadResultsButtonElement.className = 'download-results-button'

    downloadResultsButtonElement.addEventListener('click', () => {
      exportEntityToCSV(listOfEntities)
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

  function exportEntityToCSV(listOfEntities: Entity[]): void {
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
      text = text + `"${entity.entityText}"` + ','
        + entity.resolvedEntity + ','
        + entity.entityGroup + ','
        + entity.recognisingDict.htmlColor + ','
        + entity.recognisingDict.entityType + ','
        + entity.recognisingDict.source + '\n'
    })
    exportToCSV(text)
  }

  export function exportToCSV(text: string): void {
    const currentUrl = window.location.href
    const urlWithoutHTTP = currentUrl.replace(/^(https?|http):\/\//, '')
    const blob = new Blob([text], {type: 'text/csv;charset=utf-8'})
    saveAs(blob, 'aurac_results_' + urlWithoutHTTP + '.csv')
  }

}
