import {Browser} from './browser';
import {Sidebar} from './sidebar';
import {UserExperience} from './userExperience';

console.log('script loaded');

Sidebar.create()
UserExperience.create()
Browser.addListener()
