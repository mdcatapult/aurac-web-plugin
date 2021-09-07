
export module UserExperience {

  export function create(): void {
    createLoadingIcon()
  }

  function createLoadingIcon(): void {
    const loadingIcon = document.createElement('div');
    loadingIcon.id = 'aurac-loading-icon'
    document.body.appendChild(loadingIcon);
  }

  export function displayLoadingIcon(awaitingResponse: boolean): void {
    let loadingIcon = document.getElementById('aurac-loading-icon');
    awaitingResponse ? loadingIcon!.style.display = 'block' : loadingIcon!.style.display = 'none';
  }
}
