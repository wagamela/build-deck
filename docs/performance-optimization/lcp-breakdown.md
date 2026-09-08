![Connor Clark](https://web.dev/images/authors/cjamcl.jpg) Connor Clark [X](https://twitter.com/cjamcl) [GitHub](https://github.com/connorjclark)

<br />

Published: Oct 8, 2025

<br />

The Largest Contentful Paint (LCP) reports the render time of the largest image, text block, or video visible in the viewport, relative to when the user first navigated to the page. When optimizing LCP it is [helpful to break this down into subparts](https://web.dev/articles/optimize-lcp#lcp-breakdown). Each LCP subpart has specific improvement strategies. Ideally, most of the LCP time should be spent on loading the resources, not within delays.

The subparts are:

| LCP subpart                                                    | Explanation                                                                                                                                                                                                                        |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[Time to First Byte (TTFB)](https://web.dev/articles/ttfb)** | The time from when the user initiates loading the page until the browser receives the first byte of the HTML document response.                                                                                                    |
| **Resource load delay**                                        | The time between TTFB and when the browser starts loading the LCP resource. If the LCP element doesn't require a resource load to render (for example, if the element is a text node rendered with a system font), this time is 0. |
| **Resource load duration**                                     | The duration of time it takes to load the LCP resource itself. If the LCP element doesn't require a resource load to render, this time is 0.                                                                                       |
| **Element render delay**                                       | The time between when the LCP resource finishes loading and the LCP element rendering fully.                                                                                                                                       |

LCP subparts

## How to pass this insight

This insight always shows for informational purposes (if LCP was measured).

Target an LCP of 2.5 seconds or better, and reduce the time of each phase as much as possible, especially the delay phases. See [Optimize Largest Contentful Paint](https://web.dev/articles/optimize-lcp) for specific strategies.

## Additional references

- [Insight source code](https://source.chromium.org/chromium/chromium/src/+/main:third_party/devtools-frontend/src/front_end/models/trace/insights/LCPPhases.ts)
- [Optimize Largest Contentful Paint](https://web.dev/articles/optimize-lcp)
- [Common misconceptions about how to optimize LCP](https://web.dev/blog/common-misconceptions-lcp)
