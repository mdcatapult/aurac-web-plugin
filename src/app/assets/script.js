(function () {
    console.log('script loaded');
    browser.runtime.onMessage.addListener(function (msg) {
        switch (msg.type) {
            case 'get_page_contents':
                return Promise.resolve({ type: 'leadmine', body: document.querySelector('body').outerHTML });
            case 'markup_page':
                document.head.appendChild(newFerretStyleElement());
                msg.body.map(function (entity) {
                    var term = entity.entity.entityText;
                    var info = { entityText: term, resolvedEntity: entity.entity.resolvedEntity };
                    getSelectors(term)
                        .map(function (selector) {
                        // Try/catch for edge cases.
                        try {
                            var node = document.querySelector(selector);
                            node.innerHTML = node.innerHTML.replace(term, highlightTerm(term, entity.entity.recognisingDict.htmlColor));
                            var ferretHighlight = document.querySelector(selector + ' .ferret-highlight');
                            var element = newFerretTooltip(info);
                            ferretHighlight.appendChild(element);
                        }
                        catch (e) {
                            console.error(e);
                        }
                    });
                });
                break;
            default:
                throw new Error('Received unexpected message from plugin');
        }
    });
    // highlights a term by wrapping it an HTML span
    var highlightTerm = function (term, colour) { return "<span class=\"ferret-highlight\" style=\"background-color: " + colour + ";position: relative;\">" + term + "</span>"; };
    // creates an HTML style element with basic styling for Ferret tooltip
    var newFerretStyleElement = function () {
        var styleElement = document.createElement('style');
        styleElement.innerHTML =
            ".ferret-tooltip {\n        color: black;\n        font-family: Arial, sans-serif;\n        font-size: 100%;\n        background: rgb(192,192,192);\n        transform: translate(0%, 50%);\n        border: 2px solid #ffff00;\n        padding: 10px;\n        position: absolute;\n        z-index: 10;\n        visibility: hidden;\n    }\n\n    .ferret-highlight:hover .ferret-tooltip{\n        visibility: visible;\n    }";
        return styleElement;
    };
    // creates a new div with Leadmine entityText and resolvedEntity
    var newFerretTooltip = function (info) {
        var div = document.createElement('div');
        div.className = 'ferret-tooltip';
        div.insertAdjacentHTML('afterbegin', "<p>Term: " + info.entityText + "</p>");
        if (info.resolvedEntity) {
            div.insertAdjacentHTML('beforeend', "<p>Resolved entity: " + info.resolvedEntity + "</p>");
        }
        return div;
    };
    var getSelectors = function (entity) {
        // Create regex for entity.
        var re = new RegExp("\\b" + entity + "\\b");
        // Get all nodes whose innerHTML contains the entity.
        var nodes = Array.from(document.querySelectorAll('body *:not(script):not(style)'))
            .filter(function (htmlElement) { return htmlElement.innerText && htmlElement.innerText.match(re); })
            // Filter on inner html as well so that we don't catch 'enti<div>ty</div>' like things.
            .filter(function (htmlElement) { return htmlElement.innerHTML && htmlElement.innerHTML.match(re); });
        // Create an array of unique selectors for each node.
        var nodeSelectors = nodes.map(function (n) { return uniqueSelector(n); });
        // Unset the selectors which are parents of other selectors in the array.
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            var idx = nodeSelectors.indexOf(uniqueSelector(node.parentElement));
            if (idx > -1 || !node.parentElement) {
                nodeSelectors[idx] = undefined;
                nodes[idx] = undefined;
            }
        }
        // Return the selectors which are still defined.
        return nodeSelectors.filter(function (n) { return !!n; });
    };
    var uniqueSelector = function (node) {
        if (!node) {
            return undefined;
        }
        var selector = '';
        while (node.parentElement) {
            var siblings = Array.from(node.parentElement.children).filter(function (e) { return e.tagName === node.tagName; });
            selector =
                (siblings.indexOf(node)
                    ? node.tagName + ":nth-of-type(" + (siblings.indexOf(node) + 1) + ")"
                    : "" + node.tagName) + ("" + (selector ? ' > ' : '') + selector);
            node = node.parentElement;
        }
        return "html > " + selector.toLowerCase();
    };
})();
