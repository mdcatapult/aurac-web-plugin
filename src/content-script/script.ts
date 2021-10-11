// import {BrowserImplementation} from './browser-implementation'
// import {Sidebar} from './sidebar';
// import {Modal} from './modal';
// import {UserExperience} from './userExperience';
// import {Globals} from './globals'

console.log('script loaded');

// Globals.document = document
// Globals.browser = new BrowserImplementation()

// const sidebar = Sidebar.create()
// const modal = Modal.create()
document.body.classList.add('aurac-transform', 'aurac-body--sidebar-expanded')

const sidebar = document.createElement('section')
sidebar.className = 'aurac-transform aurac-sidebar aurac-sidebar--expanded'
document.body.appendChild(sidebar)
const iframe = document.createElement('iframe')

iframe.src = browser.runtime.getURL('index.html')
sidebar.appendChild(iframe)
// document.body.appendChild(sidebar);
// document.body.appendChild(modal);

// UserExperience.create()
// BrowserImplementation.addListener()

