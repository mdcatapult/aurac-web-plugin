console.log("script loaded");
browser.runtime.onMessage.addListener((msg) => {
    console.log(msg)
    if (msg.type === 'run_leadmine') {
        return Promise.resolve({type: 'leadmine', tab: msg.tabId, page: document.querySelector('html').outerHTML})
    }
});
