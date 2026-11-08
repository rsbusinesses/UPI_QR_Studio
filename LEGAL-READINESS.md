# Phase 5 — Privacy, legal and user-trust readiness

Audit date: 8 November 2026  
Branch: `development`

## Current implementation findings

- The homepage and standalone QR widget generate QR content in the browser. The QR generator code does not submit UPI form fields to a UPI QR Studio application server.
- The standalone QR widget's validation is syntactic; it does not prove that a UPI ID exists or belongs to the intended recipient.
- The QR pages request the QRCode.js library from `cdnjs.cloudflare.com`. This external CDN delivery is now described in the Privacy Policy and Terms.
- No Google Analytics tag was found in the development HTML/source inspected.
- The development configuration has an empty AdSense publisher ID, no generated `ads.txt`, and no AdSense loader in its HTML pages. AdSense is not enabled by this development configuration.
- No CMP or consent banner is currently implemented in the development code.
- The contact page uses the configured email address and an email-client `mailto:` flow. It does not submit form data to a server.
- The displayed contact address matches `site-config.json`.
- The Contact Us form uses a `mailto:` flow; its fields are placed into an email draft rather than posted to the website server.
- The site is configured for GitHub Pages hosting, and the Privacy Policy links to GitHub's General Privacy Statement for the host's own data practices.
- The source repository is publicly accessible; the Privacy Policy was corrected so it no longer suggests the repository may be private.

## Changes made

1. Updated the Privacy Policy date to 8 November 2026.
2. Clarified which third-party services are and are not enabled in the current website build.
3. Disclosed the QRCode.js request to cdnjs and the technical request information that the CDN may receive.
4. Corrected the GitHub repository privacy description.
5. Clarified Google's CMP requirement: publishers serving personalized Google ads to users in the EEA, UK or Switzerland must use a Google-certified CMP integrated with the IAB Transparency and Consent Framework.
6. Updated the Terms date and added a pre-advertising consent configuration requirement and Google documentation link.

## Consent-management assessment

Google's publisher guidance states that a Google-certified CMP integrating with the IAB TCF is required when serving personalized ads to users in the EEA, the UK and Switzerland. A CMP is not installed in this development build. Selecting, configuring and testing a CMP remains a **BLOCKED** pre-advertising task because the publisher account, target advertising configuration and actual traffic distribution have not been verified.

This assessment does not state that a CMP is universally required for every visitor or every ad mode. Applicable privacy and cookie laws may impose additional requirements depending on visitor location and the actual technologies used. Google's certification does not itself certify compliance with all privacy laws.

## Human/legal review still required

- Have the Privacy Policy and Terms reviewed by a qualified Indian legal professional before production release. The Terms themselves note that governing-law and liability clauses should be reviewed.
- Confirm the actual deployed site's scripts, hosting provider, logs, cookie/local-storage behavior and any future analytics/advertising configuration before treating the Privacy Policy as a statement of live behavior.
- If AdSense is later activated, obtain the verified publisher ID, configure the correct loader and ads.txt through the central build process, determine whether a CMP is required for the actual audience/ad configuration, and test consent choices before enabling relevant ads.
- Do not publish a statement that a consent mechanism is active until the live page and saved choices have been tested.
- Keep contact details and service descriptions synchronized with actual behavior.

## Readiness

The repository's current development version has accurate technical disclosures for the reviewed implementation, but these pages are not legal advice and have not been reviewed by counsel. CMP deployment, publisher-specific configuration and final production-state verification remain pending.
