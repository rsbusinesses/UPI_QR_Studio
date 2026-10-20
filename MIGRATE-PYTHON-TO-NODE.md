# Migration guide: replace the Python build tools with Node.js

The website's **visitor-facing code remains HTML, CSS and browser JavaScript**. Node.js is used only when you develop the site and rebuild the static files. GitHub Pages does not execute the build tools after deployment.

## Replacements included in this package

| Remove / stop using | Use instead | What it does |
|---|---|---|
| `tools/build_site.py` | `tools/build-site.js` | Main build: generates the shared header/footer into each page, applies metadata, normalizes local references, and regenerates `robots.txt`, `sitemap.xml` and optional AdSense files. |
| `tools/fix_fragments.py` | `tools/fix-fragments.js` | Finds local links to sections, repairs missing IDs when a matching heading can be identified, and reduces long repeated paragraphs across guide articles. |
| `tools/guide_content.py` | `tools/guide-content.js` | Applies topic-specific summaries, checklists and aftercare wording. |
| `requirements.txt` | `package.json` | Declares the Node.js commands and the `cheerio` HTML-parser dependency. |

The text mappings are now in `tools/build-data.json`, so you can update many titles, summaries, guide notes and repeated checklist strings without editing the build algorithm itself.

## Step 1 — Install Node.js

Install Node.js 22 LTS (or Node.js 20.18.1 or later) on Windows. Open a new VS Code terminal and confirm both commands work:

```powershell
node --version
npm --version
```

If the commands are not recognized, close and reopen VS Code after installing Node.js.

## Step 2 — Open the correct project folder

Extract `UPI_QR_Studio_NodeJS_GitHub_Pages.zip` into a normal development folder. In VS Code, open the folder that directly contains `index.html`, `package.json`, `site-config.json` and `components/`.

Do not open only the `tools/` folder. Commands should run from the project root.

## Step 3 — Install the build dependency

In the VS Code terminal, run:

```powershell
npm install
```

The build tools use the `cheerio` HTML parser. This first-time install requires internet access. The downloaded package is placed in `node_modules/`, which is excluded from Git by `.gitignore` and should not be uploaded to the GitHub repository.

## Step 4 — Build and validate

Run these commands in order:

```powershell
npm run build
npm run check
npm run preview
```

- `npm run build` generates/updates the shared HTML and SEO/deployment files.
- `npm run check` checks pages, local links, anchors, metadata and shared page shell.
- `npm run preview` starts a local preview at `http://127.0.0.1:8000` by default. Open the printed URL in your browser and stop the server with `Ctrl+C`.

The checker cannot verify all factual UPI statements or fully substitute for browser testing. Manually test the QR generator, QR download, mobile navigation and browser console before publishing.

## Step 5 — Where to change common website settings

### Change the site's theme

Open `css/theme.css`. Edit the CSS custom properties near the top, especially the palette values for pale sage, sage, deep green and slate. The theme file is added to each page by the build script.

### Change the shared header or footer

Edit:

- `components/header.html`
- `components/footer.html`

Keep the `{{REL}}` token in internal link paths. The build tool replaces it with the correct relative prefix for root and nested pages. Then run `npm run build` and `npm run check`.

### Change contact details, public URL or AdSense ID

Edit `site-config.json`:

```json
{
  "siteName": "UPI QR Studio",
  "siteUrl": "https://YOUR-REAL-DOMAIN.example",
  "contactEmail": "YOUR-REAL-CONTACT-EMAIL@example.com",
  "adsenseClientId": ""
}
```

Replace the URL and email with real values. Keep `adsenseClientId` blank until your own AdSense account supplies a valid ID such as `ca-pub-` followed by 16 digits. Do not use another publisher's ID or a sample ID. After changing this configuration, rebuild and verify the generated canonical URLs, `robots.txt`, `sitemap.xml` and, when configured, `ads.txt`.

### Change page titles, meta descriptions or guide summaries

Open `tools/build-data.json`:

- `PAGE_TITLES`: page title text
- `DESCRIPTIONS`: meta descriptions for key pages
- `GUIDE_NOTES`: the practical-check panel shown on guide articles
- `SUMMARIES`: topic-specific replacement summaries keyed by article filename and section ID
- `REPEATED_ITEMS`: replacements for specific repeated checklist sentences
- `PANEL_AFTERCARE`: aftercare text for article panels

Keep JSON valid: use double quotes around keys and strings, escape any embedded double quotes as `\"`, and keep commas between properties. After changes, run `npm run build` followed by `npm run check`.

### Change normal article text or layout

Edit the relevant HTML file (for example, `pages/upi-faqs.html` or `pages/upi-guides/upi-autopay-and-recurring-payments.html`). Then rebuild and inspect the generated HTML diff, because some generated regions—header/footer, SEO tags and guide editorial notes—are rebuilt from shared sources.

### Change interactive behaviour

Edit browser-side scripts inside `js/`, not `tools/`. For example, `js/main.js` controls shared page interactions and `js/qr-generator.js` / `js/home-qr-generator.js` handle QR UI. Those browser scripts are delivered to website visitors; the `tools/*.js` files run only on your computer during the build/check process.

## Step 6 — Publish the generated static files

1. Run `npm run build` and `npm run check`.
2. Review changes in VS Code Source Control or with Git before committing.
3. Commit the generated HTML/CSS/JS and other website assets to the repository root.
4. Do not commit `node_modules/`.
5. Enable GitHub Pages under repository **Settings → Pages**.
6. Open the deployed HTTPS URL and test internal links, nested pages, mobile layout, QR generator/download and the 404 page.

GitHub Pages hosts the final static files; it does not need Python or Node.js to be installed on its hosting server. You only need Node.js locally to rebuild the static pages when shared templates or build data changes.

## Troubleshooting

- **`npm` is not recognized:** install Node.js, restart VS Code and open a new terminal.
- **`Cannot find module 'cheerio'`:** run `npm install` from the project root.
- **Build reports a placeholder URL/email:** replace the placeholders in `site-config.json` and rerun `npm run build`.
- **A header/footer change does not appear:** run `npm run build`; the component files are templates, not the final published page by themselves.
- **An anchor remains unresolved:** open the page/link reported by the build output and correct the `href`/target `id` manually. Heuristic repair cannot determine every intended link perfectly.
- **The QR code does not render:** check internet access for the QRCode.js CDN and inspect the browser console.
