
console.log('script loaded');


document.body.classList.add('aurac-transform', 'aurac-body--sidebar-expanded')

const sidebar = document.createElement('section')
sidebar.className = 'aurac-transform aurac-sidebar aurac-sidebar--expanded'
document.body.appendChild(sidebar)
const iframe = document.createElement('iframe')
iframe.className = "aurac-iframe"
iframe.src = browser.runtime.getURL('index.html?page=sidebar')
sidebar.appendChild(iframe)

browser.runtime.onMessage.addListener(console.log)
