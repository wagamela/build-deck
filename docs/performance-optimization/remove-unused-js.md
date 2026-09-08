# Remove Unused JavaScript

Unused JavaScript can slow down your page load speed.

- If the JavaScript is [render-blocking](https://web.dev/critical-rendering-path-adding-interactivity-with-javascript/), the browser must download, parse, compile, and evaluate the script before it can proceed with the other work needed for rendering the page.
- Even if the JavaScript is asynchronous and not render-blocking, the code competes for bandwidth with other resources while downloading. This can have significant performance implications.
- Sending unused code over the network is also wasteful for mobile users who may have limited data plans.

---

## How the Unused JavaScript Audit Fails

[Lighthouse](https://developer.chrome.com/docs/lighthouse/overview) flags every JavaScript file with more than **20 KiB of unused code**.

> Click a value in the **URL** column to open the script's source code in a new tab.

**Note:** See the [Lighthouse performance scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring) documentation to understand how the overall performance score is calculated.

---

## How to Remove Unused JavaScript

### Detect Unused JavaScript

The [Coverage tab](https://developer.chrome.com/docs/devtools/css/reference#coverage) in Chrome DevTools can provide a line-by-line breakdown of unused code.

The [`Coverage` class](https://pptr.dev/#?product=Puppeteer&version=v4.0.0&show=api-class-coverage) in Puppeteer can also help automate the process of detecting unused code and extracting used code.

---

## Build Tool Support for Removing Unused Code

Check the [Tooling.Report](https://tooling.report/) tests to determine whether your bundler supports features that make it easier to avoid or remove unused code:

- [Code Splitting](https://bundlers.tooling.report/code-splitting/)
- [Unused Code Elimination](https://bundlers.tooling.report/transformations/dead-code/)
- [Unused Imported Code](https://bundlers.tooling.report/transformations/dead-code-dynamic/)

---

## Stack-Specific Guidance

### Angular

If you are using Angular CLI, include source maps in your production build to [inspect your bundles](https://angular.io/guide/deployment#inspect-the-bundles).

### Drupal

Consider removing unused JavaScript assets and only attaching the necessary Drupal libraries to the relevant page or component.

See the [Drupal documentation](https://www.drupal.org/docs/develop/theming-drupal/adding-assets-css-js-to-a-drupal-theme-via-librariesyml#define) for details.

To identify attached libraries that are adding unnecessary JavaScript, try running [Code Coverage](https://developer.chrome.com/docs/devtools/coverage) in Chrome DevTools.

When JavaScript aggregation is disabled, you can identify the theme or module responsible from the script URL.

Look for themes or modules with scripts that have a large amount of red code in the Coverage tab. A theme or module should only attach a JavaScript library if it is actually used on the page.

### Joomla

Consider reducing the number of [Joomla extensions](https://extensions.joomla.org/) that load unused JavaScript, or replace extensions that add unnecessary JavaScript.

### Magento

Disable Magento's built-in [JavaScript bundling](https://devdocs.magento.com/guides/v2.3/frontend-dev-guide/themes/js-bundling.html).

### React

If you are not using server-side rendering, split your JavaScript bundles with [`React.lazy()`](https://web.dev/articles/code-splitting-suspense).

If you are using server-side rendering, use a third-party library such as [loadable-components](https://loadable-components.com/docs/getting-started/) for code splitting.

### Vue

If you are not using server-side rendering and are using the Vue router, split your bundles by [lazy loading routes](https://next.router.vuejs.org/guide/advanced/lazy-loading.html).

### WordPress

Consider reducing the number of [WordPress plugins](https://wordpress.org/plugins/) that load unused JavaScript, or switch to plugins that load less JavaScript.

---

## Resources

- [Source code for the Lighthouse Remove Unused Code audit](https://github.com/GoogleChrome/lighthouse/blob/main/core/audits/byte-efficiency/unused-javascript.js)
- [Remove Unused Code](https://web.dev/articles/remove-unused-code)
- [Adding Interactivity with JavaScript](https://web.dev/critical-rendering-path-adding-interactivity-with-javascript/)
- [Code Splitting](https://bundlers.tooling.report/code-splitting/)
- [Dead Code Elimination](https://bundlers.tooling.report/transformations/dead-code/)
- [Dead Imported Code](https://bundlers.tooling.report/transformations/dead-code-dynamic/)
- [Find Unused JavaScript and CSS Code with the Coverage Tab](https://developer.chrome.com/docs/devtools/css/reference#coverage)
- [`Coverage` class in Puppeteer](https://pptr.dev/#?product=Puppeteer&version=v4.0.0&show=api-class-coverage)
