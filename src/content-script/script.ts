import { XRef } from './../types/entity'
import { Globals } from './globals'
import { BrowserImplementation } from './browser-implementation'
import { parseWithTypes, stringifyWithTypes } from '../json'
import { Entity, TabEntities } from '../types/entity'
import { Message } from '../types/messages'
import { Recogniser } from '../types/recognisers'
import * as Mark from 'mark.js'
import * as Highlights from '../types/highlights'
import { highlightID } from '../types/highlights'

Globals.document = document
Globals.browser = new BrowserImplementation()
Globals.document.body.classList.add('aurac-transform', 'aurac-body--sidebar-collapsed')

const highlightClass = 'aurac-highlight'
let SIDEBAR_IS_READY = false

const sidebar = Globals.document.createElement('div')
sidebar.id = 'aurac-sidebar'
sidebar.style.backgroundColor = 'rgb(192, 192, 192)'
sidebar.className = 'aurac-transform aurac-sidebar aurac-sidebar--collapsed'

const iframe = Globals.document.createElement('iframe')
iframe.className = 'aurac-iframe'
iframe.src = browser.runtime.getURL('index.html?page=sidebar')
iframe.style.width = '20%'
sidebar.appendChild(iframe)

const modalSpan = Globals.document.createElement('span')
modalSpan.innerHTML = `
<div class="aurac-modal-wrapper" id="aurac-modal-1">
  <div class="aurac-modal">
    <div class="aurac-modal-body" id="aurac-modal-body-1">
    </div>
  </div>
  <div class="aurac-modal-background"></div>
</div>
`
const closeModalButton = document.createElement('button')
closeModalButton.insertAdjacentHTML('beforeend', 'Close')
closeModalButton.addEventListener('click', () => closeModal())
closeModalButton.className = 'close-modal-button'

Globals.document.body.appendChild(modalSpan)
const auracModalBody = Globals.document.getElementById('aurac-modal-body-1')
auracModalBody!.append(closeModalButton)

const buttonRoot = Globals.document.createElement('div')
buttonRoot.style.position = 'absolute'
buttonRoot.style.top = '0'
buttonRoot.style.left = '100%'
buttonRoot.style.height = '100%'
sidebar.appendChild(buttonRoot)

const shadowButtonRoot = buttonRoot.attachShadow({ mode: 'closed' })

const sidebarButtonStyle = Globals.document.createElement('style')
sidebarButtonStyle.innerHTML = `button {
  border: none;
  position: fixed;
  top: 40%;
  height: 3em;
  width: 3em;
  z-index: 2147483647;
  border-radius: 0 1em 1em 0;
  background-color: rgb(192, 192, 192);
}

button:hover {
  border: 1px solid black;
}`
shadowButtonRoot.appendChild(sidebarButtonStyle)

const sidebarButton = Globals.document.createElement('button')
shadowButtonRoot.appendChild(sidebarButton)

const sidebarButtonLogo = Globals.document.createElement('img')
sidebarButtonLogo.src = browser.runtime.getURL('assets/head-brains.icon.128.png')
sidebarButtonLogo.style.width = '80%'
sidebarButton.appendChild(sidebarButtonLogo)

const loadingIcon = Globals.document.createElement('div')
loadingIcon.id = 'aurac-loading-icon'
Globals.document.body.appendChild(loadingIcon)

sidebarButton.addEventListener('click', toggleSidebar)

function showLoadingIcon(on: boolean): void {
  let loadingIcon = Globals.document.getElementById('aurac-loading-icon')
  loadingIcon!.style.display = on ? 'block' : 'none'
}

function injectSidebar() {
  Globals.document.body.appendChild(sidebar)
}

function toggleSidebar() {
  if (!!Globals.document.getElementsByClassName('aurac-sidebar--expanded').length) {
    closeSidebar()
  } else {
    openSidebar()
  }
}

function openSidebar() {
  if (!Globals.document.getElementById('aurac-sidebar')) {
    injectSidebar()
  }

  Array.from(Globals.document.getElementsByClassName('aurac-transform')).forEach(e => {
    e.className = e.className.replace('collapsed', 'expanded')
  })
}

function closeSidebar(): void {
  Array.from(Globals.document.getElementsByClassName('aurac-transform')).forEach(e => {
    e.className = e.className.replace('expanded', 'collapsed')
  })
}

function toggleCompression(isPageCompressed: boolean): boolean {
  if (!!Globals.document.getElementsByClassName('aurac-sidebar--expanded').length) {
    closeSidebar()
  }

  isPageCompressed ? removeAuracBodyFromPage() : addAuracBodyToPage()

  isPageCompressed = !isPageCompressed

  return isPageCompressed
}

function removeAuracBodyFromPage() {
  Globals.document.body.classList.remove('aurac-transform', 'aurac-body--sidebar-collapsed')
}

function addAuracBodyToPage() {
  Globals.document.body.classList.add('aurac-transform', 'aurac-body--sidebar-collapsed')
}

function getPageContents(): string {
  return Globals.document.documentElement.outerHTML
}

async function awaitSidebarReadiness(): Promise<void> {
  while (!SIDEBAR_IS_READY) {
    await new Promise(r => setTimeout(r, 100))
  }

  return
}

let modalCanOpen = true

function openModal(chemblId: string) {
  if (!modalCanOpen) return
  const modal = Globals.document.getElementById('aurac-modal-1')
  modal!.style.display = 'block'

  const auracBody = Globals.document.getElementById('aurac-modal-body-1')
  auracBody!.insertAdjacentHTML(
    'afterbegin',
    `<object id="compound-data" data="https://www.ebi.ac.uk/chembl/embed/#compound_report_card/${chemblId}/name_and_classification" width="100%" height="100%"></object>`!
  )
  modalCanOpen = false
}

function closeModal() {
  const modal = Globals.document.getElementById('aurac-modal-1')
  modal!.style.display = 'none'
  const auracData = Globals.document.getElementById('compound-data')
  auracData!.remove()
  modalCanOpen = true
}

function getHighlightedEntities(): Element[] {
  return Array.from(Globals.document.getElementsByClassName('aurac-highlight')).filter(element => {
    return element.id
  })
}

function highlightEntities(
  tabEntities: TabEntities,
  recogniser: Recogniser
): Promise<{ tabEntities: string; entityCount: number }> {
  return new Promise((resolve, reject) => {
    tabEntities[recogniser]!.entities.forEach((entity, entityName) => {
      entity.htmlTagIDs = []
      entity.synonymToXPaths.forEach((xpaths, synonymName) => {
        let highlightedEntityOccurrence = 0
        const uniqueXPaths = new Set(xpaths)
        uniqueXPaths.forEach(xpath => {
          try {
            const xpathNode = Globals.document.evaluate(
              xpath,
              Globals.document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE
            ).singleNodeValue

            if (xpathNode) {
              highlightedEntityOccurrence = highlightText(
                entity,
                synonymName,
                xpathNode,
                entityName,
                highlightedEntityOccurrence
              )
            }
          } catch (e) {
            reject(e)
          }
        })
      })
    })
    showLoadingIcon(false)

    const unmarker = (element: HTMLElement) => {
      let unhighlighter = new Mark(element as HTMLElement)
      unhighlighter.unmark(element)
    }

    Highlights.unmarkHiddenEntities(unmarker)
    const highlightedEntities = getHighlightedEntities() as Array<HTMLElement>

    if (window.location.href.endsWith('.pdf')) {
      // Give PDF highlights a brighter background colour as opacity is lower on pdf-js
      highlightedEntities.forEach(entity => {
        entity.style.background = '#ff00ff'
      })
    }

    resolve({
      tabEntities: stringifyWithTypes(tabEntities),
      entityCount: highlightedEntities.length
    })
  })
}

/**
 *
 * @param entity {Entity}
 * @param synonymName
 * @param contextNode
 * @param entityName
 * @param {number} highlightedEntityOccurrence count of highlighted occurrences of a particular entity,
 * rather than the total number of entities on the page
 * */
export function highlightText(
  entity: Entity,
  synonymName: string,
  contextNode: Node,
  entityName: string,
  highlightedEntityOccurrence: number
): number {
  let highlighter = new Mark(contextNode as HTMLElement)

  // This regex will only highlight terms that either begin and end with its first and last letter or contain non word characters
  let termToHighlight = Highlights.highlightFormat(synonymName)

  highlighter.markRegExp(termToHighlight, {
    element: 'span',
    className: highlightClass,
    acrossElements: true,
    exclude: ['a', '.tooltipped', '.tooltipped-click', '.aurac-highlight'],
    each: (element: HTMLElement) => {
      // When you find the element, check to see if it has an ancestor parent of 'display:none', if it does, it will return
      // null. So we check against it to make sure that it isn't null
      if (!element.offsetParent) {
        return
      }
      newHighlightElementCallback(
        entity,
        entityName,
        highlightedEntityOccurrence,
        synonymName
      )(element)
      highlightedEntityOccurrence++
    }
  })

  return highlightedEntityOccurrence
}

function newHighlightElementCallback(
  entity: Entity,
  entityName: string,
  highlightedEntityOccurrence: number,
  synonymName: string
): (element: HTMLElement) => void {
  return (element: HTMLElement): void => {
    // a tabIndex is required in order to make the highlight element focussable
    element.tabIndex = -1
    element.id = highlightID(entityName, highlightedEntityOccurrence, synonymName)
    entity.htmlTagIDs = entity.htmlTagIDs ? entity.htmlTagIDs.concat([element.id]) : [element.id]
    element.addEventListener('click', (_event: Event): void => {
      Globals.browser
        .sendMessage({ type: 'entity_messenger_service_highlight_clicked', body: element.id })
        .catch(console.error)
    })
  }
}

function scrollToHighlight(id: string): void {
  const elementToHighlight = Globals.document.getElementById(id)
  elementToHighlight!.focus({ preventScroll: true })
  elementToHighlight!.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function removeHighlights(): void {
  Array.from(Globals.document.getElementsByClassName(highlightClass)).forEach(element => {
    const childNodes = Array.from(element.childNodes)
    element.replaceWith(...childNodes)
  })
}

function generateChemblId(xRefs: Array<XRef>): string {
  let chemblId: string = ''
  xRefs
    .filter(xref => xref.databaseName === 'chembl')
    .forEach(xref => {
      const url: string = xref.url
      const chemblIdList: string[] = url.split('/')
      chemblId = chemblIdList[chemblIdList.length - 1]
    })

  return chemblId
}

Globals.browser.addListener((msg: Message): Promise<any> | undefined => {
  switch (msg.type) {
    case 'content_script_toggle_sidebar':
      return Promise.resolve(toggleSidebar())

    case 'content_script_open_sidebar':
      return Promise.resolve(openSidebar())

    case 'content_script_close_sidebar':
      return Promise.resolve(closeSidebar())

    case 'content_script_get_page_contents':
      return Promise.resolve(getPageContents())

    case 'content_script_set_sidebar_ready':
      return Promise.resolve((SIDEBAR_IS_READY = true))

    case 'content_script_await_sidebar_readiness':
      return awaitSidebarReadiness()

    case 'content_script_open_loading_icon':
      return Promise.resolve(showLoadingIcon(true))

    case 'content_script_close_loading_icon':
      return Promise.resolve(showLoadingIcon(false))

    case 'content_script_highlight_entities':
      const tabEntities: TabEntities = parseWithTypes(msg.body.entities)
      const recogniser: Recogniser = msg.body.recogniser

      removeHighlights()

      return highlightEntities(tabEntities, recogniser)

    case 'content_script_scroll_to_highlight':
      return Promise.resolve(scrollToHighlight(msg.body))

    case 'content_script_remove_highlights':
      return Promise.resolve(removeHighlights())

    case 'content_script_open_modal':
      const chemblId = generateChemblId(msg.body.xRefs)

      return Promise.resolve(openModal(chemblId))

    case 'content_script_is_page_compressed':
      return Promise.resolve(toggleCompression(msg.body as boolean))
  }
})
