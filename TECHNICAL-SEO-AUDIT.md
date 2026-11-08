# Technical SEO audit — UPI QR Studio

Audit date: 8 November 2026
Branch: development
Base commit: 009d0579f7ee206cf0c1acdf2df9a02f508c7940
Configured production origin: https://upiqrstudio.com

## Executive summary

The development source is configured for the custom production origin. The build emits self-referencing canonical URLs and matching Open Graph URLs for the 22 intended public pages, a root sitemap containing those canonical URLs, and a permissive crawl policy. The custom 404 page is explicitly noindex, follow, has no canonical, and is excluded from the sitemap.

This report describes repository source and build output, not a verified live deployment or Google Search Console property. Direct fetches of the live domain, robots.txt, sitemap.xml and sample pages were unavailable to this inspection environment. Search Console ownership, sitemap processing, page indexing, Core Web Vitals and mobile rendering remain external checks.

## Page-by-page title, H1 and meta description review

These page-specific values are stored in tools/build-data.json and were reviewed against each page's purpose and visible content. The builder appends the site name to the title and derives the canonical from the configured production origin.

| Public URL path | Page title | H1 | Meta description |
|---|---|---|---|
| / | Create a UPI QR Code Online | Your UPI QR Code, Made Simple. | Create a UPI QR code in your browser with an optional payee name, amount and note. Explore independent UPI guides and payment safety resources. |
| /pages/about-us.html | About UPI QR Studio | Making digital payments simpler for everyone. | Learn about UPI QR Studio, our independent educational purpose, editorial approach and commitment to clear digital payment guidance. |
| /pages/contact-us.html | Contact UPI QR Studio | Contact UPI QR Studio | Contact UPI QR Studio to report an issue, suggest a correction, share accessibility feedback or ask a question about the website. |
| /pages/privacy-policy.html | Privacy Policy | Privacy Policy | Read how UPI QR Studio handles information when you use this static website and browser-based UPI QR tools, and learn about advertising choices. |
| /pages/qr-widget.html | UPI QR Code Generator | UPI QR Generator | Build a UPI payment QR code from a UPI ID. Preview and download the QR code with its recipient ID shown below. |
| /pages/safety-center.html | UPI Safety Center | Your money. Your control. Your safety matters. | Learn practical ways to spot UPI scams, protect your UPI PIN, verify recipients and respond to suspicious transactions. |
| /pages/terms-and-conditions.html | Terms and Conditions | Terms and Conditions | Review the terms for using UPI QR Studio, including tool limitations, user responsibilities and independent educational information. |
| /pages/upi-faqs.html | UPI Payment FAQs | UPI Payment FAQs | Find answers to common questions about UPI IDs, QR payments, PIN safety, failed transactions, refunds and transaction limits. |
| /pages/upi-guide-topics.html | UPI Guide Topics | UPI Guide Topics | Browse UPI guides by topic, including account setup, QR payments, AutoPay, delegated payments, security and transaction rules. |
| /pages/upi-guide.html | UPI Guides and How-to Articles | Browse UPI guide topics | Explore practical UPI guides that explain setup, payments, UPI IDs, safety, AutoPay and other features in clear steps. |
| /pages/upi-guides.html | UPI Guides | UPI Guides | Browse UPI tutorials and practical guides for everyday digital payments, payment security and UPI features. |
| /pages/upi-id-providers.html | UPI ID Providers in India | Explore UPI ID Providers Across India | Explore UPI ID handles and payment apps. Check provider availability and supported features with the relevant bank or app. |
| /pages/upi-guides/biometric-authentication.html | Biometric Authentication for UPI | Biometric Authentication for UPI | Understand where biometric authentication may be used in payment apps, how it differs from a UPI PIN and how to protect your device. |
| /pages/upi-guides/cash-deposit-and-withdrawal-services.html | UPI Cash Deposit and Withdrawal Services | UPI Cash Deposit and Withdrawal Services | Learn how UPI-enabled cash deposit and withdrawal services may work, where they are available and what to verify before using them. |
| /pages/upi-guides/conversational-payments.html | Conversational Payments with UPI | Conversational Payments with UPI | Explore conversational payment concepts, voice or chat-assisted interfaces, usability considerations and safety checks for digital payments. |
| /pages/upi-guides/onboarding-account-activation.html | UPI Onboarding and Account Activation | UPI Onboarding and Account Activation | Learn the usual steps for setting up UPI access, linking an eligible account and configuring payment authentication with your bank or app. |
| /pages/upi-guides/popular-guides.html | Popular UPI Guides | Popular UPI Guides | Start with essential UPI explainers about getting set up, paying by QR, checking payment status and staying safe. |
| /pages/upi-guides/transaction-rules-and-merchant-payments.html | UPI Transaction Rules and Merchant Payments | UPI Transaction Rules and Merchant Payments | Understand UPI transaction flows, merchant payments, pending transactions and why limits and processing rules can vary. |
| /pages/upi-guides/upi-autopay-and-recurring-payments.html | UPI AutoPay and Recurring Payments | UPI AutoPay and Recurring Payments | Learn how UPI AutoPay mandates support recurring payments, how to review a mandate and how to manage or revoke it safely. |
| /pages/upi-guides/upi-circle-delegated-payments.html | UPI Circle and Delegated Payments | UPI Circle and Delegated Payments | Explore UPI Circle delegated payments, responsibilities of primary and secondary users and safeguards to review before activation. |
| /pages/upi-guides/upi-id-number-guide.html | UPI ID and UPI Number Guide | UPI ID and UPI Number Guide | Understand how UPI IDs and supported mobile-number addressing work, how to verify the recipient and how to avoid payment mistakes. |
| /pages/upi-guides/user-safety-and-daily-limits.html | UPI Safety and Transaction Limits | UPI Safety and Transaction Limits | Learn safe UPI practices and how to verify transaction limits with your bank or app, since caps may differ by transaction type and institution. |

## Technical findings

### Titles, descriptions, headings and language

- All 22 indexable pages have a distinct, content-specific title and meta description.
- The FAQ page H1 was corrected from the generic label Topics to UPI Payment FAQs.
- Each checked public page has one H1; the audited heading sequence contains no skipped levels.
- The source declares English (lang=en), matching the current English page content.
- Every page has a viewport declaration. This is source-level verification, not a live browser or Lighthouse test.
- The build validation treats descriptions outside the editorial review range of 60–170 characters as warnings; this is not a Google ranking rule.

### Canonicals and internal links

- site-config.json uses https://upiqrstudio.com as an origin without a path, query or fragment.
- All 22 public HTML pages have exactly one self-referencing canonical on that origin.
- Each public page has an og:url matching its canonical.
- Internal navigation and content links use relative paths; local links and fragments are checked after build.
- The last successful Phase 2 baseline checked 824 local links, 180 local assets and 311 fragments with no errors or warnings. Phase 3 reruns these checks.

### Crawling and sitemap

- robots.txt contains User-agent: *, Allow: / and Sitemap: https://upiqrstudio.com/sitemap.xml.
- sitemap.xml contains 22 unique absolute HTTPS URLs on the custom domain, matching the indexable public pages.
- 404.html is noindex, follow and is not listed in the sitemap.
- Sitemap generation now includes only pages with a generated canonical and without a noindex directive.
- Documentation, tooling, templates, configuration and package files are not sitemap entries.
- No lastmod timestamps are emitted because the build has no trustworthy per-page modification-time source.

### Open Graph and Twitter/X

- Open Graph tags include type, site name, page title, description and canonical URL.
- Twitter/X uses a summary card with page-specific title and description.
- No social preview image is supplied because the repository contains no suitable reviewed preview image. The favicon is not used as a large social graphic.

### Images and alt text

- The current public HTML pages contain no img elements, so no existing image alt defects were found.
- The SEO validator checks future images for an alt attribute. Meaningful content images should use descriptive text; decorative images may use empty alt text.

### Structured data

- Homepage: one WebSite JSON-LD object whose name, URL and description must match the site configuration and page metadata.
- Other indexable pages: one BreadcrumbList with ordered, named, absolute URLs on the custom domain, ending at that page's canonical.
- 404: no structured data.
- No Organization, LocalBusiness, Review, Rating, Article-author/date or SoftwareApplication rating/availability claims are introduced without verified supporting data.
- Structured data does not guarantee a rich result.

### Public deployment artifact

The previous Pages workflow uploaded the repository root (path: .), which could expose build tooling, source templates, documentation, package manifests and site configuration at public URLs even though these were not in the sitemap.

The development workflow now creates an allowlisted dist/ artifact containing visitor-facing HTML, CSS, JavaScript, assets, robots.txt, sitemap.xml, .nojekyll, and ads.txt only when present. The Pages workflow is configured to upload dist/ after build, site validation and SEO validation. Build tools, components, repository documentation, package files and site-config.json are excluded.

This configuration takes effect only after these development changes are deliberately promoted. The live production deployment has not been changed in this phase.

### 404, duplicates and mobile

- The 404 page has its own title, description, one H1, noindex, no canonical and no schema.
- Public page titles are unique and the sitemap/canonical mapping is one-to-one.
- Responsive stylesheet files and viewport declarations exist; a browser-based device-width test or Lighthouse audit was not available.
- Live HTTP redirects, TLS/certificate chain, server response codes, rendered resources and Googlebot rendering could not be inspected.

## Google Search Console readiness

- SEARCH-CONSOLE-SETUP.md documents the user-side verification and sitemap workflow.
- No authenticated Search Console ownership, sitemap report, URL Inspection, indexing coverage, manual actions or Security issues status was available in this session.
- The user reports Windsor.ai is connected; an authenticated Search Console property-ownership status was not available from that reporting connection in this session. Metrics, if later available, are not proof of Domain-property verification.
- No google-site-verification token or verification file was invented or committed.
- For a Domain property, Google requires domain-provider DNS verification. The exact TXT/CNAME record is generated in the signed-in Search Console wizard.

## Required external steps

1. In Search Console, select or add the Domain property upiqrstudio.com and inspect Settings → Ownership verification.
2. If ownership is not verified, copy the DNS TXT or CNAME instruction exactly from Google and add it in Hostinger without removing existing records.
3. After verification, submit sitemap.xml and confirm the Sitemaps report shows successful fetching/processing.
4. Use URL Inspection / Test Live URL for the homepage and representative QR tool, guide, FAQ and legal pages. Compare Google's selected canonical with the declared canonical.
5. Review Page indexing, HTTPS, Core Web Vitals, Manual actions and Security issues. Request indexing only for pages whose live test succeeds.

## Official Google references

- https://support.google.com/webmasters/answer/9008080
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/robots/intro
- https://developers.google.com/search/docs/crawling-indexing/canonicalization
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/appearance/snippet
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb


## Final automated verification

Validation commit: 757dd5bde327be5d1269ede9971c4a8dcbdd6680  
GitHub Actions run: https://github.com/rsbusinesses/UPI_QR_Studio/actions/runs/42468938707

All development validation job steps passed:

- npm ci installed 23 packages; 24 packages were audited.
- npm audit --audit-level=high passed with 0 vulnerabilities.
- JavaScript syntax validation passed.
- The site built twice, generating 23 HTML pages; repeatability check passed.
- Site QA checked 23 pages, 824 local links, 180 local assets, 0 CSS URL assets and 311 fragments: 0 errors, 0 warnings.
- SEO QA checked 23 pages (22 indexable), 22 canonical URLs, 22 sitemap URLs and 22 JSON-LD blocks: 0 errors, 0 warnings.
- The public-site packaging step produced 45 files, including 23 HTML pages, and verified 22 unique HTTPS sitemap URLs against files in dist/.
- The package guard confirmed that build tooling, source templates, repository documentation, package manifests and site configuration were excluded from the public artifact.

This CI run validates repository output and packaging. It does not establish live deployment status, Google property verification, Google sitemap processing, indexing, live redirects/TLS or visual mobile usability.
