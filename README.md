Shepherd – Contextual Tag‑Feed Ad SelectorVersion: 1.0.0
License: MIT License
Author: Azzurro Technology Inc
Contact: info@azzurro.tech

Table of Contents

Overview
Features
Demo
Installation
Usage

HTML Setup
CSS Styling
JavaScript Initialization


Configuration Options
Adding New Ad Providers
Customization
Development
License
Support & Contributions


Overview
Shepherd is a lightweight, pure‑JavaScript library that renders an adjustable, horizontally‑scrollable feed of article tags and dynamically displays contextual advertisements from multiple providers (e.g., Carbon, Facebook Audience Network, Google AdSense).
Ads are selected solely based on the keywords associated with the tags currently visible on the screen, ensuring relevance while keeping the implementation framework‑agnostic.

Features

Zero dependencies – works with plain HTML, CSS, and vanilla JS.
Adjustable number of visible tags and spacing between them.
Automatic detection of which tags are in view using IntersectionObserver.
Provider‑agnostic ad selection logic – plug in any ad network that supports keyword targeting.
Simple API for initialization and runtime configuration changes.
MIT‑licensed – free for commercial and private use.


Demo
A minimal working example is provided in the repository:
git clone https://github.com/azzurro-tech/shepherd.git
cd shepherd
open index.html   # or open the file in your favourite browser
Scroll the tag bar left/right; the highlighted tags indicate which ones are influencing the displayed ad.

Installation
Since Shepherd is pure JavaScript, you can either:

Download the files (shepherd.js, shepherd.css) and host them alongside your site, or
Include via CDN (once published) – e.g.:

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/shepherd@1.0.0/shepherd.css">
<script src="https://cdn.jsdelivr.net/npm/shepherd@1.0.0/shepherd.js"></script>

Usage
HTML Setup
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shepherd Demo</title>
  <link rel="stylesheet" href="shepherd.css">
</head>
<body>

  <!-- Tag feed container -->
  <section id="tag-feed" class="shepherd-feed"></section>

  <!-- Ad slot container -->
  <section id="ad-slot" class="shepherd-ad"></section>

  <script src="shepherd.js"></script>
  <script>
    Shepherd.init({
      feedElementId: 'tag-feed',
      adSlotId: 'ad-slot',
      visibleTagCount: 6,
      tagSpacingPx: 12,
      tags: [
        { text: 'AI',          keywords: ['artificial intelligence','machine learning'] },
        { text: 'Privacy',     keywords: ['encryption','vpn','secure messaging'] },
        { text: 'Travel',      keywords: ['flights','hotels','tourism'] },
        { text: 'Finance',     keywords: ['crypto','stocks','banking'] },
        { text: 'Health',      keywords: ['wellness','nutrition','fitness'] },
        { text: 'Gaming',      keywords: ['esports','pc gaming','consoles'] },
        { text: 'Education',   keywords: ['online courses','e‑learning','MOOC'] },
        { text: 'Environment', keywords: ['climate','renewable energy','sustainability'] }
      ]
    });
  </script>
</body>
</html>
CSS Styling
Copy shepherd.css into your project or embed the styles directly. The stylesheet defines the layout of the tag feed, individual tags, and the ad slot.
JavaScript Initialization
Call Shepherd.init() with a configuration object (see Configuration Options below). After initialization, Shepherd automatically observes tag visibility and swaps ads as the user scrolls.

Configuration Options
OptionTypeDefaultDescriptionfeedElementIdstringrequiredID of the element that will contain the tag feed.adSlotIdstringrequiredID of the element where the selected ad will be rendered.visibleTagCountnumber5Maximum number of tags considered “visible” for ad matching.tagSpacingPxnumber12Horizontal spacing (in pixels) between tags.tagsArray<{text:string, keywords:Array<string>}>requiredList of tags with human‑readable text and associated keywords used for ad targeting.
You can modify the visible count or spacing at runtime:
Shepherd.updateVisibleCount(8); // now consider up to 8 tags
Shepherd.updateSpacing(20);     // increase spacing to 20 px

Adding New Ad Providers

Extend the providerList array in shepherd.js with the identifier of your new provider.
Implement the real request logic inside fetchAdFromProvider(provider, keywords). Most networks expose a JavaScript SDK or a REST endpoint that accepts an array of keywords for targeting.
Return an object { html: '<div>…ad markup…</div>' }. Shepherd will inject the HTML directly into the ad slot.

// Example addition
const providerList = ['carbon', 'facebook', 'google', 'myNewProvider'];

async function fetchAdFromProvider(provider, keywords) {
  if (provider === 'myNewProvider') {
    // Replace with actual SDK call
    const response = await myNewProviderSDK.requestAd({ keywords });
    return { html: response.adHtml };
  }
  // existing logic...
}

Customization

Tag Appearance: Modify .shepherd-tag in the CSS to change colors, fonts, or add icons.
Active Tag Highlight: The .active class is toggled on tags that contributed to the current ad; style it as desired.
Ad Slot Size: Adjust the min-height in .shepherd-ad or apply your own layout constraints.


Development
Clone the repo and run a local static server for quick iteration:
git clone https://github.com/azzurro-tech/shepherd.git
cd shepherd
python -m http.server 8000   # or any static server of your choice
Open http://localhost:8000 in a browser to view changes live.

License
MIT License

Copyright (c) 2025 Azzurro Technology Inc

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.


Support & Contributions

Issues & Bugs: Open a GitHub issue describing the problem.
Feature Requests: Feel free to propose enhancements via issues or pull requests.
Contact: For questions, licensing clarifications, or partnership inquiries, email info@azzurro.tech.

Thank you for using Shepherd! Happy coding.