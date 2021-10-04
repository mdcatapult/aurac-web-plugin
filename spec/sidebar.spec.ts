
import {Sidebar} from './../src/content-script/sidebar'
import {UserExperience} from './../src/content-script/userExperience'
import {BrowserMock} from './../src/content-script/browser-mock'
import {SidebarButtons} from './../src/content-script/sidebarButtons';
import {Globals} from './../src/content-script/globals'

let sidebar: HTMLElement

import * as jsdom from 'jsdom'
import { setup } from './util';
const { JSDOM } = jsdom;
const documentObject = new JSDOM('').window.document;

beforeAll(() => {

  setup([])

  sidebar = Sidebar.create()
  Globals.document.body.appendChild(sidebar);
});

it('sidebar should be added to DOM', () => {
  const sidebarElements = Array.from(Globals.document.getElementsByClassName(Sidebar.sidebarClass))
  expect(sidebarElements.length).toBe(1)
});

it('sidebar children should be added to DOM', () => {
  const sidebarChildren = Array.from(sidebar.children)
  const expectedIds = [Sidebar.toolsId, Sidebar.narrativeId]
  expectedIds.forEach(expectedId => {
    expect(sidebarChildren.some(v => v.id === expectedId)).toBe(true)
  })
});
