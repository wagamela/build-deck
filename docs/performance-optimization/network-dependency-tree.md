![Connor Clark](https://web.dev/images/authors/cjamcl.jpg) Connor Clark [X](https://twitter.com/cjamcl) [GitHub](https://github.com/connorjclark)

<br />

Published: Oct 8, 2025

<br />

Avoid chaining critical requests by reducing the length of chains, reducing the download size of resources, or deferring the download of unnecessary resources to improve page load.

## How to pass this insight

This insight only fails if a critical request is not discoverable early in the page. A request is considered critical if it is potentially render-blocking or [high priority](https://web.dev/articles/fetch-priority#resource-priority).

Some strategies for minimizing the impact of long request chains:

- Minimize the number of critical resources, for example, eliminate them, defer their download, mark them as async.
- Optimize the number of critical bytes to reduce the download time (number of round trips).
- Optimize the order in which the remaining critical resources are loaded: download all critical assets as early as possible to shorten the critical path length.

Learn more about optimizing your [images](https://web.dev/articles/use-imagemin-to-compress-images), [JavaScript](https://web.dev/articles/apply-instant-loading-with-prpl), [CSS](https://web.dev/articles/defer-non-critical-css), and [web fonts](https://web.dev/articles/avoid-invisible-text).

## Stack-specific guidance

This insight also offers stack-specific guidance for pages using the following technologies:

### Magento

If you are not bundling your JavaScript assets, consider using [baler](https://github.com/magento/baler).

## Additional references

- [Insight source code](https://source.chromium.org/chromium/chromium/src/+/main:third_party/devtools-frontend/src/front_end/models/trace/insights/NetworkDependencyTree.ts)
- [Understand the critical path](https://source.chromium.org/chromium/chromium/src/+/main:third_party/devtools-frontend/src/front_end/models/trace/insights/NetworkDependencyTree.ts)
