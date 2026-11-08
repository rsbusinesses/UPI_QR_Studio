# Google Search Console setup — UPI QR Studio

Phase 3 audit note: 8 November 2026. **Search Console ownership verification status is not confirmed from this repository session.** No authenticated property ownership status or indexing report was available to inspect. Treat the property as unverified until Search Console itself confirms ownership.

## Repository preparation status

The repository is configured for the canonical origin:

`https://upiqrstudio.com`

The generated sitemap is `https://upiqrstudio.com/sitemap.xml`, and `robots.txt` allows crawling and advertises that sitemap. The sitemap contains the public HTML URLs and excludes the custom 404 page.

**Not completed from this repository:** Google account ownership verification, sitemap submission, URL inspection and indexing requests. These require access to the Google account that owns the Search Console property.

## 1. Add a Domain property

1. Open [Google Search Console](https://search.google.com/search-console/).
2. Choose **Add property**.
3. Select **Domain** (not URL prefix).
4. Enter `upiqrstudio.com` without `https://`, `www` or a path.
5. Continue to the DNS verification step.

A Domain property covers the root domain and its subdomains. Google requires DNS verification for this property type. See [Verify your site ownership](https://support.google.com/webmasters/answer/9008080).

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

## 3. Submit the sitemap

The current development build prepares 22 canonical public URLs at `https://upiqrstudio.com/sitemap.xml`. The custom 404 is excluded. The Pages workflow now packages only visitor-facing HTML, CSS, JavaScript, assets, `robots.txt`, `sitemap.xml` and `.nojekyll`; build tooling, templates, repository documentation, package files and site configuration are excluded from the public artifact after these changes are deliberately promoted.

After the Domain property is verified:

1. Open the `upiqrstudio.com` property in Search Console.
2. Open **Sitemaps**.
3. Enter `sitemap.xml` and submit it.
4. Review the Sitemaps report for fetch and processing errors.

Submitting a sitemap is a discovery hint; it does not guarantee that Google will crawl or index every listed URL. See [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) and the [Sitemaps report help](https://support.google.com/webmasters/answer/7451001).

## 4. Inspect important URLs

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
