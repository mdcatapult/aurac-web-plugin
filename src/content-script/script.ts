console.log('script loaded');


// document.body.classList.add('aurac-transform', 'aurac-body--sidebar-collapsed')

const sidebar = document.createElement('div')
sidebar.className = 'aurac-transform aurac-sidebar aurac-sidebar--collapsed'
document.body.appendChild(sidebar)

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

const toggleSidebar = () => {
  Array.from(document.getElementsByClassName('aurac-transform')).forEach(e => {
    e.className = e.className.replace(/(expanded|collapsed)/, (g) => {
      return g === 'expanded' ? 'collapsed' : 'expanded';
    });
  });
}

sidebarButton.addEventListener('click', toggleSidebar)

// browser.runtime.onMessage.addListener(console.log)
