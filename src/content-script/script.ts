// import { Globals } from './globals';
import { TextHighlighter } from './textHighlighter';
import { ChEMBL } from './chembl';
import { Message, Recogniser, TabEntities } from 'src/types';
import { UserExperience } from './userExperience';
import { Entity } from './types'
import { Globals } from './globals';
import { BrowserImplementation } from './browser-implementation';
import { parse } from '../json';


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
      return new Promise((resolve, reject) => {
        const tabEntities: TabEntities = parse(msg.body)  
        console.log(tabEntities)

        Globals.browser.sendMessage({type: 'settings_service_get_current_recogniser'})
          .then((recogniser: Recogniser) => {
            tabEntities[recogniser]!.entities.forEach((entity, key, m) => {

            })
          })

        resolve(null)
      })
      // return new Promise((resolve, reject) => {
      //   try {
      //     const tabEntities = parse(msg.body) as TabEntities
      //     const oldFormatEntities: Entity[] = []
      //     Object.entries(tabEntities).forEach(([, dict]) => {
      //       if (dict!.show) {
      //         Array.from(dict!.entities).forEach(([identifier, entity]) => {
      //           entity.synonyms.forEach(synonym => oldFormatEntities.push({
      //             entityText: synonym,
      //             resolvedEntity: identifier === synonym ? "" : identifier,
      //             entityGroup: entity.metadata?.entityGroup,
      //             recognisingDict: entity.metadata?.recognisingDict
      //           }))
      //         })
      //       }
      //     })
      //     TextHighlighter.wrapEntitiesWithHighlight(oldFormatEntities)
      //     UserExperience.showLoadingIcon(false)
      //     resolve(null)
      //   } catch (e) {
      //     reject(e)
      //   }
      // })
  }
})
