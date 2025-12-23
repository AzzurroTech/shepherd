/**
 * Shepherd – Adjustable tag feed + contextual ad selector
 *
 * Public API:
 *   Shepherd.init(options)               // start the widget
 *   Shepherd.updateVisibleCount(n)       // change how many tags are shown
 *   Shepherd.updateSpacing(px)           // change spacing between tags
 *
 * Options:
 *   feedElementId   – ID of the element that will hold the tags
 *   adSlotId        – ID of the element where the ad will be rendered
 *   visibleTagCount – Number of tags that stay “visible” (used for ad matching)
 *   tagSpacingPx    – Horizontal gap between tags (CSS variable)
 *   tags            – Array of {text:string, keywords:Array<string>}
 *
 * The algorithm works like this:
 *   1️⃣ Render all tags in a horizontal scroll area.
 *   2️⃣ Keep track of the *currently visible* tags (intersection observer).
 *   3️⃣ Whenever the visible set changes, build a keyword pool from those tags.
 *   4️⃣ Query each ad provider (via fetchAdFromProvider) with that pool.
 *   5️⃣ Pick the first provider that returns a matching ad and render it.
 *
 * All network calls are async; the UI stays responsive.
 */

const Shepherd = (() => {
  // -------------------------------------------------------------------------
  // Private state
  // -------------------------------------------------------------------------
  let config = null;
  let feedEl = null;
  let adSlotEl = null;
  let observer = null;
  const providerList = ['carbon', 'facebook', 'google']; // extend as needed

  // -------------------------------------------------------------------------
  // Helper: create a DOM element for a tag
  // -------------------------------------------------------------------------
  function createTagElement(tag, index) {
    const el = document.createElement('div');
    el.className = 'shepherd-tag';
    el.dataset.idx = index;
    el.textContent = tag.text;
    return el;
  }

  // -------------------------------------------------------------------------
  // Render the whole tag list (once) – the visibility is handled later
  // -------------------------------------------------------------------------
  function renderTags() {
    feedEl.innerHTML = '';
    config.tags.forEach((t, i) => feedEl.appendChild(createTagElement(t, i)));
    // Apply spacing via CSS custom property
    feedEl.style.setProperty('--tag-spacing', `${config.tagSpacingPx}px`);
  }

  // -------------------------------------------------------------------------
  // Determine which tags are currently inside the viewport of the feed.
  // Uses IntersectionObserver for efficiency.
  // -------------------------------------------------------------------------
  function setupVisibilityObserver() {
    if (observer) observer.disconnect();

    const options = {
      root: feedEl,
      threshold: 0.5 // consider a tag visible when ≥50% of it is in view
    };

    observer = new IntersectionObserver(handleVisibilityChange, options);
    feedEl.querySelectorAll('.shepherd-tag').forEach(el => observer.observe(el));
  }

  // -------------------------------------------------------------------------
  // Callback when visibility of any tag changes
  // -------------------------------------------------------------------------
  function handleVisibilityChange(entries) {
    // Collect indices of tags that are now visible
    const visibleIdx = [];
    entries.forEach(entry => {
      const idx = parseInt(entry.target.dataset.idx, 10);
      if (entry.isIntersecting) visibleIdx.push(idx);
    });

    // Sort to keep order consistent
    visibleIdx.sort((a, b) => a - b);

    // Limit to the configured count (if there are more than needed)
    const trimmed = visibleIdx.slice(0, config.visibleTagCount);

    // Highlight active tags
    feedEl.querySelectorAll('.shepherd-tag').forEach(el => {
      el.classList.toggle('active', trimmed.includes(parseInt(el.dataset.idx, 10)));
    });

    // Build the keyword pool from the visible tags
    const keywordPool = trimmed.flatMap(i => config.tags[i].keywords);
    fetchAndRenderAd(keywordPool);
  }

  // -------------------------------------------------------------------------
  // Core ad‑selection routine
  // -------------------------------------------------------------------------
  async function fetchAndRenderAd(keywords) {
    // Guard against empty keyword sets
    if (!keywords.length) {
      adSlotEl.innerHTML = '<p>No relevant ad (no keywords visible).</p>';
      return;
    }

    // Try each provider in order until one returns a match
    for (const provider of providerList) {
      try {
        const ad = await fetchAdFromProvider(provider, keywords);
        if (ad && ad.html) {
          // Render the ad markup (trusted source!)
          adSlotEl.innerHTML = ad.html;
          return;
        }
      } catch (e) {
        console.warn(`Shepherd – provider ${provider} failed:`, e);
        // Continue to next provider
      }
    }

    // If none matched:
    adSlotEl.innerHTML = '<p>No suitable ad found for the current tags.</p>';
  }

  // -------------------------------------------------------------------------
  // Placeholder – replace with real SDK / HTTP call per provider
  // -------------------------------------------------------------------------
  async function fetchAdFromProvider(provider, keywords) {
    /**
     * Expected return shape:
     *   { html: '<div>…ad markup…</div>', metadata: {...} }
     *
     * For demo purposes we simulate a tiny “matching engine”.
     */
    // Simulated latency
    await new Promise(r => setTimeout(r, 150));

    // Very naive matching: if any keyword contains the provider name, return a dummy ad
    const match = keywords.some(k => k.toLowerCase().includes(provider));
    if (!match) return null;

    // Dummy ad HTML – in production you would embed the provider’s script tag
    const dummyAds = {
      carbon: `<a href="https://www.carbonads.com/" target="_blank">
                <img src="https://placehold.co/300x100?text=Carbon+Ad" alt="Carbon Ad">
              </a>`,
      facebook: `<div style="background:#4267B2;color:#fff;padding:10px;">
                  Facebook Audience Network placeholder
                 </div>`,
      google: `<div style="border:1px solid #ccc;padding:10px;">
                Google AdSense placeholder
               </div>`
    };
    return { html: dummyAds[provider] || '' };
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  return {
    /**
     * Initialise Shepherd with a configuration object.
     * @param {Object} opts
     */
    init(opts) {
      // Basic validation
      if (!opts.feedElementId || !opts.adSlotId || !Array.isArray(opts.tags)) {
        throw new Error('Shepherd.init – missing required options');
      }

      config = {
        feedElementId: opts.feedElementId,
        adSlotId: opts.adSlotId,
        visibleTagCount: opts.visibleTagCount ?? 5,
        tagSpacingPx: opts.tagSpacingPx ?? 12,
        tags: opts.tags
      };

      feedEl = document.getElementById(config.feedElementId);
      adSlotEl = document.getElementById(config.adSlotId);
      if (!feedEl || !adSlotEl) {
        throw new Error('Shepherd.init – could not locate feed or ad elements');
      }

      renderTags();
      setupVisibilityObserver();
    },

    /** Change how many tags are considered “visible” for ad matching */
    updateVisibleCount(newCount) {
      config.visibleTagCount = newCount;
      // Force a recompute based on current viewport
      const visibleEntries = [...feedEl.querySelectorAll('.shepherd-tag')]
        .filter(el => el.getBoundingClientRect().right <= feedEl.getBoundingClientRect().right);
      handleVisibilityChange(visibleEntries.map(el => ({
        target: el,
        isIntersecting: true
      })));
    },

    /** Adjust spacing between tags (in pixels) */
    updateSpacing(px) {
      config.tagSpacingPx = px;
      feedEl.style.setProperty('--tag-spacing', `${px}px`);
    }
  };
})();