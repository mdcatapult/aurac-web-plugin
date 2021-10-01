import {BrowserImplementation} from './browser-implementation'
import {Sidebar} from './sidebar';
import {UserExperience} from './userExperience';
import {Globals} from './globals'

console.log('script loaded');

Globals.document = document
Globals.browser = new BrowserImplementation()

const sidebar = Sidebar.create()
document.body.classList.add('aurac-transform', 'aurac-body--sidebar-collapsed')
document.body.appendChild(sidebar);

UserExperience.create()
BrowserImplementation.addListener()

