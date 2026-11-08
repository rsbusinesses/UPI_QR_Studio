# Google Search Console setup — UPI QR Studio

Phase 8 audit note: 8 November 2026.

**Connected property:** `sc-domain:upiqrstudio.com` is available through the connected Search Console reporting integration. This confirms read access to Search Console data for the property, but does not expose whether the user is a verified owner or what permission level the user holds. Ownership status must still be checked in Search Console itself.

**Read-only connector evidence (latest read, 8 November 2026):**
- Sitemaps dataset returned one empty/summary row: path is null, submitted URLs = 0, errors = 0, warnings = 0, and last-submitted/last-downloaded timestamps are null. This does not show a populated sitemap submission or prove successful Google processing.
- Search Analytics for the last 28 days returned 0 rows on the latest read. An earlier read returned one homepage row dated 6 November 2026 with 1 impression and 0 clicks. The later empty result is missing reporting data, not proof of zero traffic or de-indexing.
- The connector exposes no write actions for Search Console. Sitemap submission, URL Inspection, Request indexing, Page indexing, Manual Actions and Security Issues cannot be completed or verified through this connection.

Use the owner interface to confirm DNS verification, sitemap ingestion and URL indexing. Do not treat a Search Analytics row as proof of ownership or index coverage.

## Repository preparation status

The repository is configured for the canonical origin:

`https://upiqrstudio.com`

The generated sitemap is `https://upiqrstudio.com/sitemap.xml`, and `robots.txt` allows crawling and advertises that sitemap. The sitemap contains the public HTML URLs and excludes the custom 404 page.

**Production source and deployment (verified from GitHub):** main currently configures https://upiqrstudio.com, and its root robots.txt and 22-entry sitemap.xml use that origin. GitHub Pages build and deployment run 42475996585 completed successfully for main commit c6e975cc1b3cb5146d43f2cdc118bce03c7c9f0a on 8 November 2026. This proves the deployment workflow completed, not that custom-domain DNS, TLS or live HTTP access is working.

No root CNAME file was found in the repository. That alone does not determine the custom-domain setting; verify Repository → Settings → Pages and the DNS records at the domain provider. The live homepage, robots.txt and sitemap could not be independently fetched by this audit environment.

## 1. Confirm Domain-property ownership

1. Open [Google Search Console](https://search.google.com/search-console/).
2. Select the existing `upiqrstudio.com` Domain property (the reporting integration identifies it as `sc-domain:upiqrstudio.com`). Do not create a duplicate property if it is already present.
3. Open **Settings → Ownership verification** and confirm that Search Console lists a verified owner and a valid DNS verification method.
4. If ownership is not verified for your Google account, use **Add property → Domain**, enter `upiqrstudio.com`, and continue to DNS verification.

A Domain property covers the root domain and its subdomains. Google requires DNS-provider verification for this property type; an HTML meta tag is only supported for URL-prefix properties. The site's `google-adsense-account` meta tag is specifically for AdSense and is **not** a Search Console `google-site-verification` token. See [Verify your site ownership](https://support.google.com/webmasters/answer/9008080).

## 2. Add Google's DNS record in Hostinger

1. In Search Console, choose the DNS TXT verification method and copy the exact TXT value Google provides. It will resemble `google-site-verification=...`; the actual token is unique to your Google account.
2. Open Hostinger hPanel and select DNS management for `upiqrstudio.com`.
3. Add a **TXT** record:
   - **Name / Host:** `@` (or blank, if Hostinger's form instructs you to leave it blank).
   - **TXT value / Content:** paste Google's complete verification string exactly.
   - **TTL:** keep the provider default unless Hostinger directs otherwise.
4. Save the record. Do not remove other existing DNS records.
5. Return to Search Console and select **Verify**. If Google cannot see the record yet, allow DNS propagation and retry later.

Do not put the verification token in this repository, commit history or a public issue. It belongs in the DNS provider's record editor.

## 3. Submit and verify the sitemap

The current production source and latest Pages deployment use https://upiqrstudio.com. The generated sitemap contains 22 canonical public URLs; the custom 404 is excluded. The production workflow now packages the visitor-facing dist artifact.

Before submission, open https://upiqrstudio.com/sitemap.xml from your own network and confirm it returns valid XML over HTTPS. DNS/TLS/live endpoint availability could not be verified in this audit environment.

After confirming live accessibility and Domain-property ownership:

1. Open the upiqrstudio.com property in Search Console.
2. Open Indexing → Sitemaps.
3. Enter sitemap.xml in Add a new sitemap and select Submit.
4. Re-open the row and record its exact status, last-read date and discovered URL count. Investigate fetch or parsing errors.
5. Treat ads.txt status as a separate AdSense check; Search Console sitemap submission does not validate the ads.txt seller record.

The reporting integration currently shows no populated sitemap path or submission timestamp. No sitemap submission was performed by this audit.

Submitting a sitemap is a discovery hint; it does not guarantee that Google will crawl or index every listed URL. See [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) and the [Sitemaps report help](https://support.google.com/webmasters/answer/7451001).

## 4. Inspect important URLs

The connected reporting integration does not expose URL Inspection or Request indexing. The latest GitHub Pages workflow deployed the custom-domain source, but first confirm the live URL opens over HTTPS from your network. Then perform these checks in the Search Console UI.

Use **URL Inspection** for at least:

- `https://upiqrstudio.com/`
- `https://upiqrstudio.com/pages/qr-widget.html`
- `https://upiqrstudio.com/pages/upi-guide.html`
- `https://upiqrstudio.com/pages/safety-center.html`
- `https://upiqrstudio.com/pages/privacy-policy.html`
- `https://upiqrstudio.com/pages/contact-us.html`

Check the indexed/canonical URL Google selected, page fetch availability, crawl status and detected indexing restrictions. Use **Test Live URL** where available. Request indexing for key updated pages when Google offers that action; repeated requests do not guarantee faster crawling. See [Ask Google to recrawl URLs](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).

## 5. Monitor indexing

Review:
- **Page indexing:** investigate excluded or error URLs; distinguish intentional exclusions from unexpected ones.
- **Sitemaps:** confirm Google successfully fetched the sitemap and inspect processing errors.
- **URL Inspection:** compare Google's selected canonical with the page's declared canonical.
- **HTTPS:** investigate HTTP or certificate issues reported for the domain.
- **Manual actions and Security issues:** review these reports when available.

The custom `404.html` intentionally has `noindex, follow` and is not included in the sitemap. Public content pages should not contain a `noindex` directive.

## Technical SEO and structured-data decisions

The build process generates one canonical URL and matching Open Graph URL for each public HTML page. It also generates a `WebSite` JSON-LD object on the homepage and `BreadcrumbList` markup for content pages, based on visible breadcrumb navigation.

No Organization/LocalBusiness schema is added because verified organization identity, address and related business details have not been supplied. No Article author/date claims or SoftwareApplication ratings/availability claims are added because the repository does not currently provide evidence for those fields. Structured data does not guarantee a rich result.

## Official references

- [Verify site ownership — Search Console Help](https://support.google.com/webmasters/answer/9008080)
- [Sitemaps report — Search Console Help](https://support.google.com/webmasters/answer/7451001)
- [Build and submit a sitemap — Google Search Central](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Introduction to robots.txt — Google Search Central](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Ask Google to recrawl your website — Google Search Central](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)

## Verification method selection

For the recommended **Domain** property (`upiqrstudio.com`), use the DNS-provider verification method. Google states that Domain properties can only be verified through the domain name provider (DNS); HTML file upload and HTML meta-tag verification apply to URL-prefix properties, not Domain properties. A URL-prefix property such as `https://upiqrstudio.com/` can use an HTML meta tag, but covers only that URL prefix. See [Google's ownership-verification instructions](https://support.google.com/webmasters/answer/9008080).

Copy the DNS TXT or CNAME record verbatim from the signed-in Search Console wizard. It is unique to your account and must not be invented, guessed or committed to this repository. Keep the record in DNS after verification to retain ownership. A connection to a search analytics reporting service or the presence of search metrics does not by itself prove Domain-property ownership.
