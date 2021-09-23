### Issues with Tippyjs

Adding this line to `textHighlighter`:

```javascript
import 'tippy.js/dist/tippy.css';
```

ng build works, but webpack fails with this error:

```bash
ERROR in ./node_modules/tippy.js/dist/tippy.css 1:0
Module parse failed: Unexpected token (1:0)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
> .tippy-box[data-animation=fade][data-state=hidden]{opacity:0}[data-tippy-root]{max-width:calc(100vw - 10px)}.tippy-box{position:relative;background-color:#333;color:#fff;border-radius:4px;font-size:14px;line-height:1.4;outline:0;transition-property:transform,visibility,opacity}.tippy-box[data-placement^=top]>.tippy-arrow{bottom:0}.tippy-box[data-placement^=top]>.tippy-arrow:before{bottom:-7px;left:0;border-width:8px 8px 0;border-top-color:initial;transform-origin:center top}.tippy-box[data-placement^=bottom]>.tippy-arrow{top:0}.tippy-box[data-placement^=bottom]>.tippy-arrow:before{top:-7px;left:0;border-width:0 8px 8px;border-bottom-color:initial;transform-origin:center bottom}.tippy-box[data-placement^=left]>.tippy-arrow{right:0}.tippy-box[data-placement^=left]>.tippy-arrow:before{border-width:8px 0 8px 8px;border-left-color:initial;right:-7px;transform-origin:center left}.tippy-box[data-placement^=right]>.tippy-arrow{left:0}.tippy-box[data-placement^=right]>.tippy-arrow:before{left:-7px;border-width:8px 8px 8px 0;border-right-color:initial;transform-origin:center right}.tippy-box[data-inertia][data-state=visible]{transition-timing-function:cubic-bezier(.54,1.5,.38,1.11)}.tippy-arrow{width:16px;height:16px;color:#333}.tippy-arrow:before{content:"";position:absolute;border-color:transparent;border-style:solid}.tippy-content{position:relative;padding:5px 9px;z-index:1}
 @ ./src/content-script/textHighlighter.ts 5:0-33
 @ ./src/content-script/browser.ts
 @ ./src/content-script/script.ts
```

- try adding css loader to webpack config (taken from the config when we first refactored the script):

```javascript
...
{
  test: /\.css$/,
  use: [
    "style-loader",
    {
      loader: "css-loader",
      options: {
        importLoaders: 1,
        modules: true
      },
    },
  ],
  exclude:/\.module\.css$/
}
...
```

ng build now fails:

```bash
Error: ./node_modules/tippy.js/dist/tippy.css
Module build failed (from ./node_modules/@angular-devkit/build-angular/node_modules/postcss-loader/dist/cjs.js):
SyntaxError

(1:1) /home/nick.etherington@medcat.local/Workspace/Ferret/ferret-browser-plugin/node_modules/tippy.js/dist/tippy.css Unknown word

> 1 | import api from "!../../style-loader/dist/runtime/injectStylesIntoStyleTag.js";
    | ^
  2 |             import content from "!!../../css-loader/dist/cjs.js??ref--19-1!./tippy.css";
  3 | 

 @ ./src/content-script/textHighlighter.ts 5:0-33
 @ ./src/content-script/browser.ts
 @ ./src/content-script/script.ts
```

BUT NONE OF THESE FILES CONTAIN THAT LINE!!!

- try importing tippy.css into main style file:

```javascript
@import 'tippy.js/dist/tippy.css';
```

ng build still fails

- try changing css loader in webpack config:

```javascript
...
{
  test: /\.css$/,
  use: ['css-loader']
}
...
```
ng build fails:
```bash
Error: ./node_modules/tippy.js/dist/tippy.css
Module build failed (from ./node_modules/@angular-devkit/build-angular/node_modules/postcss-loader/dist/cjs.js):
SyntaxError

(1:1) /home/nick.etherington@medcat.local/Workspace/Ferret/ferret-browser-plugin/node_modules/tippy.js/dist/tippy.css Unknown word

> 1 | // Imports
    | ^
  2 | import ___CSS_LOADER_API_IMPORT___ from "../../css-loader/dist/runtime/api.js";
  3 | var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});

 @ ./src/content-script/textHighlighter.ts 5:0-33
 @ ./src/content-script/browser.ts
 @ ./src/content-script/script.ts
```
- try adding `exclude: /\.module\.css$/` to webpack config for css loader - same error as above
- change webpack config to:
```javascript
...
{
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader'
  ],
},
...
```
ng build fails:
```bash
Error: ./node_modules/tippy.js/dist/tippy.css
Module build failed (from ./node_modules/@angular-devkit/build-angular/node_modules/postcss-loader/dist/cjs.js):
SyntaxError

(1:1) /home/nick.etherington@medcat.local/Workspace/Ferret/ferret-browser-plugin/node_modules/tippy.js/dist/tippy.css Unknown word

> 1 | import api from "!../../style-loader/dist/runtime/injectStylesIntoStyleTag.js";
    | ^
  2 |             import content from "!!../../css-loader/dist/cjs.js!./tippy.css";
  3 | 

 @ ./src/content-script/textHighlighter.ts 5:0-33
 @ ./src/content-script/browser.ts
 @ ./src/content-script/script.ts

```
- try specifically including the tippy.css file in the webpack config:
```javascript
...
include: [path.resolve(__dirname, 'node_modules/tippy.js/dist/tippy.css')],
...
```
no change - same error

