# prasanthsasikumar.github.io

Personal site: XR and wearable AI research, and the products built on it at FlowsXR.

Plain static HTML, CSS and JS. No build step.

- `index.html` holds all content, including the animated SVG figure for each project.
- `assets/style.css` has the tokens, layout and figure animation keyframes.
- `assets/site.js` handles the motion on/off toggle (remembered per browser, follows
  reduced-motion by default), pausing figures while off screen, the story rewind, the
  mobile menu and the gaze/pulse hero canvas.

## Run locally

    python3 -m http.server 8000

## Deploy

Push to a GitHub repo named `prasanthsasikumar.github.io`, then enable Pages
(Settings > Pages > Deploy from branch > `main` / root). It serves at
https://prasanthsasikumar.github.io/.

## Adding a project

Copy an `<article class="act">` block in the Story or Building section, set `--act`
to one of the colour tokens, and draw the figure in a `viewBox="0 0 420 250"` SVG
(`0 0 360 200` for Building). Reuse the figure classes (`accent`, `dash`, `panel`,
`lane`, `blink`, `ring`, `step-a/b/c`...). Make the resting frame readable on its
own, because with motion off every animation is removed.
