import { Globals } from './globals'
export module Modal {

    export function create(): HTMLElement{
        const newModal = Globals.document.createElement('span')
        const modalWrapper = Globals.document.createElement('div')
        modalWrapper.className = 'aurac-modal-wrapper'
        modalWrapper.id = 'aurac-modal-1'

        const auracModal = Globals.document.createElement('div')
        auracModal.className = 'aurac-modal'

        const auracModalBody = Globals.document.createElement('div')
        auracModalBody.className = 'aurac-modal-body'
        auracModalBody.id = 'aurac-modal-body-1'

        const closeModalButton = Globals.document.createElement('button')
        closeModalButton.insertAdjacentHTML('beforeend', 'Close')
        closeModalButton.addEventListener('click', () => closeModal())

        auracModalBody.append(closeModalButton)

        auracModal.appendChild(auracModalBody)

        modalWrapper.appendChild(auracModal)

        const auracModalBackground = Globals.document.createElement('div')
        auracModalBackground.className = 'aurac-modal-background'

        modalWrapper.appendChild(auracModalBackground)

        newModal.appendChild(modalWrapper)
        return newModal
    }
    
    function disableOpenModalButtonToggle(choice: boolean) {
        const openButtons = Globals.document.getElementsByClassName('open-modal-button')
        for (let i = 0; i < openButtons.length; i++) {
            const openButton = openButtons[i] as HTMLButtonElement
            openButton.disabled = choice
        }
    }

    export function openModal(chemblId: string) {
        // currentModalInformation = information
        Globals.document.getElementById('aurac-modal-1')!.style.display = 'block';
        Globals.document.body.classList.add('aurac-modal-open');
        const auracBody = Globals.document.getElementById('aurac-modal-body-1')
        auracBody!.insertAdjacentHTML('afterbegin', `<object id="compound-data" data="https://www.ebi.ac.uk/chembl/embed/#compound_report_card/${chemblId}/name_and_classification" width="100%" height="100%"></object>`!)
        disableOpenModalButtonToggle(true)
    }

    export function closeModal() {
        Globals.document.getElementById('aurac-modal-1')!.style.display = 'none';
        Globals.document.body.classList.remove('aurac-modal-open');
        const auracData = Globals.document.getElementById('compound-data')
        auracData!.remove()
        disableOpenModalButtonToggle(false)
    }
}
