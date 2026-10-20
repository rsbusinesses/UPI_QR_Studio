# UPI QR Studio — GitHub Pages Website

This is a static HTML/CSS/JavaScript website designed for GitHub Pages. The website itself does not need Python, PHP, a database, or a server-side runtime. Node.js is used only for optional local build/QA tools that generate the static pages before publication.

## Requirements

- Node.js **20.18.1 or newer** (Node.js 22 LTS is recommended).
- Internet access the first time you run `npm install`, so npm can download the `cheerio` HTML parser used by the build tools.
- VS Code or another editor.

Check your installation in a terminal:

```powershell
node --version
npm --version
```

## First-time setup

Open the website's root folder in VS Code. The root folder is the one containing `index.html` and `package.json`. In VS Code, select **Terminal → New Terminal**, then run:

```powershell
npm install
npm run build
npm run check
npm run preview
```

Open the local preview URL printed by the last command (by default `http://127.0.0.1:8000`). Stop the preview server with **Ctrl+C**.

The build step writes the final static HTML pages and updates the shared header/footer, metadata, link paths, guide content, `robots.txt`, `sitemap.xml`, and optional AdSense files. `npm run check` checks internal links, anchors, common document structure and local assets. `npm run preview` serves the generated static files locally; GitHub Pages is the production host.

## Centralized edits

- **Theme colours, fonts, spacing, radii and content width:** edit the CSS variables near the top of `css/theme.css`.
- **Shared header:** edit `components/header.html`.
- **Shared footer:** edit `components/footer.html`.
- **Contact email, public site URL and optional AdSense publisher client ID:** edit `site-config.json`.
- **Shared browser interactions:** edit `js/main.js`.
- **QR generator behaviour:** edit the relevant browser files in `js/`, especially `js/home-qr-generator.js` and `js/qr-generator.js`.
- **Page-specific text and sections:** edit the relevant HTML file in the root or `pages/` folder.
- **Page titles and SEO descriptions:** update `PAGE_TITLES` and `DESCRIPTIONS` in `tools/build-data.json`.
- **Guide summary/checklist wording:** update `SUMMARIES`, `REPEATED_ITEMS`, `PANEL_AFTERCARE`, or `GUIDE_NOTES` in `tools/build-data.json`.

After changing a shared component, SEO configuration, or build-data entry, run:

```powershell
npm run build
npm run check
```

Then refresh the preview. The builder updates the generated HTML, so review your changes with version control before committing. Keep custom page-specific HTML outside the shared templates and avoid manually changing generated components on each page because the next build regenerates them from the source templates.

## Node.js build tools (Python replacements)

The previous Python build scripts have been replaced:

| Previous Python file | Node.js replacement | Purpose |
|---|---|---|
| `tools/build_site.py` | `tools/build-site.js` | Main static-site build: shared shell, metadata, paths, sitemap, robots file and optional AdSense setup. |
| `tools/fix_fragments.py` | `tools/fix-fragments.js` | Repairs resolvable internal section anchors and reduces duplicated long guide paragraphs. |
| `tools/guide_content.py` | `tools/guide-content.js` | Applies topic-specific summaries, checklist wording and aftercare text. |

Their text mappings are stored in `tools/build-data.json`. `package.json` defines the commands. Python and `requirements.txt` are no longer required by this project.

## Configure the public site URL

After creating your GitHub repository, update `siteUrl` in `site-config.json`. A GitHub Pages project site typically uses `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY`; a custom domain uses the HTTPS origin you mapped to GitHub Pages. Run `npm run build` afterward so canonical URLs, `robots.txt`, and `sitemap.xml` use the configured public URL.

Do not publish with a placeholder hostname. For AdSense, confirm the current eligibility rules in your own account. Google's signup guidance has specific site URL requirements, and a GitHub Pages project URL contains a repository path; a custom domain you own is the clearer long-term option for monetization. See [Google's URL rules](https://support.google.com/adsense/answer/2784438) and [site readiness guidance](https://support.google.com/adsense/answer/7299563).

## GitHub Pages publishing

1. Create a GitHub repository.
2. Run `npm install`, `npm run build`, and `npm run check` locally.
3. Upload/commit the **contents of this folder**, not an additional wrapper directory, so `index.html` is at the repository root.
4. Do **not** commit `node_modules/`; it is excluded by `.gitignore`. Commit the resulting static HTML and the rest of the site.
5. Open **Settings → Pages** and choose the `main` branch and `/ (root)` as the publishing source, or configure the source you use consistently.
6. Wait for deployment and check the public HTTPS URL. Test the homepage, every page in `pages/`, the nested guide articles, the 404 page, and QR interactions.
7. Add the real site to Google Search Console and submit the generated sitemap after verifying its absolute URLs.

GitHub Pages does not execute `tools/*.js` after deployment. It hosts the HTML/CSS/JavaScript files generated locally. The `.nojekyll` file is included because the generated site is plain static HTML.

## Local testing checklist

- Test home QR generation, preview and download, including whether the UPI ID appears beneath the downloaded QR where intended.
- Test the QR Widget page, search/filter controls, FAQ accordions, mobile menu, mailto/contact links and all internal links.
- Test at desktop and mobile widths; review browser console and network errors.
- QR generation uses QRCode.js from a CDN, so the library requires a working internet connection unless you choose to vendor the library locally.
- The contact route opens the visitor's email application. It does not send or store messages on a server.

## AdSense notes

- Keep `adsenseClientId` blank until you have the real `ca-pub-` ID supplied by your own AdSense account.
- When configured with a valid ID, the build tool inserts Google's official loader and generates the corresponding `ads.txt` file. Confirm the public `/ads.txt` URL after deployment.
- Read `ADSENSE-LAUNCH-CHECKLIST.md` before submitting. Technical setup cannot guarantee AdSense approval or revenue.
- Ensure the live Privacy Policy accurately describes any advertising, analytics, cookies, forms or third-party services actually enabled.

## Limitations and editorial responsibility

- The QR tool creates a `upi://pay` URI. It does not confirm the UPI ID owner's identity or prove payment succeeded. Confirm the payee and amount in the payment application.
- The site is independent educational information, not a bank, payment app, or official NPCI website.
- Verify UPI limits, eligibility, product details and grievance processes against current official sources and relevant banks/apps before publication and periodically thereafter.
- Review every guide for correctness, originality, clarity and usefulness; a build checker cannot certify factual accuracy or guarantee search rankings or AdSense approval.
