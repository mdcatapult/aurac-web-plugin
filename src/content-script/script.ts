import { Entity, highlightID, Message, Recogniser, TabEntities } from '../types';
import { UserExperience } from './userExperience';
import { Globals } from './globals';
import { BrowserImplementation } from './browser-implementation';
import { parseWithTypes, stringifyWithTypes } from '../json';
import * as Mark from 'mark.js';

Globals.document = document
Globals.browser = new BrowserImplementation()

let SIDEBAR_IS_READY = false;

// document.body.classList.add('aurac-transform', 'aurac-body--sidebar-collapsed')

const sidebar = Globals.document.createElement('div')
sidebar.id = "aurac-sidebar"
sidebar.className = 'aurac-transform aurac-sidebar aurac-sidebar--collapsed'

const iframe = Globals.document.createElement('iframe')
iframe.className = "aurac-iframe"
iframe.src = browser.runtime.getURL('index.html?page=sidebar')
sidebar.appendChild(iframe)

const buttonRoot = Globals.document.createElement('div')
buttonRoot.style.position = 'absolute';
buttonRoot.style.top = '0';
buttonRoot.style.left = '100%'
buttonRoot.style.height = '100%'
sidebar.appendChild(buttonRoot)

const shadowButtonRoot = buttonRoot.attachShadow({mode: 'closed'})

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
shadowButtonRoot.appendChild(sidebarButton);

const sidebarButtonLogo = Globals.document.createElement('img')
sidebarButtonLogo.src = browser.runtime.getURL('assets/head-brains.icon.128.png')
sidebarButtonLogo.style.width = "80%"
sidebarButton.appendChild(sidebarButtonLogo)

UserExperience.create()

async function injectSidebar() {
  Globals.document.body.appendChild(sidebar);
  await new Promise(r => setTimeout(r, 100));
}

async function toggleSidebar() {
  if (!!document.getElementsByClassName('aurac-sidebar--expanded').length) {
    closeSidebar();
  } else {
    await openSidebar();
  }
}

async function openSidebar() {
  if (!document.getElementById("aurac-sidebar")) {
    await injectSidebar()
  }
  
  Array.from(document.getElementsByClassName('aurac-transform')).forEach(e => {
    e.className = e.className.replace('collapsed', 'expanded');
  });
}

const closeSidebar: () => void = () => {
  Array.from(document.getElementsByClassName('aurac-transform')).forEach(e => {
    e.className = e.className.replace('expanded', 'collapsed');
  });
}

const getPageContents: () => string = () => {
  return document.documentElement.outerHTML
}

async function sidebarIsReady(): Promise<boolean> {
  return SIDEBAR_IS_READY;
}

async function awaitSidebarReadiness(): Promise<void> {
  while (!SIDEBAR_IS_READY) {
    await new Promise(r => setTimeout(r, 100));
  }
  return;
}

sidebarButton.addEventListener('click', toggleSidebar)

function highlightEntites(tabEntities: TabEntities): Promise<string> {
  return new Promise((resolve, reject) => {
    Globals.browser.sendMessage({type: 'settings_service_get_current_recogniser'})
      .then((recogniser: Recogniser) => {
        
        tabEntities[recogniser]!.entities.forEach((entity, entityName) => {
          
          entity.synonyms.forEach((synonymData, synonymName) => {
            
            let entityOccurrence = 0
              synonymData.xpaths.forEach((xpath, synonymOccurrence) => {

              try {
                  const xpathNode = Globals.document.evaluate(xpath, Globals.document, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue

                  if (xpathNode) {
                    const highlightElementCallback = newHighlightElementCallback(entity, entityName, entityOccurrence, synonymName, synonymOccurrence)
                    const success = highlightText(xpathNode, synonymName, highlightElementCallback);
                    if (success) {
                      entityOccurrence++
                    }
                  }
                            
                } catch (e) {
                  reject(e)
                }
              })
            })
          })
          UserExperience.showLoadingIcon(false)
          resolve(stringifyWithTypes(tabEntities))
      })

  })
}

function highlightText(contextNode: Node, text: string, callback: (element: HTMLElement) => void): boolean {
  let success = true;
  let highlighter = new Mark(contextNode as HTMLElement);
  highlighter.mark(text, {
    element: 'span',
    className: 'aurac-highlight',
    accuracy: 'exactly',
    acrossElements: true,
    separateWordSearch: false,
    exclude: [
      'a',
      '.tooltipped',
      '.tooltipped-click',
      '.aurac-highlight'
    ],
    filter: (_node, _term, countAtCall, _totalCount): boolean => countAtCall < 1,
    each: callback,
    noMatch: (_term: string) => {success = false}
  });
  return success
}

function newHighlightElementCallback(entity: Entity, entityName: string, entityOccurrence: number, synonymName: string, synonymOccurrence: number): (element: HTMLElement) => void {
  return (element: HTMLElement): void => {
    element.id = highlightID(entityName, entityOccurrence, synonymName, synonymOccurrence);
    entity.htmlTagIDs = entity.htmlTagIDs ? entity.htmlTagIDs.concat([element.id]) : [element.id];
    element.addEventListener('click', (_event: Event): void => {
      Globals.browser.sendMessage({ type: 'entity_messenger_service_highlight_clicked', body: element.id }).catch(console.log);
    });
  }
}

// @ts-ignore
browser.runtime.onMessage.addListener((msg: Message) => {
  switch (msg.type) {
    case 'content_script_toggle_sidebar':
      return toggleSidebar();

    case 'content_script_open_sidebar':
      return openSidebar();

    case 'content_script_close_sidebar':
      return Promise.resolve(closeSidebar())

    case 'content_script_get_page_contents':
      return Promise.resolve(getPageContents());

    case 'content_script_set_sidebar_ready':
      return Promise.resolve(SIDEBAR_IS_READY = true)

    case 'content_script_await_sidebar_readiness':
      return awaitSidebarReadiness();

    case 'content_script_open_loading_icon':
      return Promise.resolve(UserExperience.showLoadingIcon(true))

    case 'content_script_close_loading_icon':
      return Promise.resolve(UserExperience.showLoadingIcon(false))

    case 'content_script_highlight_entities':
      const tabEntities: TabEntities = parseWithTypes(msg.body)
      return highlightEntites(tabEntities)
  }
})
