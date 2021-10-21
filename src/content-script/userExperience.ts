
export module UserExperience {

  export function create(): void {
    createLoadingIcon()
  }

  function createLoadingIcon(): void {
    const loadingIcon = document.createElement('div');
    loadingIcon.id = 'aurac-loading-icon'
    document.body.appendChild(loadingIcon);
  }

  export function showLoadingIcon(on: boolean): void {
    let loadingIcon = document.getElementById('aurac-loading-icon');
    loadingIcon!.style.display = on ? 'block' : 'none'
  }
}
