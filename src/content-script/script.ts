import {Browser} from './browser';
import {Sidebar} from './sidebar';
import {Modal} from "./modal";
import {UserExperience} from './userExperience';

console.log('script loaded');

const sidebar = Sidebar.create()
const modal = Modal.create()
document.body.classList.add('aurac-transform', 'aurac-body--sidebar-collapsed')
document.body.appendChild(sidebar);
document.body.appendChild(modal);

UserExperience.create()
Browser.addListener()
