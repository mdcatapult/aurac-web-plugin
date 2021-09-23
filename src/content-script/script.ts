import {BrowserImplementation} from './browser-implementation'
import {Sidebar} from './sidebar';
import {UserExperience} from './userExperience';

console.log('script loaded');

const sidebar = Sidebar.create(new BrowserImplementation())
document.body.classList.add('aurac-transform', 'aurac-body--sidebar-collapsed')
document.body.appendChild(sidebar);

UserExperience.create()
BrowserImplementation.addListener()

