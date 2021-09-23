/**
 * @jest-environment jsdom
 */

import {Sidebar} from './sidebar'
import {UserExperience} from './userExperience'
import {BrowserMock} from './browser-mock'
import {SidebarButtons} from './sidebarButtons';

let sidebar: HTMLElement

beforeAll(() => {
  sidebar = Sidebar.create(new BrowserMock())
  document.body.classList.add('aurac-transform', 'aurac-body--sidebar-collapsed')
  document.body.appendChild(sidebar);
});

test('sidebar should be added to DOM', () => {
  const sidebarElements = Array.from(document.getElementsByClassName(Sidebar.sidebarClass))
  expect(sidebarElements.length).toBe(1)
});

test('sidebar children should be added to DOM', () => {
  const sidebarChildren = Array.from(sidebar.children)
  const expectedIds = [Sidebar.toolsId, Sidebar.narrativeId]
  expectedIds.forEach(expectedId => {
    expect(sidebarChildren.some(v => v.id === expectedId)).toBe(true)
  })
})
