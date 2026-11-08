# Phase 2 — Repository audit and architecture report

Audit date: 8 November 2026  
Audited branch: development  
Base commit: d6773059408fefdecfaf25ccc129498c5f2be9b6

## Scope and method

The audit used the complete Git tree for development and inspected the project manifest, lockfile, build and validation scripts, HTML entry points and page templates, browser JavaScript, CSS, crawler files, documentation and GitHub Actions workflows. Existing build/QA results from the preceding development validation run were used as a baseline. The updated automated checks in this phase are run by the development-only GitHub Actions workflow after commit.

No application-wide rewrite was performed. No files were removed because all browser scripts and stylesheets inspected were in active use. No new npm dependency was added.

## Architecture inventory

The repository contains 76 tracked entries:

| Category | Inventory | Purpose |
|---|---:|---|
| HTML | 25 | 23 built site pages, including the homepage and custom 404, plus two shared header/footer templates |
| CSS | 11 | Shared base/theme, responsive rules, and page/feature styles |
| Browser JavaScript | 7 | Shared navigation/contact behavior plus homepage QR, QR widget, FAQ, guide navigation, guide router and provider filtering |
| Build/QA JavaScript | 6 | Static site builder, fragment repair, guide contextualization, local preview, site QA and SEO QA |
| JSON | 4 | npm manifest/lockfile, site configuration and build content data |
| GitHub Actions | 2 | Main-only Pages deployment and development-only validation |
| Markdown | 7 | README, quality checks, migration, content audit, legal readiness, AdSense checklist and Search Console setup |
| Other | 3 | favicon SVG, .nojekyll and .gitignore; crawler files robots.txt and sitemap.xml are separate root files |

The source contains 25 HTML files in total. The build walker excludes components/ and tools/, producing 23 HTML pages. The SEO checker expects 22 indexable pages and one noindex 404 page.

### Build and runtime flow

1. Authored HTML pages and shared templates reside in the repository.
2. site-config.json provides the canonical site origin, display name, contact email and optional AdSense publisher ID.
3. tools/build-data.json supplies generated page titles, descriptions, guide summaries and editorial note content.
4. tools/build-site.js uses Node.js and Cheerio to normalize page structure, insert the shared templates, produce metadata/canonicals/structured data, normalize local links, and generate robots.txt and sitemap.xml.
5. tools/fix-fragments.js repairs resolvable fragment targets and reduces repeated guide paragraphs; tools/guide-content.js applies topic-specific guide content.
6. The browser loads the generated HTML, CSS and page-specific JavaScript. QR generation runs in the browser using QRCode.js loaded from cdnjs.
7. tools/preview.js serves the site locally on loopback for manual review.

### Package and workflow configuration

- Package manager: npm, with lockfile version 3.
- Runtime: Node.js >=20.18.1; GitHub Actions uses Node.js 22.
- Direct dependency: cheerio; the lockfile resolves its exact dependency graph.
- npm scripts: build, check, preview, and check:seo.
- The development workflow runs on pushes to development, installs locked dependencies, audits the lockfile, validates JavaScript syntax, runs the build twice for repeatability, then runs site and SEO checks.
- The Pages deployment workflow is main-only. The corresponding file in development also guards both jobs with the refs/heads/main condition. This phase does not change or trigger production deployment.

## Confirmed findings

### Existing site and code checks

- The preceding successful development CI run built 23 pages twice and confirmed repeatable output.
- The site checker reported 824 local links, 180 local assets and 311 fragment references with zero errors and zero warnings.
- The SEO checker reported 22 indexable pages, 22 canonical URLs, 22 sitemap URLs and 22 JSON-LD blocks with zero errors and zero warnings.
- A source scan found no duplicated external/local script URL or stylesheet URL per inspected page.
- Every browser JavaScript file and every CSS file in the repository is referenced by the page(s) or workflow that use it.
- The checked HTML pages currently contain no img elements or iframe elements. Image and iframe accessibility checks therefore establish future regression protection rather than repair a current image/iframe defect.
- CSS files currently contain no url(...) or @import resource references.
- No .env file or obvious credential file is present in the tracked tree. This does not replace a full historical secret scan of every commit.

### QA coverage gaps repaired

1. The site checker did not previously validate CSS url(...) asset paths, srcset candidates, or iframe/video/audio/track/embed/object local resource paths.
2. The site checker did not previously enforce image alt attributes, iframe titles, or accessible names on form controls and buttons.
3. The site checker did not report duplicate script or stylesheet references within a page.
4. Local-reference validation did not explicitly reject paths resolving outside the repository root.
5. The SEO checker validated HTTPS origin shape but did not reject a malformed non-empty AdSense publisher ID, and it could accept duplicated Open Graph properties when the first duplicate had a value.
6. README's documented npm command list omitted the existing check:seo script.

## Changes made in this phase

- Extended tools/check-site.js with safe project-root path validation, checks for embedded/media and srcset references, CSS url(...) asset checks, duplicate resource checks, image/iframe alternative checks and accessible-name checks for controls.
- Extended tools/check-seo.js to validate site name/contact email/AdSense ID values, disallow credentials/query/fragment in the site origin, and require exactly one non-empty Open Graph property per required field and exactly one sitemap directive.
- Added npm audit --audit-level=high to the development-only validation workflow.
- Added local environment file patterns to .gitignore.
- Updated the README command list to include npm run check:seo.
- No application feature source, domain/DNS setting, Pages setting, production workflow or main branch was changed.

## Known limitations and remaining risks

- A local working tree is not mounted in this environment, so local git status, local npm execution and a visual browser session cannot be reported.
- GitHub Actions provides the reproducible build and automated check evidence; manual desktop/mobile visual review, Lighthouse, axe/WCAG audit and browser-console inspection are still separate activities.
- External HTTP endpoint availability and third-party CDN integrity are not covered by local-link checks.
- The production main branch had an older site-config.json value pointing at the prior GitHub Pages project URL during the separate Phase 1 repository inspection. That production-branch issue is outside the scope of this development-only phase and has not been changed here. Development has the intended https://upiqrstudio.com configuration.
- The project has no separate unit-test runner or lint script in package.json; the existing validation scripts and syntax check are the applicable automated test commands.

## Release boundary

All changes in this phase are intended for development only. Production remains unchanged. Do not merge or deploy until the release workflow and production domain configuration are reviewed and explicitly approved.
