# Agent guide

This is a one-page personal site: plain HTML, CSS and JS, no build step, no framework,
hosted free on GitHub Pages. Your usual job here is to **make it about a new person**.

## Files

| File | What it holds | Edit it? |
|---|---|---|
| `index.html` | All the words, links and the animated SVG figures | Yes, most of the work |
| `assets/config.js` | The hero map: places lived, routes between them, trips | Yes |
| `assets/style.css` | Colour tokens, layout, figure animation keyframes | Only the `:root` colours, usually |
| `assets/site.js` | Motion toggle, map drawing, story rewind, mobile menu | Rarely |
| `assets/world.png` | Land mask for the map (720x288, white = land) | No. Rebuild with `tools/make_world_mask.py` |
| `assets/favicon.svg` | Tab icon, also the logo in the nav | Optional |
| `docs/` | Screenshots and GIFs used only by `README.md` (not loaded by the site) | Replace with your own, or delete |

## Personalising: the order that works

1. **Collect the facts first.** Ask the person for (or read from files they point you to):
   a CV, a publication list with author order, project links, and the cities they lived in
   with years. Do not invent anything. If a fact is missing, leave the slot out or ask.
2. **`<head>`**: `<title>`, meta description, Open Graph tags, the JSON-LD `Person` block.
3. **Nav + hero** (`index.html`, top): name, one-line role in `.eyebrow`, a 3-line `h1`, a
   two-sentence `.hero-lede`, the CTA buttons, and the typed terminal line
   (`data-type` is the fixed part, `data-cycle` the comma-separated words it cycles through).
4. **Map** (`assets/config.js`): places with lat/lon, routes in order, the current home with
   `home: true`. Trips are optional.
5. **Ticker** (`.ticker-track`): domains or topics. Keep both `<ul>` copies identical; the second
   is what makes the loop seamless.
6. **Built at** (`.org-grid`): 4 or 8 cards (the grid is 4 across on desktop, 2 on phones).
7. **01 Story** (`.acts`): one `<article class="act">` per chapter, in time order. Keep an even
   number of cards so the 2-column grid has no gap. The last card (`.is-next`) is "now".
8. **02 Building** (`.builds`): products or projects, 3 across. A multiple of 3 fills the grid.
9. **03 Research** (`.metrics`, `.paper-grid`): numbers, then papers grouped into clusters.
   Delete this section if the person does not publish.
10. **04 Open source** (`.repo-grid`): repos, a multiple of 3.
11. **Footer**: the dot-matrix line is `data-lines` on `#dot-text` (`|` splits lines; keep it short),
    plus the `.dot-fallback` text and the links list. Then update `README.md` if the person wants their own wording.

## Story and product cards

Each card is the same anatomy:

```html
<article class="act" id="unique-id" style="--act:var(--cyan)" aria-labelledby="unique-id-title">
  <header class="act-head"><h3 id="unique-id-title">Short title</h3><span class="act-when">2021 · Place</span></header>
  <figure class="act-fig">
    <svg class="fig" viewBox="0 0 420 250" aria-hidden="true" focusable="false"> ... </svg>
  </figure>
  <div class="act-info">
    <p class="act-line">One or two sentences. <strong>The key result</strong> in bold.</p>
    <div class="artifacts"><a class="artifact" href="...">Paper name <em>Venue 2021</em> ↗</a></div>
  </div>
</article>
```

- Titles must fit on one line (they do not wrap, so paired cards stay aligned). About 24
  characters is the safe maximum.
- `--act` picks the card colour: `--cyan --violet --amber --lime --coral --pink --pulse`.
- Story figures use `viewBox="0 0 420 250"`; Building figures use `viewBox="0 0 360 200"`.

## Drawing a figure

Figures are hand-written inline SVG. Copy the closest existing one and change it. The
vocabulary (all in `style.css`, prefixed `.fig`):

- **Shapes:** `stroke` (thin grey line), `stroke-2` (fainter), `dash`, `dash-hi`, `dash-acc`
  (dashed, accent), `accent` (accent outline), `fill-accent`, `fill-dim/mid/hi` (grey fills),
  `panel` (dark box), `box` (black box), `body` (a person or object), `glow` (soft accent fill).
- **Text:** `<text>` is mono uppercase by default; add `acc` (accent), `hi` (white),
  `small`, `case` (no uppercase).
- **Motion classes:** `flow` (dashes march), `lane` (scrolls left; set `--p` to the pattern's
  period and `--d` to duration), `blink`, `ring` (expanding ring), `beat` (heartbeat), `breathe`,
  `spin`, `jitter`, `bar` / `vbar` (bars grow), `slide` (`--x`), `hop` (`--x`, `--y`), `scan`,
  `type`, `talk`, `on-a` / `on-b` (two alternating states), `alt-a` / `alt-b` (swap two texts),
  `step-a/b/c` (three labels light in turn), `pick` (one of three, set `--dl`).
- Anything that scales or rotates needs `class="tb"` (or `tb-l`, `tb-b`) so it transforms
  around its own centre / left / bottom.
- Packets along a path: `<rect ...><animateMotion dur="1.6s" repeatCount="indefinite"><mpath href="#path-id"/></animateMotion></rect>`.
  IDs must be unique across the whole page.
- **The resting frame must read on its own.** "Motion off" removes every CSS animation, so
  draw the default state as the informative one and let animation only modulate it.
- Do not use `<use>` for parts that need figure classes; inline the shapes instead.

## Rules

- **Facts only.** No invented numbers, awards, clients or dates. If someone is not first
  author, say "co-authored" or "with my lab", not "my paper".
- Keep text short: one or two sentences per card.
- No external images or trackers. The only external request is Google Fonts.
- Keep it working with JavaScript off (content shows; only motion and the map need JS).

## Check before you push

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

1. Desktop width: no overlapping labels inside figures; paired cards line up.
2. Phone width (390 px, browser dev tools device mode): no sideways scrolling, map labels clear
   of the headline.
3. Press "Motion off": every figure and the map still make sense when still.
4. `node --check assets/site.js assets/config.js` passes.
5. Open the browser console: **zero errors**. One runtime error stops every script after it
   (the map and footer lettering go blank), so this check matters more than it looks.

## Deploy

The repo must be named `<github-username>.github.io`. Push to `main`; GitHub Pages serves it at
`https://<github-username>.github.io/` within a minute or two. A custom domain goes in
Settings → Pages.
