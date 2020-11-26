# BrowserPlugin

Cross-browser plugin written in Angular. This plugin combines the [web extension api](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions), the [web extension polyfill](https://github.com/mozilla/webextension-polyfill), and the [web extension types](https://github.com/kelseasy/web-ext-types) with angular.

Because Angular works as a single page app, different pages have to be loaded via query parameters. The angular router doesn't seem to pick the up query parameters but the `ActivatedRoute` service does, so routing is implemented a bit strangely.

## Development
Run `npm run build` to build the extension.
Load the extension into chrome as an unpacked extension from `dist/browser-plugin` after building.

Run `npm start` to launch firefox and pre-load the extension.

### Running NER on a webpage

Once the extension is loaded you will see the following icon:

![image](./src/assets/favicon.ico)

Clicking this icon will reveal a popup, which currently has a single `NER` option.  Clicking the `NER` button will run Leadmine (by making an API call to the Leadmine Web Service at https://leadmine.wopr.inf.mdc) on the contents of the active tab in a Chrome or Firefox browser, logging the result.
