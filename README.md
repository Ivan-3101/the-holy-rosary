# The Holy Rosary

A website for praying the Catholic Rosary, bead by bead.

**Live:** https://the-holy-rosary.vercel.app

- **Pray** (`pray.html`): a guided Rosary with an interactive diagram of the beads. Today's mysteries are chosen automatically (Mon & Sat Joyful · Tue & Fri Sorrowful · Wed & Sun Glorious · Thu Luminous, with the customary Joyful on Sundays of Advent/Christmastide and Sorrowful on Sundays of Lent). Your place is saved, so you can stop and resume.
- **Prayers** (`prayers.html`): every prayer, in English and Latin. This includes the prayers after the five decades: the Hail, Holy Queen, the concluding prayer, the **Litany of the Blessed Virgin Mary (Loreto)**, We Fly to Thy Protection, St. Michael, the Memorare and the prayers for the Holy Father's intentions.
- **Mysteries** (`mysteries.html`): all 20 mysteries, each with Scripture (Douay-Rheims), a short meditation and its fruit.
- **How to Pray** (`how-to-pray.html`): a step-by-step guide with a numbered diagram.

Extras:
- Light and dark themes, adjustable text size, and English, Latin or side-by-side prayers.
- Works offline after the first visit and can be installed on a phone's home screen.
- Keeps the screen awake while you pray.

## Editing the prayers

All prayer texts and mysteries are in [`js/data.js`](js/data.js). Edit that one file and every page updates.

## Run it locally

It is a plain static site with no build step:

```bash
npx serve .
```

You can also just open `index.html` in a browser.

## Deploy

**Vercel**

This folder is already linked to the Vercel project `the-holy-rosary`. To publish changes:

```bash
npx vercel --prod     # from this folder (run `npx vercel login` first if asked)
```

Or push this folder to GitHub and import the repository at https://vercel.com/new. Each push then deploys automatically.

**Other free hosts.** Netlify (drag the folder onto https://app.netlify.com/drop), Cloudflare Pages and GitHub Pages all work as-is.

When you change files, bump `CACHE` in `sw.js` (for example `holy-rosary-v2`) so returning visitors get the new version offline too.

---

*Ad Iesum per Mariam.* Fonts: EB Garamond and Cormorant Garamond (SIL Open Font License, see `fonts/`).
