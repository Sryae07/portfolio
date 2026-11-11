# Portfolio

Four case studies from things I actually run on my own laptop, plus notes from
building them.

Live: <https://sryae07.github.io/portfolio/>

## Pages

- `index.html` — what I do, and the four projects in one screen.
- `work.html` — one case study per project, written as problem / constraints /
  what I built / what broke / still broken.
- `notes.html` — eight practical notes on running local models and agents, with
  a keyword filter so a long page stays usable.
- `about.html` — who I am and how to reach me.

## How it is put together

- Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies,
  nothing to install to read it.
- `nav.html` + `nav.js` — the same navigation on all four pages, injected once.
  It marks the current page with `aria-current` and closes itself when focus
  leaves it.
- `notes.js` — filters the notes by keyword, searching both the visible text and
  a `data-keywords` attribute, and tells the user how many notes are left.
- `images/` — hand-written SVG hero, generated favicons and social preview.
- No storage, no accounts, no tracking: the filter runs entirely in the page.

## Why there is no backend

The brief asked for a site that does not depend on a server or a database, so
everything here is static. The only interactive parts — the menu and the note
filter — are a few lines of JavaScript that work with the page already loaded.
