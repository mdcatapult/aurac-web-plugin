import {BrowserImplementation} from './browser-implementation'
import {Sidebar} from './sidebar';
import {Modal} from './modal';
import {UserExperience} from './userExperience';
import {Globals} from './globals'

console.log('script loaded');

Globals.document = document
Globals.browser = new BrowserImplementation()

const sidebar = Sidebar.create()
const modal = Modal.create()
document.body.classList.add('aurac-transform', 'aurac-body--sidebar-collapsed')
document.body.appendChild(sidebar);
document.body.appendChild(modal);

UserExperience.create()
BrowserImplementation.addListener()

