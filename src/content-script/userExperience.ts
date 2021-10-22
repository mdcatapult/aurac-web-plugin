import { Globals } from './globals'

export module UserExperience {

  export function create(): void {
    createLoadingIcon()
  }

  function createLoadingIcon(): void {
    const loadingIcon = Globals.document.createElement('div');
    loadingIcon.id = 'aurac-loading-icon'
    Globals.document.body.appendChild(loadingIcon);
  }

  export function showLoadingIcon(on: boolean): void {
    let loadingIcon = Globals.document.getElementById('aurac-loading-icon');
    loadingIcon!.style.display = on ? 'block' : 'none'
  }
}
