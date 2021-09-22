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
  const sidebarChildren = getAllChildren(sidebar)
  const expectedIDs = Object.values(SidebarButtons.childIDs)

  expectedIDs.forEach(expectedId => {
    expect(sidebarChildren.some(child => {
      console.log('expected: ', expectedId, 'actual: ', child.id)
      return child.id === expectedId
    })).toBe(true)
  })

})

function getAllChildren(element: Element): Element[] {
  const children: Element[] = []
  Array.from(element.children).forEach((child, i) => {
    getAllChildren(child);
    console.log('AAAAA', child.id, i)
    children.push(child)
  })
  children.forEach(v => console.log("BBBBBB: ", v.id))


  return children
}
