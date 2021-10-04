import { Entity } from './types';
export module Modal {

    export function create(): HTMLElement{
        const newModal = document.createElement('span')
        const modalWrapper = document.createElement('div')
        modalWrapper.className = 'aurac-modal-wrapper'
        modalWrapper.id = 'aurac-modal-1'

        const auracModal = document.createElement('div')
        auracModal.className = 'aurac-modal'

        const auracModalBody = document.createElement('div')
        auracModalBody.className = 'aurac-modal-body'
        auracModalBody.id = 'aurac-modal-body-1'

        const closeModalButton = document.createElement('button')
        closeModalButton.insertAdjacentHTML('beforeend', 'Close')
        closeModalButton.addEventListener('click', () => closeModal())

        auracModalBody.append(closeModalButton)

        auracModal.appendChild(auracModalBody)

        modalWrapper.appendChild(auracModal)

        const auracModalBackground = document.createElement('div')
        auracModalBackground.className = 'aurac-modal-background'

        modalWrapper.appendChild(auracModalBackground)

        newModal.appendChild(modalWrapper)
        return newModal
    }
    
    function disableOpenModalButtonToggle(choice: boolean) {
        const openButtons = document.getElementsByClassName('open-modal-button')
        for (let i = 0; i < openButtons.length; i++) {
            const openButton = openButtons[i] as HTMLButtonElement
            openButton.disabled = choice
        }
    }

    export function openModal(chemblId: string) {
        // currentModalInformation = information
        document.getElementById('aurac-modal-1')!.style.display = 'block';
        document.body.classList.add('aurac-modal-open');
        const auracBody = document.getElementById('aurac-modal-body-1')
        auracBody!.insertAdjacentHTML('afterbegin', `<object id="compound-data" data="https://www.ebi.ac.uk/chembl/embed/#compound_report_card/${chemblId}/name_and_classification" width="100%" height="100%"></object>`!)
        disableOpenModalButtonToggle(true)
    }

    export function closeModal() {
        document.getElementById('aurac-modal-1')!.style.display = 'none';
        document.body.classList.remove('aurac-modal-open');
        const auracData = document.getElementById('compound-data')
        auracData!.remove()
        disableOpenModalButtonToggle(false)
    }
}
