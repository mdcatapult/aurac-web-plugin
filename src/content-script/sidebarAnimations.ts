import {ElementProperties} from './types';

export module SidebarAnimations {


// TODO take in state/return state?
// This function will animate the sidebar opening and closing
  export function animateElements(element: ElementProperties[], isExpanded: boolean): boolean {
    element.forEach(elementProperty => {
      let id = null;
      // If the sidebar is currently open, then it will keep moving until it has reached its target position, otherwise
      // It will keep closing until it has reached its closed position
      let pos = isExpanded ? elementProperty.position.expanding : elementProperty.position.collapsing;
      const target = isExpanded ? elementProperty.position.collapsing : elementProperty.position.expanding;
      const elementDistanceSpeed = 0.5;
      id = setInterval(frame, 1);
      // The frame function is used to animate the sidebar moving in and out. setInterval will call this function every seconds/ms
      // depending on what number you pass to it
      function frame() {
        if (pos === target) { // If the position is equal to its target then it has reached its new position and should stop moving
          clearInterval(id); // We reset the timer of the element back to nothing when its reached its target
        } else {
          if (!elementProperty.isReversed) { // The 'isReversed' boolean relates to the document body width, as the sidebar expands
            // on the screen, the width of the document body needs to contract and vice versa
            pos = isExpanded ? pos + elementDistanceSpeed : pos - elementDistanceSpeed;
          } else { // The elementDistanceSpeed is how much the element will move by within this timeframe
            pos = isExpanded ? pos - elementDistanceSpeed : pos + elementDistanceSpeed;
          }
          elementProperty.element.style[elementProperty.property] = pos + 'vw'; // Moves the respective element by a directional property
        }
      }
    });

    // TODO is there a better way of doing this?
    return !isExpanded;
    // isExpanded = !isExpanded;
  }


  // creates an HTML style element with basic styling for Aurac sidebar

  // why is styling done in Animations.ts ?
  export const newAuracStyleElement =
    (elementPropertyArray: ElementProperties[],
     auracSidebar: HTMLSpanElement,
     toggleButton: HTMLButtonElement) => {

      const styleElement = document.createElement('style');

      styleElement.innerHTML = `.aurac-sidebar {
        color: black;
        font-family: Arial, sans-serif;
        font-size: 14px;
        background: rgb(192,192,192);
        position: fixed;
        z-index: 2147483647;
        height: 100vh;
        left: ${elementPropertyArray.find(v => v.element === auracSidebar).position.expanding}vw;
        top: 0;
        width: 20vw;
        border-right: 2px solid black;
        padding: 5px;
        overflow-wrap: break-word;
        overflow-y: scroll;
    }
    .sidebar-button {
      color: black;
      background-color: rgb(192, 192, 192);
      position: fixed;
      left: ${elementPropertyArray.find(v => v.element === toggleButton).position.expanding}vw;
      top: 50%;
     }
     .left-arrow-button {
      color: black;
      background-color: rgb(192, 192, 192);
      order: 1;
      padding: 5px;
     }
     .right-arrow-button {
      color: black;
      background-color: rgb(192, 192, 192);
      order: 2;
      padding: 5px;
     }
     .arrow-buttons {
     display: flex;
     justify-content: flex-end;
     flex-direction: row;
     }
     #aurac-logo {
     width: 5vw;
     height: 5vw;
     display: block;
     margin-left: auto;
     margin-right: auto;
     margin-top: 0.3vw;
     margin-bottom: 0.3vw;
     }
     #aurac-narrative {
     text-align: center;
     }
     .cross-button {
      position: relative;
      top: -45px;
      left: 1px;
      color: red;
      background-color: rgb(192, 192, 192);
      padding: 5px;
      }
     `;

      return styleElement;
    };


  // TODO move CSS stuff to it's own class/file
  export function getElementPropertyArray(toggleButton: HTMLButtonElement,
                                          auracSidebar: HTMLSpanElement,
                                          documentBody: HTMLElement): ElementProperties[] {
    return [
      {
        element: toggleButton,
        property: 'left',
        position: {
          expanding: 20,
          collapsing: 0
        },
      },
      {
        element: auracSidebar,
        property: 'left',
        position: {
          expanding: 0,
          collapsing: -21
        },
      },
      {
        element: documentBody,
        property: 'width',
        position: {
          expanding: 80,
          collapsing: 100
        },
        isReversed: true,
      },
      {
        element: documentBody,
        property: 'marginLeft',
        position: {
          expanding: 20,
          collapsing: 0
        },
      },
    ]
  }


}
