# Phase 4 — Complete website content audit and improvements

Audit date: 8 November 2026  
Branch: `development`  
Scope: all 22 indexable HTML pages and the separate `404.html` page, plus QR generator scripts, FAQ data, shared templates and build-time content transformation.

## Executive findings

- The repository contains 23 HTML files: 22 indexable pages and a noindex 404 page.
- Two separate QR tools exist and have different capabilities. The homepage accepts a full UPI ID with optional payee name, amount and note. The standalone widget constructs a basic UPI ID from its username and provider-handle inputs and encodes only the payee-address parameter.
- Neither QR tool queries a bank, verifies ownership or availability of a UPI ID, processes a payment, nor confirms receipt of funds.
- Six long-form guides contained keyword-derived phrases such as “For what is UPI AutoPay?” and repeated generic steps that did not make sense for their topic. Those sections have now been rewritten as topic-specific instructions.
- The guide build helper previously replaced repeated list items with keyword-injected text. That transformation has been removed so future builds do not reintroduce malformed copy.
- The biometric-authentication page cited the original ₹5,000 introductory limit without adequately explaining that NPCI later listed a further enhancement circular. The page now labels the 2025 figure as historical and directs readers to the latest circular and their bank/app for the current limit.
- About and Contact content does not claim unverified company history, registration details, staff, qualifications, office addresses, awards or partnerships.
- No page deletion, URL migration or redirect was justified by this review.

## Page-by-page inventory and evaluation

Status key: **Good** = distinct user purpose and no major rewrite required; **Improved** = targeted correction made; **Maintain** = useful content but requires periodic factual, legal or operational review.

| Published page | Status | Content audit |
|---|---|---|
| `index.html` — Home | Improved | Clear purpose and working generator fields. Added instructions covering required UPI ID, optional fields, preview, PNG download, safe scanning, QR limitations and scan troubleshooting. Added HTML length limits consistent with client-side checks. |
| `pages/qr-widget.html` — Standalone QR generator | Improved | Clarified the two-part UPI ID input, exact provider-handle sourcing, generated URI scope, download contents, format-only validation and absence of payee-name/amount/note fields. Added explicit payment and verification limitations. |
| `pages/upi-guide.html` — Full guide index | Good / Maintain | Comprehensive question index across onboarding, identifiers, payments, merchant use, authentication and safety. It is intentionally more detailed than the concise guide hub and topic overview; review time-sensitive subtopics periodically. |
| `pages/upi-guide-topics.html` — Topic index | Good | Concise topical navigation with brief descriptions and links to the more detailed guides. Some category labels overlap with the other guide landing pages, but this page functions as a topic chooser. |
| `pages/upi-guides.html` — Guide hub | Good | Short orientation page directing visitors to quick-start, feature, safety and troubleshooting material. Its summaries overlap slightly with the topic index by design. |
| `pages/upi-faqs.html` — FAQs | Maintain | Interactive FAQ browser backed by local JavaScript data containing 159 question-and-answer entries. A short set of quick answers remains visible as a fallback. JavaScript is required for the complete filterable FAQ list; feature-specific answers should be rechecked when NPCI, RBI, bank or app rules change. |
| `pages/upi-id-providers.html` — Provider directory | Maintain | Eight illustrative provider listings with official website destinations, search/category filters and a clear non-exhaustive-directory disclaimer. Provider availability, branding, app features and URLs can change; inclusion is not an endorsement or guarantee of eligibility. |
| `pages/safety-center.html` — Safety Center | Good / Maintain | Detailed guidance on fraud patterns, credential protection, payment verification, urgent reporting and evidence preservation. It references the national 1930 helpline and official cybercrime portal; check government reporting links and procedures periodically. |
| `pages/about-us.html` — About | Good | Explains the website's utility and educational purpose, mission and values. It describes the site as independent and does not claim a company history, registration, certifications, employee roster or official payment-sector affiliation. |
| `pages/contact-us.html` — Contact | Good / Maintain | Displays the configured email address and accurately explains that the form prepares an email in the visitor's own mail application rather than submitting to a website server. It warns visitors not to send PINs, OTPs or banking credentials. |
| `pages/privacy-policy.html` — Privacy Policy | Maintain | Describes local QR processing, technical requests, the external QRCode.js CDN, GitHub Pages hosting, the absence of Google Analytics in the current repository build and AdSense as planned rather than active. Must be compared with deployed scripts, hosting configuration, logs, advertising and consent settings before production release. |
| `pages/terms-and-conditions.html` — Terms | Maintain | Explains the informational/utility nature of the site and that QR creation is not payment processing or a payment guarantee. Liability, governing-law and dispute provisions remain a general draft and require qualified Indian legal review. |
| `pages/upi-guides/biometric-authentication.html` | Improved / Maintain | Distinguishes phone unlock, optional on-device payment biometrics and UIDAI face authentication used in supported UPI PIN set/reset journeys. Updated the historical 2025 ₹5,000 introductory figure to explain that NPCI subsequently listed a further enhancement circular; current caps and implementation must be checked with NPCI and the provider. |
| `pages/upi-guides/cash-deposit-and-withdrawal-services.html` | Improved / Maintain | Rewrote the corrupted UPI Cash Point boilerplate. Clarifies that NPCI's named UPI Cash Point product is a cash-withdrawal service at authorised BC touchpoints, not an ordinary payment QR or a universal cash-deposit facility. Other cash products remain provider-specific. |
| `pages/upi-guides/conversational-payments.html` | Improved / Maintain | Rewrote the repeated keyword template with practical guidance for official entry points, language selection, checking spoken payee/amount details and verifying final transaction status. Hello! UPI and UPI 123PAY features remain service- and provider-dependent. |
| `pages/upi-guides/onboarding-account-activation.html` | Maintain | Covers bank/mobile verification, account linking, PIN setup/reset and device changes with bank/app eligibility qualifiers. Exact activation and authentication paths change by issuer and app; follow the official current flow rather than treating every menu or method as universal. |
| `pages/upi-guides/popular-guides.html` | Good | Provides practical high-level instructions for registration, linking accounts, PIN setup/reset, QR payments, sharing an ID, pending payments and complaint pathways. No substantial rewrite was required in this pass. |
| `pages/upi-guides/transaction-rules-and-merchant-payments.html` | Improved / Maintain | Rewrote malformed keyword-led sending-money steps. Emphasizes recipient resolution, displayed-name checks, amount verification, collect-request caution, pending status and official dispute routes. Transaction limits and charges remain category- and provider-dependent. |
| `pages/upi-guides/upi-autopay-and-recurring-payments.html` | Improved / Maintain | Rewrote generic boilerplate with mandate-specific checks for merchant, amount/maximum amount, frequency, validity, authorization and cancellation. The RBI 2026 e-mandate framework is summarized only at a high level; exact applicability and exceptions should be checked for each issuer and mandate. |
| `pages/upi-guides/upi-circle-delegated-payments.html` | Improved / Maintain | Rewrote repetitive text around primary/secondary user roles, invitation verification, permissions, limits and revocation. Clarifies that IoT-device/software delegation has a distinct scope and must not be confused with every person-to-person arrangement. |
| `pages/upi-guides/upi-id-number-guide.html` | Good / Maintain | Detailed explanation of payment identifiers, lookup, recipient verification, wrong-recipient payments and reporting. Avoids implying that a UPI ID or numeric identifier proves a recipient's identity. Numeric-identifier formats and availability should be checked against current NPCI and provider rules. |
| `pages/upi-guides/user-safety-and-daily-limits.html` | Improved / Maintain | Replaced repetitive generic instructions with clear device/account protection, payment-screen checks and a practical fraud-response sequence. Retains the warning that limits differ by transaction category and provider. |
| `404.html` — Page not found | Good (utility) | Clear recovery links to Home, guides and Contact. It is marked noindex and is not included in the sitemap. |

## Improvements completed

### QR generator guidance and product boundaries

The homepage now explains the full UPI ID as required input and the payee name, INR amount and note as optional fields. It explains previewing and downloading the PNG, checking recipient details in a trusted UPI app before sharing, and what to do when a QR will not scan.

The standalone tool now explains that it joins the username and provider handle, lowercases the resulting identifier, and creates a basic UPI payment URI using the `pa` parameter only. It does not add a payee name, amount or note. Its format check does not prove that the identifier exists, is active, belongs to a person or business, or can receive money.

Both pages now state that QR generation does not send or receive funds, confirm receipt, or provide a payment receipt. The homepage HTML input limits now align with client-side validation: 321 characters for the UPI ID pattern, 100 for the payee name and 100 for the payment note.

### Editorial correction and regression prevention

Six guides were rewritten to remove mechanically inserted phrases and generic repeated lists. `tools/guide-content.js` no longer rewrites repeated list items with keywords derived from section headings. The unused repeated-item and panel-aftercare data was removed from `tools/build-data.json`.

A new `npm run check:content` command checks built HTML for known keyword artefacts and verifies that both QR tools include core usage and limitation guidance. It is included in the development validation workflow and the main-only deployment workflow.

### Trust and transparency

The shared footer credit has been punctuated without changing the stated attribution. No unverified business details, staff, professional qualifications, registrations, contact addresses or institutional affiliations were added.

## Important claims checked against official sources

- NPCI describes UPI Cash Point as cash withdrawal at authorised BC touchpoints and publishes a ₹5,000 per-transaction limit for that named service, subject to other applicable limits. This must not be generalized to all cash-in/cash-out products.
- NPCI describes UPI Circle as delegation from a primary user to a secondary user; its product overview says the secondary user may or may not have a bank account linked to UPI.
- NPCI's 7 October 2025 circular introduced optional on-device biometric transaction authentication with an initial ₹5,000 per-transaction limit. NPCI's circular list subsequently includes OC-226A (FY 2026–27), an enhancement to that limit. The earlier value is therefore labelled historical rather than current; the live cap must be checked in the latest circular and the user's bank/app.
- RBI's Digital Payments – E-mandate Framework, 2026 governs recurring e-mandate arrangements and includes customer-notification and transaction-limit provisions. The guide avoids suggesting that every mandate or issuer follows identical terms.
- RBI's published UPI limit explanation distinguishes P2P limits from P2M limits, which NPCI may prescribe or revise in consultation with ecosystem participants. The site therefore does not state one universal cap for every payment type.
- The National Cyber Crime Reporting Portal identifies 1930 as the immediate-reporting helpline for cyber financial fraud. Visitors are also advised to contact their bank promptly.

## Sources used

- NPCI, UPI FAQs: https://www.npci.org.in/what-we-do/upi/faqs
- NPCI, UPI product and operating circular directory: https://www.npci.org.in/circulars/upi
- NPCI, UPI Cash Point: https://www.npci.org.in/product/upi-cash-point
- NPCI, UPI Circle: https://www.npci.org.in/product/upi-circle
- NPCI, OC-226 (7 October 2025), additional authentication methods: https://www.npci.org.in/uploads/UPI_OC_No_226_FY_2025_26_Introduction_of_Additional_Authentication_methods_in_UPI_42c3693399.pdf
- RBI, Digital Payments – E-mandate Framework, 2026: https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13374
- RBI, payment-system developments / UPI limit framework: https://www.rbi.org.in/Scripts/PublicationsView.aspx?id=23436
- Government of India, National Cyber Crime Reporting Portal: https://cybercrime.gov.in/

## Remaining factual, legal and hands-on review

1. Recheck the provider directory's eight outbound destinations and current app eligibility periodically; it is intentionally non-exhaustive.
2. Before production release, compare the Privacy Policy with the actual published scripts, GitHub Pages hosting and logs, CDN usage, ad tags, analytics tags and consent-management implementation. Repository evidence is not a substitute for review of the live deployment.
3. Obtain qualified Indian legal review of the Privacy Policy and Terms, including the applicable website owner/data-controller identity, legal notices, liability and dispute language.
4. Confirm whether the configured email `rsbusinesses0@gmail.com` is the intended public contact for privacy and legal requests. Supply a legal business name, postal address or phone number only if you want those published; none has been invented.
5. Perform manual QR scanning, PNG download, print-quality and responsive-browser tests on representative devices. Automated repository checks do not demonstrate real-world scanner compatibility or mobile usability.

## Information needed from the site owner

- Confirm that `rsbusinesses0@gmail.com` is the correct public contact for general, privacy and legal enquiries.
- Supply the legal owner/operator name and a postal service address only if these details should appear in the legal notices.
- Confirm the real production configuration for analytics, advertising, cookies/consent, hosting logs and external scripts before the Privacy Policy is treated as final.
- Review legal wording with a qualified Indian professional before publication.

## Validation

Automated repository checks run by the development GitHub Actions workflow after each commit. The new content check guards against malformed keyword-template phrases and verifies that both QR-generator pages contain the required guidance. CI results for this commit will be recorded after the run completes.

This audit describes the repository state on `development`. It does not assert that these changes have been deployed to the live site.
