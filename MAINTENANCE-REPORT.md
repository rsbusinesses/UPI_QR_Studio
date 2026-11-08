> **Historical snapshot — superseded by Phase 10.** This Phase 9 monitoring report predates the hidden-file artifact correction and final handover. The subsequent Phase 10 update explicitly includes the required .nojekyll file in the Pages artifact and makes the packager reject other hidden paths. See [FINAL-HANDOVER-AUDIT.md](https://github.com/rsbusinesses/UPI_QR_Studio/blob/development/FINAL-HANDOVER-AUDIT.md) for the consolidated status.

# Phase 9 — Post-launch monitoring and maintenance report

Audit date: 8 November 2026  
Production branch: `main`  
Maintenance branch: `development`  
Repository: `rsbusinesses/UPI_QR_Studio`

## Executive status

**Production deployment is confirmed at the GitHub Pages workflow level.** GitHub merged the release-candidate work into `main` through PR #2, and the subsequent `robots.txt` update was built and deployed successfully. The latest deployment run is [42475996585](https://github.com/rsbusinesses/UPI_QR_Studio/actions/runs/42475996585), for production commit `c6e975cc1b3cb5146d43f2cdc118bce03c7c9f0a`, completed successfully on 8 November 2026.

This confirms the GitHub Pages build/deploy job completed. It does **not** prove the custom domain is resolving or that the live site can be loaded from every network. Direct checks from this audit environment failed before HTTP/TLS negotiation because its DNS resolver could not resolve `upiqrstudio.com`. Treat live reachability, HTTPS and page rendering as **unverified**, not as a confirmed site outage.

## 1. Production health

| Check | Result |
|---|---|
| Production release | GitHub Pages build and deploy jobs succeeded for main commit `c6e975cc1b3cb5146d43f2cdc118bce03c7c9f0a` |
| Main workflow consolidation | Main currently contains only `deploy-pages.yml` and `validate-development.yml`; the two legacy Pages workflows are no longer present |
| HTTPS / TLS / redirects | Not verified; DNS resolution failed in the audit environment before an HTTP response was received |
| Homepage, QR tool and Privacy Policy | GitHub source exists; live page fetch/visual rendering could not be tested from this environment |
| `robots.txt` | Root file exists in main and development. It allows all crawlers and points to the custom-domain sitemap |
| `sitemap.xml` | Generated XML contains 22 canonical URL entries on `https://upiqrstudio.com`; live fetch and Google processing remain unverified |
| `ads.txt` | Exact account-supplied seller line exists in main and development; live endpoint and AdSense crawler status unverified |
| Broken local links/assets | Latest deployment build's site check completed with 0 errors and 0 warnings |
| QR generation | Build/content checks passed; manual scan, download and device/browser operation tests were not performed |
| JavaScript console errors | Not verified; no live browser console was available |
| Rendering / accessibility / performance | Not verified; no Lighthouse, axe/WCAG or responsive visual session was available |
| Unexpected redirects / external links | Not verified because live HTTP navigation was not available |

Current `robots.txt`:

```text
User-agent: *
Allow: /
Sitemap: https://upiqrstudio.com/sitemap.xml
```

The sitemap contains 22 URLs; the custom 404 is excluded. Google’s Sitemaps report lists only sitemaps submitted through the report or API; discovery from a `robots.txt` reference alone is not the same as a submitted sitemap. See [Google’s Sitemaps report guidance](https://support.google.com/webmasters/answer/7451001).

## 2. Search monitoring

The connected reporting account exposes the Search Console property `sc-domain:upiqrstudio.com`.

| Metric/report | Latest available result |
|---|---|
| Search Analytics, last 28 days | Connector returned 0 rows; there are no current query/page metrics to report from this read |
| Search queries | No rows returned |
| Page impressions/clicks/CTR/position | No rows returned |
| Sitemap report | One empty/summary row; path is null, submitted URLs = 0, errors = 0, warnings = 0 |
| Last submitted / last downloaded | Both timestamps are null |
| URL inspection / Page indexing | Not exposed by this connector |
| Manual Actions / Security Issues / HTTPS / Core Web Vitals | Not exposed by this connector |
| Sitemap submit / Request indexing | No Search Console write actions are available through this connection |

A zero-row connector response is missing telemetry, not proof that the site received zero impressions or clicks. Likewise, the empty sitemap row does not establish successful ingestion. Search Console owner-side verification and indexing reports still need inspection.

Google defines a successful sitemap status as a sitemap fetched and read without errors; see the [Sitemaps report](https://support.google.com/webmasters/answer/7451001). The owner should open Search Console, select `upiqrstudio.com`, confirm Domain-property ownership, submit `sitemap.xml`, and inspect the resulting status, last-read date and discovered URL count. Then inspect the homepage, QR widget, major guide pages and legal pages using URL Inspection. Check Manual Actions and Security Issues manually; those reports are not available via this connection. See [Manual Actions](https://support.google.com/webmasters/answer/9044175) and [Security Issues](https://support.google.com/webmasters/answer/9044101).

## 3. AdSense monitoring

No authenticated AdSense reporting connection is available in this session. Application status, review status, Policy Center alerts, ads.txt crawler status, ad delivery, warnings and earnings cannot be independently read.

Source-level configuration in the deployed main tree:

- Publisher ID: `ca-pub-6680219748778164`.
- Homepage AdSense ownership meta tag count in source: 0.
- Homepage AdSense serving-loader count in source: 0.
- `adsenseSiteReviewApproved`: `false`.
- `adsenseConsentConfigurationVerified`: `false`.
- `adsenseActivationAuthorized`: `false`.
- `adsenseMode`: `disabled`.
- `ads.txt`: `google.com, pub-6680219748778164, DIRECT, f08c47fec0942fa0`.

The release check passed and the serving gate remains disabled. This is not evidence of AdSense approval or actual delivery. The owner should check AdSense → Sites, Policy Center and ads.txt status in the signed-in account. Do not activate Auto ads until the site is Ready and the real consent configuration has been deployed and tested.

## 4. Technical maintenance findings

### Fixed on development in this maintenance pass

The latest production deployment logs showed a GitHub Actions warning that Node.js 20 action runtimes were deprecated and were being forced to run on Node.js 24. The workflow referenced older action majors. This has been updated in the maintenance branch to current Node 24-compatible releases:

| Action | Previous reference | Updated reference |
|---|---|---|
| `actions/checkout` | `v4` | `v7.0.1` |
| `actions/setup-node` | `v4` | `v7.1.0` |
| `actions/upload-pages-artifact` | `v4` | `v5.0.0` |
| `actions/deploy-pages` | `v4` | `v5.0.1` |

The application build continues to use Node.js 22. This update changes the JavaScript runtime used by the GitHub Actions, not the website's browser runtime or the AdSense settings. GitHub announced that Node 20 was removed from Actions runners on 23 September 2026; current action releases are listed in the official [checkout](https://github.com/actions/checkout/releases), [setup-node](https://github.com/actions/setup-node/releases), [upload-pages-artifact](https://github.com/actions/upload-pages-artifact/releases) and [deploy-pages](https://github.com/actions/deploy-pages/releases) repositories.

### Warnings still to evaluate

The latest production build logs also showed Node deprecation notices for `punycode` and `url.parse()`, plus the npm deprecation notice for transitive package `whatwg-encoding@3.1.1`. These did not fail the build. No package changes were made in this pass because the preceding development CI had passed `npm audit --audit-level=high`, and no confirmed exploitable vulnerability or safe minimal package update was identified. Review the dependency tree and test a supported replacement/update before changing the lockfile.

### Other maintenance observations

- The root npm package remains small and has only one direct dependency, Cheerio.
- The deployment validation in main checks website links, content, SEO metadata, packaged output and AdSense gating.
- The development validation additionally runs npm audit, JavaScript syntax checks, repeatable-build checks and privacy/security checks.
- No verified current-content error, broken provider URL or performance regression was demonstrated by the available automated checks.
- Manual browser tests, accessibility testing, Core Web Vitals and external-link revalidation remain outstanding.

## 5. Test evidence

Latest production run: [42475996585](https://github.com/rsbusinesses/UPI_QR_Studio/actions/runs/42475996585) — build and deploy succeeded.

The successful production build included:
- `npm run build`
- `npm run check`
- `npm run check:content`
- `npm run check:seo`
- `npm run package:site`
- `npm run check:adsense`

The development workflow for the synchronized source had previously passed `npm audit --audit-level=high`, syntax checks, repeatable build, privacy/security checks, site/content/SEO checks, package validation and AdSense checks. The development validation for maintenance commit `b2a37a418daf2ab62d55f81b3d6f0c34b1eb64b5` completed successfully in [run 42480989373](https://github.com/rsbusinesses/UPI_QR_Studio/actions/runs/42480989373). It executed the updated checkout/setup-node actions and passed npm audit, syntax, reproducible build, site, privacy, content, SEO, packaging and AdSense checks. The deployment-only upload/deploy action updates are not executed on development because the production workflow is guarded to run only on `main`; they remain unexercised until a future owner-approved release. Do not trigger a production deployment solely to test them.

## 6. Owner actions

1. Test `https://upiqrstudio.com/`, `/robots.txt`, `/sitemap.xml` and `/ads.txt` from your own network and confirm HTTPS, redirects and final content.
2. In Search Console, verify the Domain property, submit `sitemap.xml`, and inspect processing, URL indexing, Manual Actions and Security Issues.
3. In AdSense, personally verify site review and ads.txt status, Policy Center alerts and any identity/payment/tax prompts. The reporting connection cannot access these.
4. Complete manual QR scanner/download tests on a desktop and a mobile device; inspect the browser console and perform a responsive/accessibility review.
5. Review the transitive dependency deprecation warnings separately. Do not ignore a future security advisory; the latest recorded npm audit passed at high severity level.
6. Review the GitHub Actions runtime update on `development`. Promote it only through your normal owner-approved pull-request/release process.

## 7. Change management

- Production branch `main` was not modified by this maintenance pass.
- Development was fast-forwarded to the same source tree as the current deployed main commit before maintenance, then only the two workflow files were changed.
- No site-content, domain/DNS, Pages, privacy-policy, AdSense activation, account or payment settings were changed.
- The updated development branch must pass its new CI run before it is considered ready for a future owner-approved promotion.
