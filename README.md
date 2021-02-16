# Browser Plugin

## Running NER on a web page

The plugin runs Leadmine over a web page in a Chrome or Firefox browser, logging the result.  
Once the extension is loaded you will see the following icon:

![image](./src/assets/favicon.ico)

Clicking this icon will reveal a popup, which currently has a single `NER` option.  Clicking the `NER` button will run Leadmine (by making an API call to the Leadmine Web Service at https://leadmine.wopr.inf.mdc) on the contents of the active tab.


### Development

Cross-browser plugin written in Angular. This plugin combines the [web extension api](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions), the [web extension polyfill](https://github.com/mozilla/webextension-polyfill), and the [web extension types](https://github.com/kelseasy/web-ext-types) with angular.

Because Angular works as a single page app, different pages have to be loaded via query parameters. The angular router doesn't seem to pick the up query parameters but the `ActivatedRoute` service does, so routing is implemented a bit strangely.

Run `npm run build` to build the extension.
Load the extension into chrome as an unpacked extension from `dist/browser-plugin` after building.

Run `npm start` to launch firefox and pre-load the extension.

If you want to start the browser on a particular web page then set the following env var:
```bash
export WEB_EXT_START_URL=https://www.uniprot.org/uniprot/O76074
```
Saves a lot of time when testing.

**N.B. YOU MUST BE CONNECTED TO THE ALDERLEY PARK VPN FOR THE PLUGIN TO WORK**

### Custom SSL certs

If you are using custom ssl certs you may need to tell your browser to accept them by navigating to the web-service that ferret uses for NER eg `https://leadmine.wopr.inf.mdc/proteins/entities/pde5`

### Keeping Firefox changes between sessions

Using `npm start` boots a fresh Firefox instance each time. It can get frustrating having to accept any custom ssl certs each time you start. Instead you can set the following env vars:

```bash
export WEB_EXT_FIREFOX_PROFILE=/path/to/custom/profile/dir/
export WEB_EXT_PROFILE_CREATE_IF_MISSING
export WEB_EXT_KEEP_PROFILE_CHANGES=true
```
Then you only have to accept the cert first time. Any future reboot will have the cert saved in the custom profile. However, the cert may get recycled so you may have to add it again.

### Debugging with chrome
If you set `export WEB_EXT_TARGET=chromium` then `npm start` will boot it into chromium. You can also use `export WEB_EXT_CHROMIUM_PROFILE=/a/dir` but you need to create the directory first (unlike with Firefox & `export WEB_EXT_PROFILE_CREATE_IF_MISSING`).

### Firefox Promises & sendMessage
Due to how Firefox uses [web extension polyfills](https://github.com/mozilla/webextension-polyfill/issues/172) the following [bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1456531) means that Firefox needs to use a vanilla Promise object rather than the polyfill it is given. You can `Promise.resolve("A value")` ok but not as an inner function like
```js
return new Promise((resolve, reject) => {
    resolve("A value");
});
```
To solve this we had to add a [custom webpack config](https://developer.okta.com/blog/2019/12/09/angular-webpack). If the Firefox bug gets resolved then revert the following changes:

In angular.json change
```json
          "builder": "@angular-builders/custom-webpack:browser",
```
back to
```json
"builder": "@angular-devkit/build-angular:browser",
```
and remove
```json
"customWebpackConfig": {
  "path": "./custom-webpack.config.js"
}
```
Remove the `custom-webpack.config.json` file. Remove `"@angular-builders/custom-webpack": "^11.0.0"` from `package.json`.
See `app/script/script.ts` for the actual Promise code.
