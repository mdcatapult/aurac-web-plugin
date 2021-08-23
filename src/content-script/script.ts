/* TOODO

content - vanilla TS
popup - angular
background - angular
  - should webservice calls be abstracted out in to SDK-esque thing
  - concept of JS lib to call web services (swap out libraries)
 		- node TS lib (then test that independently)
		- lib goes in to nexus and is versioned

 - all talk to each other


todo ideas

 - split up code in to components/classes
	- unit tests
 - integration tests
 		- test html pages?

 - inline css moves out?
 - make sure things are namespaced (packages/folders) for ts/css
 - functions have to return values
 - global state
 - no global variables
 - can we use options?

*/

import {Browser} from './browser';
import {Sidebar} from './sidebar';

console.log('script loaded');

const sidebar = Sidebar.init(document.createElement('span'))
Browser.addListener(sidebar)









