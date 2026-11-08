# Phase 5 — Privacy, legal and user-trust readiness

Audit date: 8 November 2026  
Branch audited: `development`  
Scope: repository source, configured static-site build, QR generators, contact flow, policy pages and current advertising configuration.

## 1. Data-flow and privacy audit

### QR generator inputs

- The homepage generator constructs the `upi://pay` URI in JavaScript and creates the QR image using QRCode.js in the browser.
- The standalone QR widget does the same for the payee UPI ID. It performs format validation only; it does not verify ownership, account status or payment capability.
- The homepage supports UPI ID, optional payee name, amount and note. The standalone widget accepts a UPI ID split into username and provider fields.
- The values are used in page memory and rendered with DOM text operations/canvas. The generated PNG is downloaded by the visitor when requested.
- The application source contains no request that submits these QR fields to a UPI QR Studio endpoint. No app backend, QR database or server-side QR-generation API is present in this repository.
- The current QR generator JavaScript does not write values to cookies, localStorage, sessionStorage or IndexedDB. This does not control browser autofill, session restoration, extensions, screenshots or downloaded files.

### Hosting, network and third-party services

- The site is configured as a static GitHub Pages website. GitHub states that visitor IP addresses are logged and stored for security purposes when a Pages site is visited, whether or not the visitor is signed in. The site operator cannot inspect GitHub's internal logs or set their retention. See the [GitHub Pages data collection disclosure](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection).
- The QR library is now bundled at `assets/vendor/qrcode.min.js`; the QR pages no longer request it from cdnjs. Its upstream MIT license is retained beside the file. This removes that third-party runtime script request from the QR workflow.
- The reviewed application JavaScript does not call `fetch`, XMLHttpRequest, `sendBeacon`, WebSocket, EventSource, or another external API. No external analytics SDK, tracking pixel, advertising script, Google Tag Manager, or consent-management script is active in the reviewed build.
- External hyperlinks to banks, regulators, help pages and other websites are opened only when a visitor chooses to follow them. Their destination services apply their own practices.
- No application-controlled cookie, localStorage, sessionStorage or IndexedDB code was found. No consent banner or CMP is currently installed.

### Contact form and personal information

- The Contact Us form creates a `mailto:` URL in the visitor's browser. It does not POST form fields to a website endpoint or persist them in a site database.
- The visitor's name, reply email, topic and message remain in the prepared email until the visitor chooses to send it. If sent to the published address `rsbusinesses0@gmail.com`, the site operator receives the message in that mailbox and may read it and reply. The mailbox provider also processes and stores it under its own terms and settings.
- The repository does not establish a fixed mailbox retention period. The operator must decide and document an appropriate retention practice and apply the mailbox provider's controls.
- GitHub Pages visitor IP logging is a form of personal-data processing by the hosting platform. Contact messages can also contain personal information when a visitor elects to send one. Do not describe the website as collecting no personal information.

### Cookies, analytics, advertising and server storage

- The current application code does not set/read cookies or use browser persistent-storage APIs. GitHub's infrastructure and a visitor's browser may independently process technical information or identifiers.
- No active Google Analytics or other analytics instrumentation was found in the audited source/build.
- The configured `adsenseClientId` is blank. AdSense's script loader and generated `ads.txt` are therefore not active in this development configuration.
- The website has no application backend or database. GitHub Pages does retain visitor IP logs as described above. A sent contact message is held in the recipient mailbox under its provider/operator controls.

## 2. Policy-page audit

| Page | Audit result |
| --- | --- |
| Privacy Policy | Existing page was comprehensive but described the CDN as active and treated host logging too generally. Updated to distinguish browser-local QR fields, GitHub IP logs, email enquiries, inactive analytics/ads, browser storage and the absent CMP. |
| Terms and Conditions | Existing terms correctly described QR limitations and local processing. Updated third-party and technical-information provisions to match the bundled library and current host/logging and contact-email flows. Governing-law and liability clauses still need counsel review. |
| Contact Us | Static `mailto:` workflow confirmed. Updated the page to explain that only a visitor-sent email reaches the operator mailbox and that retention depends on mailbox controls. |
| About Us | Describes the independent tool and educational purpose. It does not identify a legal owner or business form; no legal entity was invented. |
| Safety Center | Covers UPI payment fraud and user security. It is not a technical application-security statement; this audit is separately recorded here. |

## 3. Implemented improvements

1. Bundled QRCode.js locally and retained the upstream MIT license. QR generation no longer needs a separate cdnjs script request.
2. Added a clear privacy disclosure beside both QR forms explaining local processing and GitHub Pages IP logging, with a link to the Privacy Policy.
3. Revised the Privacy Policy and Terms to reflect verified current behaviour, not hypothetical analytics or advertising as if active.
4. Revised the Contact page and privacy disclosures to explain that an email is received by the operator only after the visitor chooses to send it.
5. Added `adsenseConsentConfigurationVerified: false` to configuration. The build now inserts the AdSense loader and creates `ads.txt` only when both a valid publisher ID and this explicit owner attestation are present. This is a fail-closed release gate, not a CMP, not proof of certification, and not an automated test of the publisher account.
6. Added `npm run check:privacy` as a privacy/security regression check for third-party scripts, local QR assets, browser storage/network/unsafe-HTML APIs, visible disclosure and the AdSense gate.

## 4. Security review

### Findings and fixes

- **Third-party runtime dependency:** The QR generator originally loaded QRCode.js from cdnjs. Replaced that script dependency with a local vendor asset; upstream MIT license is included.
- **User input and DOM operations:** The reviewed QR and contact scripts use text assignment, DOM node creation/replacement and canvas; no unsafe `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval` or dynamic `Function` use was found.
- **Network and browser storage:** No application-level network API use, cookie access, localStorage, sessionStorage or IndexedDB use was found in the reviewed `js/` files.
- **Forms:** QR forms are processed locally. The contact form prepares a `mailto:` draft and does not submit to a site endpoint.
- **External links:** The audited pages use HTTPS for their explicit external links. Visitors should still inspect destinations before sharing information.
- **Credentials and permissions:** No embedded publisher ID, secret API credential or unnecessary sensitive-browser permission request was found. The contact email is public site-contact information, not an authentication secret.
- **HTTPS and mixed content:** The canonical site origin is configured as HTTPS; source asset URLs are relative/local after this change. The current config does not establish the public deployment's TLS state, DNS, redirects or every upstream response; verify those at deployment.
- **Content Security Policy/security headers:** No restrictive CSP or custom response headers were added. GitHub Pages static hosting does not provide an application-level header configuration in this repository, and a premature CSP could break inline JSON-LD or future integrations. Header-level CSP/HSTS and related controls need hosting-layer planning and deployment testing rather than a risky meta-policy change.
- **Residual dependency risk:** A local copy removes the CDN fetch but does not make third-party source code risk-free. Keep its provenance/license, review updates, and run dependency/security scans when changing it.

## 5. Google advertising-consent requirements

As of 8 November 2026, Google requires publishers using AdSense, Ad Manager or AdMob to use a **Google-certified CMP integrated with the IAB Transparency and Consent Framework (TCF)** when serving **personalized ads** to users in the EEA, UK or Switzerland. The relevant Google enforcement dates (16 January 2024 for EEA/UK and 31 July 2024 for Switzerland) have passed. Traffic without an eligible certified CMP is not eligible for personalized ads. Google's CMP certification assessment is not a certification of the publisher's full compliance with GDPR, ePrivacy or other applicable law.

Google's Privacy & Messaging European regulations message is an available Google-managed route; Google says those messages support IAB TCF v2.4. The IAB TCF v2.4 mandatory implementation deadline of 23 October 2026 has also passed. Alternatively, choose a current Google-certified third-party CMP from the live Google list. Re-check that list and current product compatibility at launch.

This is not a blanket statement that every advertising mode or every visitor requires the same CMP. Cookie/local-storage consent obligations under ePrivacy/GDPR can apply independently where legally required. A privacy policy, a generic home-made banner, or the build flag in this repository is not a substitute for a configured consent platform and a tested consent signal.

**Current state:** No publisher ID, ad loader, `ads.txt`, CMP or consent interface is active in the current configuration. The site should remain non-advertising until the actual publisher account, target audience, ad mode, privacy disclosures and required consent flow are configured and tested.

## 6. India DPDP transition dates

The official commencement notification G.S.R. 843(E), dated 13 November 2025, phases the Digital Personal Data Protection Act, 2023:
- Specified institutional and definitional provisions commenced on 13 November 2025.
- Section 6(9) and section 27(1)(d) are scheduled to commence on 13 November 2026.
- Sections 3–5, section 6 (other than subsection (9)), sections 7–17 and the other listed provisions are scheduled to commence eighteen months after publication, on **13 May 2027**.

The Digital Personal Data Protection Rules, 2025, G.S.R. 846(E), likewise phase commencement:
- Rules 1, 2 and 17–21 commenced on publication.
- Rule 4 (registration and obligations of a statutory **Consent Manager**) is scheduled to commence on **13 November 2026**.
- Rule 3 (the notice to a Data Principal) and rules 5–16, 22 and 23 are scheduled to commence on **13 May 2027**.

Rule 4 governs registration and duties of the separately defined statutory Consent Manager. It is not a general requirement for every website to become a Consent Manager or install a generic cookie banner. This statutory concept is distinct from Google's ad-tech CMP requirement. The operator should have an Indian privacy professional assess the website's role, the treatment of hosting IP logs and contact-mailbox data, and the notice/consent workflow before the DPDP operational provisions take effect.

Official instruments:
- [G.S.R. 843(E) — DPDP Act commencement notification (e-Gazette PDF)](https://egazette.gov.in/WriteReadData/2025/267647.pdf)
- [G.S.R. 846(E) — Digital Personal Data Protection Rules, 2025 (MeitY Gazette PDF)](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)

## 7. Owner and legal information still required

The repository contains a public contact email and identifies the project/brand as UPI QR Studio / RS Businesses, but it does not establish the legal identity or legal form of the operator. Before production/legal reliance, the owner must decide and provide to counsel:

- The full legal name of the person or entity that operates the site, and whether “RS Businesses” is a trade name, sole proprietorship, partnership, company or other form.
- The appropriate business/registered/contact address for formal notices, if applicable. No address has been invented or added.
- The intended governing law and any proposed court or dispute venue. Existing Terms defer to competent forums and explicitly require legal review before selecting exclusive jurisdiction.
- A mailbox handling and deletion/retention practice for visitor-sent contact emails; the repository does not know the provider's backup/retention settings.
- Confirmation that `rsbusinesses0@gmail.com` is the monitored privacy/contact mailbox and that the person operating it is authorised to receive and answer requests.
- Intended advertising products, personalization mode, target countries/regions and approximate traffic distribution. Those facts determine the consent setup; no publisher identity or ad configuration was invented.
- A qualified review of the Privacy Policy, Terms, data-fiduciary disclosures, child-facing risk and liability clauses before deployment. This report and policy text are not certified legal advice.

## 8. Verification status

The repository adds `npm run check:privacy`. The existing GitHub Actions workflow also runs dependency audit, JavaScript syntax checks, build, reproducibility, site, content, SEO and packaging checks. Results must be reported after the `development` commit triggers the workflow; a source review is not a substitute for a successful CI run.

## Readiness

The revised development source is more accurately disclosed and reduces the QR tool's third-party script requests. Advertising is deliberately disabled pending a verified publisher setup and suitable CMP where required. Production-readiness still depends on live-site verification, owner-supplied legal details, mailbox-retention decisions and qualified legal review.
