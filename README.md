# Agrumea Farm — website concept

A responsive, static website for a Sicilian preserve maker, built as a warm-neutral
interpretation of the Agrumea Farm reference. No frameworks, no build step, no
external runtime dependencies.

## Run locally

From this folder:

```bash
python3 -m http.server 8123
```

Then open <http://127.0.0.1:8123>.

The site is plain HTML, CSS and JavaScript, so it can also be opened from any
static host. Deploy the contents of this folder as-is.

## Pages

- `index.html` — editorial home page, featured jars, story and visit teaser
- `pantry.html` — filterable collection of ten jars with accessible detail dialogs
- `production.html` — citrus and dried fruit, seasonality table and process
- `about.html` — family story, timeline and values
- `visit.html` — three grove experiences and practical information
- `contact.html` — contact details and a validated email hand-off form
- `privacy.html` — privacy and cookie note
- `404.html` — custom not-found page

## Frontend notes

- **Stable:** all pages are static; fonts, images and scripts are local. There are
  no third-party embeds, analytics, or runtime package dependencies.
- **Responsive:** tested from 320 px to 1920 px. The seasonality table and pantry
  filters have deliberate mobile layouts.
- **Accessible:** skip link, semantic landmarks, one `h1` per page, visible focus
  states, keyboard-friendly menu, native `<dialog>` focus trapping, form errors
  announced with `aria-live`, and zero axe-core WCAG 2.1 AA violations at the
  tested desktop and mobile viewports.
- **Motion:** reveal transitions and the rotating seal are disabled under
  `prefers-reduced-motion: reduce`.
- **Performance:** self-hosted variable fonts, WebP imagery with transparent
  product cut-outs, responsive `srcset` variants, eager loading only for the
  hero image, and lazy loading for everything below the fold. The home page
  transfers roughly 540 KB on a cold load in local testing.
- **No-JS fallback:** page content and navigation links are present in the HTML;
  the mobile menu and product filters are progressive enhancements.

## Replacing the demo content

- Photography comes from Agrumea Farm's public site and is included here for the
  concept/demo only. Replace it with licensed originals before commercial use.
- Fonts are [Fraunces](https://fonts.google.com/specimen/Fraunces) and
  [Manrope](https://fonts.google.com/specimen/Manrope), both under the SIL Open
  Font License. License texts are in `assets/fonts/`.
- The contact form does not send data to a server. It validates in the browser
  and opens the visitor's email app with a pre-filled message.
