# UPI QR Studio — QA record and Node.js migration status

## Static website checks recorded before the build-tool migration

The generated HTML/CSS/JavaScript website was previously checked with the following results:

- 23 HTML documents checked, including the custom 404 page.
- 832 internal/local link occurrences checked.
- 175 local asset references checked.
- 334 fragment links checked.
- 0 missing local file paths and 0 missing fragment targets.
- 0 duplicate HTML IDs and 0 duplicate page titles.
- One shared header, footer, main landmark and H1 were present on each page.
- 11 CSS files parsed with no CSS syntax errors; the site references all 11.
- 7 browser JavaScript files passed `node --check`.
- 0 repeated paragraphs of 120 or more characters across detailed guide articles after the content pass.
- The static-site build produced the same HTML hashes across consecutive runs before the Python build tools were replaced.

These counts describe the static site at the time of that QA run. They are not a claim that the newly rewritten Node.js build has completed a full end-to-end build in this environment.

## Node.js migration checks run in this environment

- `node --check` passed for `tools/build-site.js`, `tools/fix-fragments.js`, `tools/guide-content.js`, `tools/check-site.js`, and `tools/preview.js`.
- `package.json`, `site-config.json` and `tools/build-data.json` parsed as valid JSON.
- The Python build files and `requirements.txt` have been removed from this package.
- Installing `cheerio` from npm timed out in this environment because package download access was unavailable. Consequently, `npm run build` and `npm run check` could not be executed here. Complete those commands after running `npm install` on a machine with npm registry access.
- A headless Chromium end-to-end run was not completed. Actual QR generation/download and mobile navigation must still be tested in a browser.

## Browser testing to perform after installation

1. From this project root, run `npm install`, then `npm run build`, then `npm run check`.
2. Run `npm run preview`; open the local URL shown by the server.
3. Generate a home-page QR code, download it, and confirm the exported image shows the UPI ID below the QR where intended.
4. Generate and download a QR on the dedicated QR-widget page.
5. Test the mobile menu button, Escape-key handling, outside-click handling and navigation links.
6. Test FAQ/search/filter interactions, contact email preparation, keyboard navigation, all guide links, and the 404 page.
7. Review browser developer tools for console errors and failed external requests. QR generation uses a third-party QRCode.js CDN unless you choose to host that dependency locally.

## Launch configuration intentionally left for the owner

- `site-config.json`: replace `siteUrl` with the real public URL and `contactEmail` with an address you monitor.
- Run `npm run build` after configuration changes.
- Keep `adsenseClientId` blank until your own AdSense account provides the publisher ID and you are ready to connect the site.
- Review the Privacy Policy when advertising is enabled; this package does not contain active AdSense code or a fabricated `ads.txt` record.
- Verify current UPI information with NPCI, bank and provider sources. Automated checks do not establish factual accuracy or guarantee AdSense approval.
