console.log('script loaded');


// document.body.classList.add('aurac-transform', 'aurac-body--sidebar-collapsed')

const sidebar = document.createElement('div')
sidebar.id = "aurac-sidebar"
sidebar.className = 'aurac-transform aurac-sidebar aurac-sidebar--collapsed'

const iframe = document.createElement('iframe')
iframe.className = "aurac-iframe"
iframe.src = browser.runtime.getURL('index.html?page=sidebar')
sidebar.appendChild(iframe)

const buttonRoot = document.createElement('div')
buttonRoot.style.position = 'absolute';
buttonRoot.style.top = '0';
buttonRoot.style.left = '100%'
buttonRoot.style.height = '100%'
sidebar.appendChild(buttonRoot)

const shadowButtonRoot = buttonRoot.attachShadow({mode: 'closed'})

const sidebarButtonStyle = document.createElement('style')
sidebarButtonStyle.innerHTML = `button {
  border: none;
  position: fixed;
  top: 40%;
  height: 3em;
  width: 3em;
  z-index: 2147483647;
  border-radius: 0 1em 1em 0;
  background-color: rgb(192, 192, 192);
}

button:hover {
  border: 1px solid black;
}`
shadowButtonRoot.appendChild(sidebarButtonStyle)

const sidebarButton = document.createElement('button')
shadowButtonRoot.appendChild(sidebarButton);

const sidebarButtonLogo = document.createElement('img')
sidebarButtonLogo.src = browser.runtime.getURL('assets/head-brains.icon.128.png')
sidebarButtonLogo.style.width = "80%"
sidebarButton.appendChild(sidebarButtonLogo)

const injectSidebar = () => {
  document.body.appendChild(sidebar);
}

const toggleSidebar = () => {
  if (!!document.getElementsByClassName('aurac-sidebar--expanded').length) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

async function openSidebar() {
  if (!document.getElementById("aurac-sidebar")) {
    injectSidebar()
    await new Promise(r => setTimeout(r, 100));
  }

  Array.from(document.getElementsByClassName('aurac-transform')).forEach(e => {
    e.className = e.className.replace('collapsed', 'expanded');
  });
}

const closeSidebar = () => {
  Array.from(document.getElementsByClassName('aurac-transform')).forEach(e => {
    e.className = e.className.replace('expanded', 'collapsed');
  });
}

sidebarButton.addEventListener('click', toggleSidebar)
// @ts-ignore
browser.runtime.onMessage.addListener((msg) => {
  switch (msg.type) {
    case 'content_script_toggle_sidebar':
      return new Promise<void>(resolve => {
        toggleSidebar();
        resolve();
      })
    case 'content_script_open_sidebar':
      return new Promise<void>(resolve => {
        openSidebar();
        resolve();
      })
    case 'content_script_close_sidebar':
      return new Promise<void>(resolve => {
        closeSidebar();
        resolve();
      })
    default:
      console.log(msg);
  }
})
