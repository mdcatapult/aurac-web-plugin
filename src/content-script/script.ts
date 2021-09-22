import {Browser} from './browser';
import {Sidebar} from './sidebar';
import {UserExperience} from './userExperience';

console.log('script loaded');

const sidebar = Sidebar.create()
document.body.classList.add('aurac-transform', 'aurac-body--sidebar-collapsed')
document.body.appendChild(sidebar);

UserExperience.create()
Browser.addListener()

