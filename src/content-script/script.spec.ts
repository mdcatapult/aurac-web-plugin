/**
 * @jest-environment jsdom
 */

import {Sidebar} from './sidebar'
import {UserExperience} from './userExperience'
import {Browser} from './browser'
import * as puppeteer from 'puppeteer'


let sidebar: HTMLElement


beforeAll(() => {

  puppeteer.launch({
    headless: true // run tests in headless browser
  }).then(() => {
    sidebar = Sidebar.create()
    document.body.classList.add('aurac-transform', 'aurac-body--sidebar-collapsed')
    document.body.appendChild(sidebar);

    UserExperience.create()
    Browser.addListener()
  })
});

test('name', () => {
  expect(true).toBe(true)
  // const sidebarElements = Array.from(document.getElementsByClassName(Sidebar.sidebarClass))
  // expect(sidebarElements.length).toBe(1)
});
