# Browser Plugin

## Running NER on a web page

The plugin runs an NER tool over a web page in a Chrome or Firefox browser, and highlights any matches. Those highlights can then be clicked to display further information in a sidebar.  
Once the extension is loaded you will see the following icon:

![image](src/assets/head-brains.icon.48.png)

Clicking this icon will reveal a popup. To run NER on the current page, click 'NER'.

Aurac is capable of using different dictionaries for NER, accessible through Settings -> Preferences. Selecting a dictionary will
cause Aurac to use that dictionary for NER. Other than Swissprot, each dictionary corresponds to a specific Leadmine deployment:

- Genes/Proteins
- Diseases
- Chemicals(SMILES)
- Swissprot

Swissprot data is broken down by species. When this dictionary is selected, a dropdown menu containing a sample of different species will appear, allowing the user to filter highlights by their species. For example, selecting "Homo Sapiens" will only highlight entities which relate to "Homo Sapiens".

## Settings and Preferences

There are three tabs in the settings page of the popup:

1. URLs:

   - a field for each separate web service used by Aurac, currently
     - Leadmine
     - Compound Converter
     - Unichem Plus
   - **N.B. URLs default to internal Medicines Discovery Catapult k8s deployments, which are not accessible to users outside that organisation**

2. Sources:

   - checkboxes to determine which links a user sees displayed in a sidebar card. Current options are
     - chembl
     - mcule
     - molport
     - pubchem
     - surechembl

3. Preferences:
   - options which will determine what is highlighted on a page when NER is run, currently
     - minimum entity length - minimum length of terms to higlight, defaults to 2
     - which dictionary to use for NER

### Development

**tl;dr**

```bash
set -a; source .env; set +a
npm run dev
```

**in depth:**

Cross-browser plugin written in Angular. This plugin combines the [web extension api](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions), the [web extension polyfill](https://github.com/mozilla/webextension-polyfill), and the [web extension types](https://github.com/kelseasy/web-ext-types) with angular.

Because Angular works as a single page app, different pages have to be loaded via query parameters. The angular router doesn't seem to pick the up query parameters but the `ActivatedRoute` service does, so routing is implemented a bit strangely.

`npm run build && npm run start` boots the app for a production environment.

Build time is reduced when instead running `npm run dev`, which can be used for development environment.

If you want to start the browser on a particular web page then set the following env var:

```bash
export WEB_EXT_START_URL=https://www.uniprot.org/uniprot/O76074
```

Saves a lot of time when testing.

**N.B. MDC USERS MUST BE CONNECTED TO THE ALDERLEY PARK VPN FOR THE PLUGIN TO WORK USING THE DEFAULT URLS**

### Keeping Firefox changes between sessions

Using `npm start` boots a fresh Firefox instance each time. It can get frustrating having to accept any custom ssl certs each time you start. Instead you can set the following env vars:

```bash
export WEB_EXT_FIREFOX_PROFILE=/path/to/custom/profile/dir/
export WEB_EXT_PROFILE_CREATE_IF_MISSING=true
export WEB_EXT_KEEP_PROFILE_CHANGES=true
```

Then you only have to accept the cert first time. Any future reboot will have the cert saved in the custom profile. However, the cert may get recycled so you may have to add it again.

### Debugging with chrome

If you set `export WEB_EXT_TARGET=chromium` then `npm start` will boot it into chromium. You can also use `export WEB_EXT_CHROMIUM_PROFILE=/a/dir` but you need to create the directory first (unlike with Firefox & `export WEB_EXT_PROFILE_CREATE_IF_MISSING`).

You might find it easier to use the Aurac code created with `npm run unopt` when debugging in a browser.

### Firefox Promises & sendMessage

Due to how Firefox uses [web extension polyfills](https://github.com/mozilla/webextension-polyfill/issues/172) the following [bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1456531) means that Firefox needs to use a vanilla Promise object rather than the polyfill it is given. You can `Promise.resolve("A value")` ok but not as an inner function like

```js
return new Promise((resolve, reject) => {
  resolve('A value')
})
```

To solve this we have added the following rule to webpack.config.js. If the Firefox bug gets resolved simply remove this rule:

```javascript
{
  test: /\.js$/,
  exclude: /(node_modules|bower_components)/,
  use: {
    loader: "babel-loader",
    options: {
      presets: ["babel-preset-env"],
      plugins: [
        [
          "babel-plugin-transform-runtime",
          { polyfill: false, regenerator: true }
        ]
      ]
    }
  }
},
```

See `app/script/script.ts` for the actual Promise code.

### Building, linting & running

There are various convenience scripts inside the `package.json` that can be run using `npm run`. Highlights include:

- start - start up a browser with the plugin pre-loaded
- weblint - lint the code using web-ext
- build - build the plugin
- mocha - tests the popup via [mocha](https://mochajs.org/) & [puppeteer](https://github.com/puppeteer/puppeteer) in a headless chrome browser. Tests and setup are in `mocha-test.js`. Uses the compiled plugin code so needs a recent `npm run build` first.
- unopt - builds unoptimized/unminified version of the app. Makes it easier to debug in the browser

### PDF Conversion

There is a feature in Aurac that lets you put in the URL of an online PDF and convert it into HTML format which can then be NER'd.
However, if you attempt to use this pdf conversion while on any of the pages below it will not work:

- `about:debugging` on Firefox settings
- any page that begins with `chrome://`

### Releases and versions

Running the `release` CI job will release two versions - a general release with all recognisers, and a bio release which only uses Swissprot and whose tag will be suffixed with `-bio`.
For example, v1.2.3 and v1.2.3-bio.

### Credits

Designed using elements from Heroicon and Vecteezy.com.

## Known Issues

- PDF conversion does not currently work in Firefox.  This is probably due to the content script trying to communicate directly with the pdf converter rather than via the background component.
- When clicking on the arrow buttons to cycle through instances of a gene or protein on a page those instances are scrolled through alphabetically as opposed to in the order in which they appear on the page. Highlighted terms should be sorted by y position (or x position if identical y position) rather than value.
- If the dictionary importer is run whilst there is no Redis instance running you will see an (incorrect) error something like that below, when the format is in fact fine.
```
{"level":"fatal","error":"dial tcp 127.0.0.1:6379: connect: connection refused","time":"2022-06-16T11:20:06+01:00","message":"Could not read source file into pubchem. Are you sure this format is correct?"}
```

## Licence

This project is licensed under the terms of the Apache 2 license, which can be found in the repository as `LICENCE.txt`.
