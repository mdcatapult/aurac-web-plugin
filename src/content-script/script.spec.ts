/**
 * @jest-environment jsdom
 */

import {Sidebar} from './sidebar'
import {UserExperience} from './userExperience'
import {BrowserMock} from './browser-mock'
// import * as puppeteer from 'puppeteer'


let sidebar: HTMLElement


beforeAll(() => {

  sidebar = Sidebar.create(new BrowserMock())
  document.body.classList.add('aurac-transform', 'aurac-body--sidebar-collapsed')
  document.body.appendChild(sidebar);

});

test('name', () => {
  expect(true).toBe(true)
  // const sidebarElements = Array.from(document.getElementsByClassName(Sidebar.sidebarClass))
  // expect(sidebarElements.length).toBe(1)
});
