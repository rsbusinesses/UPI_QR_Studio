# UPI QR Studio — Phase 10 independent final audit and handover

Audit date: 8 November 2026  
Repository: rsbusinesses/UPI_QR_Studio  
Production branch: main  
Maintenance / release-candidate branch: development

## 1. Overall project status

**Assessment: Released through the GitHub Pages workflow; not independently verified as reachable and functioning on the live custom domain. The current development branch is ready for owner review, not automatic promotion.**

GitHub confirms that PR #2 merged the principal release work into main, and the latest Pages workflow completed successfully for main commit c6e975cc1b3cb5146d43f2cdc118bce03c7c9f0a on 8 November 2026 (deployment run 42475996585). This proves the GitHub Pages workflow completed, not that public DNS, TLS, live page loading, browser rendering or Google indexing has been independently verified.

During this Phase 10 review:
- No commit was made to main.
- No merge or deployment was performed.
- Low-risk corrections were committed to development only.
- The production branch head was rechecked and remained c6e975cc1b3cb5146d43f2cdc118bce03c7c9f0a.

The project must not be described as independently verified, indexed, AdSense-approved or monetized. The owner still needs to complete external-service and manual validation.

## 2. Completed development work and commit history

| Workstream | Key commits / evidence | Result |
|---|---|---|
| Repository/build/QA architecture | d429afa196, 8fed7c4e48 | Node build tools, static checks, least-privilege packaging and repository audit |
| Technical SEO | 978cc21c4, 757dd5bde3, e64a470d00 | Canonicals, metadata, structured data, sitemap/robots generation and SEO validation |
| Content and QR guidance | 53c37c1315, b8a63e5143, b1c20c0ea5 | QR limitations clarified, six guides rewritten, content regression checks |
| Privacy/legal/security | 6a476dfe0e, e41344c8ed | Local QRCode.js asset, MIT license, privacy disclosures and ad gate |
| Gated AdSense setup | 857ae9bf18, bf914075a8, c21a3ad5e5 | Central publisher configuration, owner-supplied ID and seller record, separate approval/consent/activation gates |
| Production promotion | PR #2 merged at c32c407a23; robots commit c6e975cc1b | Release work promoted; Pages deployment succeeded |
| Workflow runtime maintenance | b2a37a418d, 2697f66d26 | Current Node 24-compatible GitHub Actions releases |
| Phase 10 artifact correction | ee303aebf51bb8185fd1a9e45c60c0281a55163c | Pages artifact explicitly includes .nojekyll; package guard rejects other hidden paths |

### Phase 10 corrections

1. **Pages artifact hidden-file handling:** GitHub Pages artifact uploads exclude hidden files by default. The development workflow now opts into hidden-file upload, while tools/package-site.js allows only .nojekyll and rejects any other hidden path in the public artifact.
2. **Privacy Policy date metadata:** corrected the machine-readable date from 2026-10-19 to 2026-11-08 to match the visible 8 November 2026 date.
3. **Documentation currency:** Phase 8 and Phase 9 reports are explicitly marked historical. The Search Console guide now reflects the post-merge main branch and latest reporting results.

## 3. Website quality — independent findings

### 3.1 Repository structure and maintainability

The project is a static site with HTML pages, shared components, CSS, browser JavaScript, local QRCode.js, Node build/validation tools, a package lockfile and GitHub Actions workflows. The build excludes tooling, templates, docs and package configuration from the public dist artifact.

The project has one direct npm dependency, Cheerio. The lockfile pins the resolved dependency graph. There is no application backend, database or server-side QR-processing endpoint in this repository.

### 3.2 Development and production branch safety

- main is the production deployment branch.
- development is the maintenance/release-candidate branch.
- The production Pages workflow contains a main-only guard.
- The latest deployment was for main at c6e975cc1b3cb5146d43f2cdc118bce03c7c9f0a.
- Phase 10 changes remain on development and have not been merged.
- No Phase 10 operation modified main.

### 3.3 Domain and GitHub Pages

Production source configuration uses https://upiqrstudio.com. The main branch contains the matching robots.txt, 22-entry sitemap and ads.txt, and its GitHub Pages build/deploy run succeeded.

**Not independently verified:** DNS records, custom-domain mapping in GitHub Settings → Pages, TLS certificate, redirect behavior and live HTTP status. No root CNAME file was found. That alone does not prove custom-domain mapping is absent; the GitHub Pages setting is authoritative. Live HTTP requests from this audit environment could not be completed because external-domain resolution was unavailable.

### 3.4 Core QR generation functionality

Source inspection confirms two distinct browser-based tools:

- **Homepage generator:** accepts a full UPI ID, optional payee name, optional INR amount and optional note; validates basic input formats; creates a upi://pay URI; renders QRCode.js output; and offers a labelled PNG download.
- **Standalone QR widget:** accepts the username and provider handle separately; combines them into a lower-case UPI ID; encodes the payee-address (pa) parameter only; and offers a PNG download with the UPI ID label.

Both use the locally bundled QRCode.js library. Neither verifies that a UPI ID exists, verifies account ownership, initiates a payment or confirms receipt of money.

**Not independently verified:** real scanner compatibility, downloaded PNG appearance/print quality, device/browser behavior and manual end-to-end operation. Automated checks are primarily static validation, not browser automation.

### 3.5 Responsive design and accessibility

Source contains responsive breakpoints for narrow, tablet and landscape layouts, reduced-motion styles and focus styling. The static site checker validates form-control accessible names, button names, image alt attributes, duplicate IDs, headings, landmarks and internal links.

Automated source checks do not constitute a full WCAG 2.2 audit. No live screen-reader test, keyboard-only user test, contrast measurement, axe scan, Lighthouse run or mobile visual inspection was completed in this audit.

### 3.6 Technical SEO

The current generated site has:
- 22 indexable pages with self-referencing HTTPS canonicals;
- 22 sitemap URL entries on the custom-domain origin;
- matching Open Graph URLs;
- homepage WebSite JSON-LD and BreadcrumbList structured data on content pages;
- one noindex 404 page excluded from the sitemap;
- a root robots.txt that permits crawling and points at the sitemap.

The robots.txt and sitemap are source/build evidence. Their live availability and Search Console processing remain unverified. A sitemap submission does not guarantee crawling or indexing.

### 3.7 Content quality and accuracy

The content audit covers 23 HTML documents (22 intended indexable pages plus the custom 404), two QR tools, 159 FAQ entries, eight illustrative provider listings, a Safety Center and nine detailed guides. Six guide pages received editorial rewrites to remove templated keyword copy. The content checker passed.

The audit is not a plagiarism check or a guarantee of AdSense policy acceptance. Payment rules, transaction limits, UPI provider details and external destinations can change; the owner should periodically review them against NPCI, RBI, bank and provider sources.

### 3.8 Privacy and transparency

The Privacy Policy reflects the reviewed source behavior:
- QR form fields are handled in the visitor's browser and are not sent to a UPI QR Studio application endpoint by the QR tools.
- GitHub Pages logs visitor IP addresses for security purposes.
- The QRCode.js library is hosted locally.
- The contact flow prepares a mailto message; the operator receives it only if the visitor sends it.
- The reviewed application scripts do not use cookies, localStorage, sessionStorage, IndexedDB, analytics SDKs or tracking pixels.
- AdSense is configured but the ad loader is gated off.

Contact-mailbox retention and access controls remain owner responsibilities. This source review cannot inspect GitHub's internal hosting logs or the mailbox provider's retention behavior.

### 3.9 Legal and informational pages

About, Contact, Privacy, Terms, Safety Center and FAQ pages are present. The Terms remain a general website draft: liability, governing-law and dispute provisions need qualified Indian legal review. No legal operator identity, company registration, postal address, tax details or professional credentials have been invented.

The owner should confirm that rsbusinesses0@gmail.com is the intended public contact address and provide any legal entity details only after deciding what should be publicly disclosed.

### 3.10 Security and dependencies

The reviewed application JavaScript contains no detected calls to common network APIs, persistent browser storage, cookie access or unsafe HTML injection APIs. QRCode.js is bundled with its MIT license. The latest development CI ran npm audit --audit-level=high and reported **0 vulnerabilities**.

The build logs reported a deprecated transitive whatwg-encoding@3.1.1 notice, and earlier logs included Node deprecation notices from the dependency stack. These are maintenance warnings, not evidence of an exploitable defect. Do not update dependencies speculatively; test any replacement in development.

### 3.11 AdSense integration, ads.txt and consent

The owner-supplied publisher ID is configured as ca-pub-6680219748778164. The owner-supplied seller record is:

google.com, pub-6680219748778164, DIRECT, f08c47fec0942fa0

The build validates the exact record and publisher match. The homepage-only AdSense ownership meta tag is added by the build configuration. The ad loader remains disabled because:
- adsenseSiteReviewApproved = false
- adsenseConsentConfigurationVerified = false
- adsenseActivationAuthorized = false
- adsenseMode = disabled

No manual ad slots are configured. The intended Auto ads allowlist contains nine long-form guide pages; home, QR tools, navigation, legal, safety and utility pages are excluded.

The publisher verification and ads.txt verification flags are based on the account details supplied by the owner. The AdSense account was not connected and these details were not independently authenticated against Google. The live /ads.txt endpoint and Google crawler status are not independently verified.

No CMP is currently deployed. For personalized publisher ads served to visitors in the EEA, UK and Switzerland, Google requires a Google-certified CMP integrated with IAB TCF. Other consent obligations depend on actual audience locations and advertising products. CMP certification alone does not prove legal compliance.

### 3.12 Search Console

The connected reporting integration exposes sc-domain:upiqrstudio.com, but does not expose ownership role/status or write actions. The latest last-28-day Analytics read returned no rows. The Sitemaps dataset returned an empty/summary row with no path, 0 submitted URLs and null last-submitted/last-downloaded timestamps. An earlier read returned one homepage impression for 6 November 2026; the subsequent no-row read is not proof of zero traffic.

No proof of DNS ownership verification, successful sitemap processing, indexed URLs, Manual Actions status or Security Issues status was available. The owner must perform those checks in Search Console.

### 3.13 Build and deployment reliability

The production GitHub Pages workflow successfully built and deployed main commit c6e975cc1b3cb5146d43f2cdc118bce03c7c9f0a. It runs build, site/content/SEO/AdSense checks, packages the public artifact and deploys it.

The Phase 10 include-hidden-files and .nojekyll package-guard correction is only on development; main has not received it. This change must be promoted through the normal owner-approved PR before it can affect a later production deployment.

### 3.14 Testing coverage

Latest Phase 10 development run [42481988758 — success](https://github.com/rsbusinesses/UPI_QR_Studio/actions/runs/42481988758) passed:
- npm install and npm audit (0 vulnerabilities);
- JavaScript syntax checks;
- reproducible build;
- website validation;
- privacy/security checks;
- content checks;
- SEO checks;
- public artifact packaging and hidden-file guard;
- AdSense loader/allowlist/ads.txt checks.

Recorded site-check counts: 23 HTML pages; 827 local link references; 182 local asset references; 312 fragment links; 0 errors and 0 warnings. SEO: 22 indexable pages, 22 canonicals, 22 sitemap URLs and 22 JSON-LD blocks, with 0 errors and 0 warnings. Package: 23 HTML pages and 48 public files.

No unit-test framework, browser automation suite, QR scanning tests, cross-browser tests, visual regression, live performance run or independent accessibility conformance audit is present.

### 3.15 Documentation and handover

The repository contains README, repository audit, technical SEO audit, content audit, legal readiness, AdSense launch checklist, Search Console setup, launch readiness and maintenance reports. Phase 8/9 reports are historical snapshots and are marked as such. This Phase 10 report is the current consolidated handover.

## 4. Verified status matrix

| Category | Status | Evidence / limitation |
|---|---|---|
| Repository and maintainability | **Implemented and CI-checked** | Static site, Node build, small dependency set, custom validators |
| Branch safety | **Verified** | main unchanged in this audit; development contains pending improvements |
| Domain / Pages | **Partially verified** | GitHub deployment successful; DNS, Pages custom-domain setting and live HTTPS unverified |
| QR features | **Implemented; manual behavior unverified** | Source logic inspected; no scanner/device testing |
| Responsive design | **Implemented; visual QA pending** | Responsive CSS and breakpoints present; no live device review |
| Accessibility | **Partially checked** | Static accessible-name/alt/landmark checks; no WCAG/axe/screen-reader audit |
| Technical SEO | **Implemented and CI-checked** | 22 canonicals, sitemap, robots, metadata, structured data |
| Content quality | **Source-audited and CI-checked** | 159 FAQs, nine detailed guides, eight provider listings; periodic factual review needed |
| Privacy | **Source-audited; owner obligations remain** | Browser-local QR processing; GitHub host logs and contact mailbox disclosures |
| Legal pages | **Present; legal review pending** | Terms remain a general draft and need qualified Indian counsel review |
| Security | **Automated checks passed** | no detected unsafe app JS APIs; static app; external host and platform controls not fully tested |
| Dependencies | **npm audit passed** | 0 vulnerabilities; transitive deprecation warning remains |
| AdSense integration | **Configured but disabled** | Publisher ID supplied; account approval not authenticated |
| ads.txt | **Configured in repo; live crawler status unknown** | exact seller line CI-checked; production endpoint not fetched |
| Consent | **Not implemented** | no CMP or verified consent flow |
| Search Console | **Connected read-only; incomplete** | property data access exists; ownership/indexing/sitemap submission not confirmed |
| Build/deploy | **GitHub workflow passed** | deployed main workflow successful; Phase 10 hidden-file fix awaits promotion |
| Test coverage | **Static automated checks pass** | no browser automation/manual functional test evidence |
| Documentation | **Handover-ready** | current report and supporting reports maintained |

## 5. Owner actions — exact sequence

1. **Check the live domain and Pages mapping.** Open GitHub → repository UPI_QR_Studio → **Settings → Pages**. Confirm the custom domain is upiqrstudio.com, DNS is correctly pointed to GitHub Pages, certificate is valid and **Enforce HTTPS** is enabled. Then open these URLs from your own network: homepage, /robots.txt, /sitemap.xml and /ads.txt. Check that no unexpected redirect changes the host or HTTP scheme.

2. **Verify Search Console ownership.** Open [Google Search Console](https://search.google.com/search-console/) and select the Domain property upiqrstudio.com. Open **Settings → Ownership verification**. If your Google account is not a verified owner, select Domain verification, copy Google's exact DNS TXT value and add it to the DNS manager for upiqrstudio.com. Do not invent or commit the token.

3. **Submit the sitemap.** After step 1 passes and property ownership is confirmed, Search Console → **Indexing → Sitemaps** → enter sitemap.xml → **Submit**. Re-open the report and record Status, Last read and Discovered URLs. The source contains 22 intended public URLs, but Google indexing is not guaranteed.

4. **Inspect important URLs.** Use Search Console → **URL Inspection** for the homepage, QR widget, a detailed guide, FAQs, Privacy Policy and Terms. Run **Test Live URL**, check indexing allowed and Google-selected canonical, and request indexing only where offered and appropriate. Review Page indexing, Manual Actions, Security Issues, HTTPS and Core Web Vitals.

5. **Check AdSense in the account.** Sign in to Google AdSense → **Sites**. Confirm upiqrstudio.com is listed under the correct account and the homepage ownership verification is detected. Check site review status. In the ads.txt status area, confirm the record is recognised as Authorized (or the account's current equivalent) and inspect Policy Center notices. The configured record is shown above.

6. **Complete consent and privacy work before ads.** No CMP is currently installed. Select a suitable CMP for actual audience locations and intended ad products, implement and test accept/reject/customize/withdraw flows, and update the Privacy Policy to match the real deployed services. Do not change the AdSense consent or activation flags until this is actually true.

7. **Review owner/legal declarations.** Confirm rsbusinesses0@gmail.com is the intended public contact. Have qualified Indian legal counsel review the Terms, privacy and liability provisions. Supply legal name, business registration, postal address, tax and payment details only in the appropriate private account forms when accurate and required; do not add invented values to public pages.

8. **Perform manual QA.** Generate QR codes with both tools using test UPI addresses, scan using trusted UPI apps without authorizing payment, verify recipient and optional parameters, test PNG downloads, keyboard navigation, mobile navigation, 360px and wider layouts, browser console and common mobile/desktop browsers. Run Lighthouse performance/accessibility review and a WCAG/axe scan.

9. **Review the Phase 10 changes.** Inspect the development branch hidden-file artifact correction and updated package guard. Promote only through a new pull request from development to main, with your explicit approval. The action-runtime versions and artifact-upload change have passed development CI; the deployment-only upload/deploy steps have not yet been exercised after their version update.

10. **After any approved merge**, inspect the production Pages Actions run and then repeat the live-domain, sitemap, URL Inspection and AdSense checks. Keep ads disabled unless Google reports Ready, the CMP/privacy implementation is verified and you explicitly authorize ad activation.

## 6. Important files

| File | Purpose |
|---|---|
| site-config.json | Canonical origin, contact address and AdSense release flags |
| ads.txt | Publisher seller record |
| robots.txt / sitemap.xml | Crawler policy and sitemap |
| tools/build-site.js | HTML, metadata, robots/sitemap and AdSense build logic |
| tools/adsense-config.js | Central AdSense permissions and page allowlist |
| tools/package-site.js | Least-privilege public artifact and hidden-path checks |
| tools/check-site.js | Links, anchors, assets, semantics and basic accessibility checks |
| tools/check-seo.js | SEO metadata, canonical, structured data, sitemap, robots and gated ad-script checks |
| tools/check-content.js | Content regression and QR guidance checks |
| tools/check-privacy.js | Privacy/security static checks |
| tools/check-adsense.js | AdSense loader, allowlist, ID and ads.txt checks |
| js/home-qr-generator.js, js/qr-generator.js | Browser-side QR generation and PNG export |
| pages/privacy-policy.html, pages/terms-and-conditions.html | Legal and privacy disclosures |
| .github/workflows/validate-development.yml | Development validation |
| .github/workflows/deploy-pages.yml | Main-only production deployment |
| CONTENT-AUDIT.md, TECHNICAL-SEO-AUDIT.md, LEGAL-READINESS.md, ADSENSE-LAUNCH-CHECKLIST.md, SEARCH-CONSOLE-SETUP.md | Supporting audit records and external-service instructions |
| LAUNCH-READINESS-REPORT.md, MAINTENANCE-REPORT.md | Historical launch and maintenance snapshots |

## 7. Branch and release information

- Production branch main: c6e975cc1b3cb5146d43f2cdc118bce03c7c9f0a.
- Phase 10 maintenance branch at initial final-report preparation: ee303aebf51bb8185fd1a9e45c60c0281a55163c (the report/documentation/date corrections will advance it).
- Latest confirmed Pages deployment before Phase 10 audit-only changes: [run 42475996585](https://github.com/rsbusinesses/UPI_QR_Studio/actions/runs/42475996585).
- Latest confirmed Phase 10 code validation before final handover text/date corrections: [run 42481988758](https://github.com/rsbusinesses/UPI_QR_Studio/actions/runs/42481988758), success.

**Production control:** this Phase 10 audit did not modify, commit to, merge or deploy main. All Phase 10 corrections are on development and await owner review.

## 8. Final recommendation

The codebase has a solid static-site build/validation foundation and has been deployed by GitHub Pages. It is not yet independently verified as a live custom-domain website, has no verified Search Console sitemap ingestion/indexing evidence, and has no verified AdSense approval or consent implementation.

The safest next step is **owner review of the Phase 10 changes and completion of the live-domain, Search Console and AdSense checks**. Do not activate ads or make another production release until the owner has reviewed the remaining legal, privacy, consent and live-operation requirements.

No search-ranking improvement, AdSense acceptance, indexing outcome or revenue level is promised by this audit.
