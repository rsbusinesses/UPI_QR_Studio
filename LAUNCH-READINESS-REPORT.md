# Phase 8 — Google Search Console, AdSense and production launch readiness

Audit date: 8 November 2026  
Repository: `rsbusinesses/UPI_QR_Studio`  
Production branch: `main`  
Release candidate branch: `development`

## Executive decision

**Do not release to production yet.** The development branch is a validated release candidate, but live-domain/Pages configuration and Search Console indexing have not been verified. The production branch is materially behind and still contains conflicting deployment workflows and a legacy AdSense loader. AdSense site review and consent readiness are not confirmed. No merge, main-branch commit, production configuration change or deployment was performed in this phase.

## 1. Branch and CI evidence

| Item | Verified evidence |
|---|---|
| Development head | `c21a3ad5e51066226ddf7f83aa20eb99d25e6e04` |
| Main head | `184bcaf5fdccb6e7ee91453056558302bacc0d3b` |
| Compare | `main...development`: 26 commits ahead, 0 behind; 72 changed paths returned by GitHub compare |
| Development validation | [Run 42474540682 — success](https://github.com/rsbusinesses/UPI_QR_Studio/actions/runs/42474540682) |
| Latest main Pages deployment found | [Run 42186586044 — success](https://github.com/rsbusinesses/UPI_QR_Studio/actions/runs/42186586044), 6 November 2026 |
| Parallel legacy Pages runs | [Jekyll run 42186586051](https://github.com/rsbusinesses/UPI_QR_Studio/actions/runs/42186586051) and [static-content run 42186586097](https://github.com/rsbusinesses/UPI_QR_Studio/actions/runs/42186586097) also completed successfully against the same main commit |

The final development validation passed dependency installation and npm audit, JavaScript syntax, reproducible build, site validation, privacy/security, content, SEO, public-artifact packaging and the AdSense-specific checks. These checks validate repository output; they do not prove that a Google crawler or a human visitor can reach the production domain.

## 2. Domain, hosting and public URLs

### Development branch

- `site-config.json` sets `https://upiqrstudio.com` as the canonical site origin.
- `robots.txt` contains `User-agent: *`, `Allow: /` and `Sitemap: https://upiqrstudio.com/sitemap.xml`.
- The generated sitemap contains 22 intended indexable URLs on that origin and excludes `404.html`.
- The development deployment workflow is guarded to run only on `main`; it builds, validates and packages the public site to `dist/`.

### Current production branch

The current `main` source has not received the release-candidate work:

- `site-config.json` still sets `https://rsbusinesses0.github.io/UPI-QR-Website-Final/`.
- Its `robots.txt` and 22-entry `sitemap.xml` use that old GitHub Pages project URL, not `https://upiqrstudio.com`.
- A `CNAME` file is not present in the inspected root tree on either branch. The GitHub Pages settings API was not available through this audit connection, so a separately configured custom domain cannot be ruled out.
- Attempts to retrieve the public homepage, `robots.txt`, `sitemap.xml` and `ads.txt` through the web inspection environment did not return the live content. This is an inspection limitation, not proof that the website is down.

**Conclusion:** the custom domain is configured in development source but DNS, GitHub Pages custom-domain mapping, HTTPS certificate, HTTP-to-HTTPS redirect and live response codes are not verified. Confirm these manually in the domain DNS provider and GitHub **Settings → Pages** before release.

## 3. Google Search Console

### Connected property and available data

The connected Search Console reporting integration exposes the property `sc-domain:upiqrstudio.com`. That shows the reporting connection can read data for the property. It does not expose the user's ownership status or permission role.

Data retrieved on 8 November 2026:

| Report | Result |
|---|---|
| Sitemaps | One empty/summary row; no sitemap path; 0 submitted URLs, 0 errors, 0 warnings; last-submitted and last-downloaded timestamps are null |
| Search Analytics, last 28 days | One returned row: homepage, 6 November 2026, 1 impression, 0 clicks |
| URL Inspection / Page indexing | Not exposed by this connector |
| Manual Actions / Security Issues / HTTPS / Core Web Vitals | Not exposed by this connector |
| Sitemap submission / Request indexing write action | Not supported; Search Console connector lists no write actions |

The sitemap dataset does **not** currently show a successfully submitted sitemap. The single Search Analytics row is not proof that the homepage or all 22 public pages are indexed.

### Manual Search Console actions

1. Open [Google Search Console](https://search.google.com/search-console/) and select the existing `upiqrstudio.com` Domain property.
2. Open **Settings → Ownership verification**. Confirm that your Google account is a verified owner. If not, add the exact DNS TXT record supplied by Search Console at your domain DNS provider, then return to Search Console and click **Verify**. Do not invent a token.
3. Do not confuse the AdSense `google-adsense-account` meta tag in development with Search Console's `google-site-verification` meta tag. The former is for AdSense. A Domain property must use DNS verification.
4. After the custom-domain version has been deployed and `https://upiqrstudio.com/sitemap.xml` opens publicly, submit `sitemap.xml` under **Indexing → Sitemaps**. Record the status, last read and discovered URL count.
5. Use URL Inspection and **Test Live URL** for the homepage, QR widget, a long-form UPI guide, FAQs and legal pages. Check successful fetch, indexing allowed, rendered content and Google-selected canonical. Request indexing only for important URLs that pass the live test.
6. Review **Page indexing**, **HTTPS**, **Manual actions**, **Security issues** and **Core Web Vitals**. None of these report states could be verified in this audit.

Google's Sitemaps report requires owner permissions for submission and a publicly accessible sitemap. A submitted sitemap is a discovery signal, not a guarantee that Google crawls or indexes each URL. See the official [Sitemaps report](https://support.google.com/webmasters/answer/7451001), [ownership verification](https://support.google.com/webmasters/answer/9008080) and [URL Inspection](https://support.google.com/webmasters/answer/9012289) instructions.

## 4. Content, navigation and legal readiness

### Positive source evidence

The development audit covers 23 HTML files (22 indexable pages and a noindex 404), two browser-based QR tools, 159 FAQ entries, eight illustrative provider listings, a Safety Center and nine detailed UPI guides. Six long-form guides received topic-specific editorial rewrites. Automated content validation passed. The tools describe format validation and local QR generation, not bank verification or payment processing.

This is encouraging source-level evidence of useful content and distinct page purposes, but it is not a plagiarism audit, legal opinion, guarantee of Google policy compliance or an AdSense approval prediction. Verify time-sensitive UPI claims against current NPCI, RBI, bank and provider sources before publication.

### Privacy and terms

The development Privacy Policy accurately describes the reviewed build: QR fields are processed in the browser; GitHub Pages hosting logs visitor IP addresses for security; AdSense is planned but not serving; and no CMP is currently implemented. The Terms page also describes ads as planned rather than active.

The Terms remain a general draft requiring qualified Indian legal review. The legal owner/operator name, registration status, public postal address and other business details have not been independently supplied or verified; none has been invented. Confirm the public contact email and review all legal declarations personally before the AdSense application.

Manual responsive-browser testing, real QR scanning/download testing, accessibility review (for example, axe/WCAG) and Lighthouse performance testing remain separate from the successful CI run.

Google's current AdSense eligibility guidance requires the publisher's own unique, high-quality content and compliance with Program policies. Google's site-readiness guidance identifies site reachability, sufficient useful content, user experience/navigation and policy issues as review factors. See [AdSense eligibility](https://support.google.com/adsense/answer/9724) and [what to do when a site is not ready](https://support.google.com/adsense/answer/12176698).

## 5. AdSense configuration and application status

### Development configuration

The owner-supplied values are configured centrally:

- Publisher ID: `ca-pub-6680219748778164`.
- Homepage-only `google-adsense-account` verification meta tag is enabled.
- `ads.txt` contains exactly: `google.com, pub-6680219748778164, DIRECT, f08c47fec0942fa0`.
- Publisher and seller-record verification flags are based on the owner's supplied account snippet and representation. This audit did not independently sign in to AdSense.
- The build packages the verified supplied `ads.txt` record and validates it against the config.

### Serving gate remains disabled

These values remain false/disabled:

- `adsenseSiteReviewApproved: false`
- `adsenseConsentConfigurationVerified: false`
- `adsenseActivationAuthorized: false`
- `adsenseMode: "disabled"`

No AdSense loader or ad-unit slot is generated in the development build. The prepared allowlist is limited to nine long-form editorial pages; QR tools, navigation, legal and safety pages remain blocked.

### Production-branch discrepancy

The current `main/index.html` contains a hard-coded AdSense loader for the supplied publisher ID on the homepage. At the same time, `main/site-config.json` has a blank publisher ID and there is no root `ads.txt` file on `main`. The current main Privacy Policy says AdSense is planned, not active. This is an inconsistent, un-gated production-source state and must be reconciled before launch. The live ad-serving/approval state is unknown; this report does not claim that ads are actually appearing.

The AdSense account itself is not connected to the available tools. The actual application submission state, site status (`Requires review` / `Ready`), ads.txt crawler status, Policy Center findings, payments/identity/tax verification and approval status are therefore **not verified**.

### Consent dependency

No CMP is deployed in development. Google requires a Google-certified CMP integrated with IAB TCF when publishers serve personalized ads to visitors in the EEA, UK or Switzerland. Other applicable privacy/consent requirements also depend on visitor locations and ad products. Select, configure and test the actual CMP and its rejection, customization and withdrawal flows; update the Privacy Policy to describe the real configuration before activating ads. See Google's [publisher CMP requirements](https://support.google.com/adsense/answer/13554116).

### Owner actions in AdSense

1. Sign in to the AdSense account, open **Sites**, and confirm `upiqrstudio.com` is listed under the correct account.
2. Confirm the homepage verification method is detected after production deployment.
3. Confirm the public `/ads.txt` record appears and AdSense reports **Authorized** (or the documented status applicable to the account). Use **Check for updates** if needed.
4. Read the actual site status, Policy Center and any account setup/identity/payment prompts.
5. Request site review only when the production site and required setup are complete. Personally review and submit any legal, business, identity, tax, address, payment or age declarations; this repository cannot supply or verify them.
6. Do not enable the ad loader until Google shows **Ready**, the real consent/privacy setup is complete, and the owner explicitly authorizes the release.

Google explains site approval and ads.txt statuses in [Check the status of your AdSense sites](https://support.google.com/adsense/answer/12170222) and how to publish the exact account seller record in its [ads.txt guide](https://support.google.com/adsense/answer/12171612). A site is not approved merely because its publisher ID or seller record is present.

## 6. Production deployment and release protection

No action was taken on `main`, no pull request was merged, no deployment configuration was changed and no production deployment was triggered by this phase.

The current `main` branch still has three workflows that deploy on pushes to `main`: the custom UPI QR Studio workflow, an old Jekyll Pages workflow and an old static-content Pages workflow. The latter uploads the entire repository. The development branch removes the two legacy workflows and updates the remaining workflow to build, validate and publish the least-privilege `dist/` artifact, with a main-only guard. This reduces the risk of competing Pages deployments and publishing development tooling.

### Promotion package

- Source branch: `development`
- Candidate commit at audit start: `c21a3ad5e51066226ddf7f83aa20eb99d25e6e04`
- Production branch (unchanged): `main` at `184bcaf5fdccb6e7ee91453056558302bacc0d3b`
- Change set relative to main: 26 commits ahead and 72 changed paths in GitHub compare
- Required production action: after the owner verifies domain mapping, Search Console and AdSense tasks, open and review a pull request from `development` to `main`. Merge only with the owner's explicit approval. The push to `main` will trigger the main-only Pages workflow.

### Post-deployment verification

In an incognito browser, verify:
- `https://upiqrstudio.com/` loads over HTTPS.
- `/robots.txt` points to `https://upiqrstudio.com/sitemap.xml`.
- `/sitemap.xml` returns valid XML with the 22 intended URLs, all on the custom domain.
- `/ads.txt` displays the exact supplied seller record.
- Homepage source contains the AdSense account meta tag.
- No AdSense loader appears while the serving gate remains disabled.
- QR tools, guides, FAQ, contact, privacy and terms pages load; internal links, downloads and mobile navigation work.

Then complete Search Console URL inspection and sitemap verification and AdSense site/ads.txt status checks.

### Rollback approach

Record the production SHA immediately before the owner-approved release. If the deployment introduces a regression, revert the promotion merge with a normal Git revert commit (avoid force-pushing or resetting shared production history) and let the main-only deployment workflow republish the prior source. Recheck the homepage, canonical host, robots, sitemap and ads.txt after rollback.

**Rollback caveat:** the current production `main` snapshot contains the legacy hard-coded AdSense homepage loader and no ads.txt. Rolling back to it restores that state. Do not use code rollback as an advertising kill switch; separately disable Auto ads in AdSense and remove/disable any serving code through an owner-approved change if advertising must be stopped immediately.

## 7. Final status matrix

| Area | Status |
|---|---|
| Phase 1 custom-domain/DNS/Pages configuration | **Not verified**; development config is correct, production config is stale and live Pages settings/DNS/TLS were not accessible |
| Technical SEO in development | **Automated checks passed**; 22 canonical URLs, robots and sitemap generated |
| Live site accessibility | **Not independently verified** by the web inspection environment |
| Search Console property connection | **Connected for reporting** as `sc-domain:upiqrstudio.com` |
| Search Console ownership | **Not confirmed** |
| Sitemap submission/processing | **No populated submission reported** by the connected data source |
| URL indexing | **Unknown**; no URL Inspection/Page indexing report available |
| Content quality | **Source audit completed; automated content check passed**; ongoing factual review and manual QA remain |
| Privacy and terms | **Present and internally consistent in development**; Terms require legal review |
| Publisher ID | **Configured from owner-supplied account code**; not independently account-authenticated |
| ads.txt | **Exact record configured and CI-checked in development**; missing from main and live status unknown |
| Consent/CMP | **Not implemented or verified** |
| AdSense application | **Submission state unknown**; no AdSense account connection |
| AdSense approval / Ready status | **Unknown; not claimed** |
| Ad serving in development | **Disabled** |
| Ad serving on production | **Unknown; legacy homepage loader present in main source** |
| Development QA | **Passed** |
| Production release | **Not performed; owner control preserved** |

**Overall:** the development branch is a validated technical candidate, not yet a verified production launch. The blocking items are production-origin/domain alignment, Pages workflow consolidation via owner-approved release, live public endpoint verification, Search Console ownership/sitemap/indexing checks, AdSense account review/approval, consent implementation and owner legal declarations.
