# Google AdSense launch checklist

The current development configuration has no AdSense publisher ID, ad loader, ad units, generated `ads.txt`, or active CMP. Do not enable advertising until the account, privacy disclosures, audience, ad products and any required consent platform have been configured and tested.

## Before applying

- [ ] **Confirm site eligibility and domain.** Verify the site's exact domain and ownership requirements in your AdSense account. A GitHub Pages project URL containing a path may not meet Google's normal domain setup expectations; consider a custom domain you control and verify eligibility directly with Google.
- [ ] Publish the complete site over HTTPS and verify that all pages are usable and accessible without login.
- [ ] Confirm `siteUrl` in `site-config.json`, rebuild, and verify canonical URLs and the sitemap.
- [ ] Confirm that `rsbusinesses0@gmail.com` is a monitored contact address and that privacy requests can be received and handled.
- [ ] Review the Privacy Policy and Terms against the deployed scripts, hosting, server logs, forms, browser storage, analytics and advertising setup before applying.
- [ ] Review article accuracy, originality, usefulness, and current official sourcing. Do not assume AdSense acceptance from passing repository checks.
- [ ] Check the domain and publisher account's actual eligibility in AdSense.

## Add AdSense only after the consent setup is ready

The site builder supports a publisher client ID in `adsenseClientId` and an explicit owner-controlled boolean `adsenseConsentConfigurationVerified` in `site-config.json`.

**Both conditions must be true** before the builder inserts Google's official AdSense loader or generates the root `ads.txt` file:
1. `adsenseClientId` contains your own valid `ca-pub-` value followed by 16 digits.
2. `adsenseConsentConfigurationVerified` is set to `true` by the owner only after the actual consent configuration has been deployed and tested for the real ad products and audience.

The flag is a **manual release attestation only**. It does not install a CMP, test a CMP, validate your publisher account, guarantee legal compliance, or independently verify Google certification. The default is `false`; keep it false until the checks below are complete. Entering a publisher ID alone does not enable ads.

## Consent requirements — Google publisher products

Google's current publisher policy requires a **Google-certified CMP integrated with the IAB Transparency and Consent Framework (TCF)** when serving **personalized** AdSense, Ad Manager or AdMob ads to users in the European Economic Area, the United Kingdom or Switzerland. The EEA/UK and Swiss enforcement dates have passed. Traffic without an eligible certified CMP is not eligible for personalized ads.

Recommended implementation path:
- Use the **European regulations message in Google AdSense Privacy & Messaging** if the account/product supports the required web deployment, and configure the message, purposes, vendors, legitimate-interest/consent choices and revocation path for your actual processing.
- Google says its Privacy & Messaging European regulations messages support **IAB TCF v2.4**. The IAB's mandatory implementation date, **23 October 2026**, has passed. Confirm that the current published message and any selected CMP implement the version currently required.
- Alternatively, select a web CMP from Google's live certified CMP list. Check current certification, TCF integration, supported geography and product compatibility immediately before launch.
- A self-built banner is not enough for the Google personalized-ad requirement unless the publisher's solution has completed Google's CMP certification and satisfies TCF integration.
- Test consent choices, rejection, customization, revocation, vendor signals and the actual network requests in clean browser sessions. Verify relevant ad/analytics storage and tags do not run before required choices.
- Update the Privacy Policy and any other notices before enabling tags. Do not say the site is compliant merely because a certified CMP is selected; the publisher remains responsible for applicable privacy laws.

Google's CMP rules are specifically tied to personalized publisher ads in those regions; they do not mean every visitor or every ad format universally requires the same CMP. EU ePrivacy/GDPR requirements for cookies/local storage and data use can apply independently where legally required.

Official Google references:
- [Google AdSense: CMP requirements for publishers serving ads in the EEA, UK and Switzerland](https://support.google.com/adsense/answer/13554116?hl=en)
- [Google AdSense: European regulations messages and TCF v2.4](https://support.google.com/adsense/answer/10961068?hl=en)
- [Google AdSense: European regulations message FAQs and CMP choices](https://support.google.com/adsense/answer/11546682?hl=en)

## India DPDP readiness

The Digital Personal Data Protection Act, 2023 and Rules, 2025 have a phased commencement schedule. The statutory Consent Manager registration rule (Rule 4) is scheduled for 13 November 2026; the main Data Fiduciary provisions including sections 3–17 of the Act and Rule 3 (notice) are scheduled for 13 May 2027. Rule 4 governs statutory Consent Managers and is not a general requirement for every website to install a generic cookie banner or become a Consent Manager.

Before those main provisions take effect, seek Indian legal advice on the operator's role and the notice/consent, contact, rights, security and breach procedures relevant to actual personal-data processing. Account for GitHub Pages IP logging and any personal information received in the operator's contact mailbox. See the official [Act commencement notification G.S.R. 843(E)](https://egazette.gov.in/WriteReadData/2025/267647.pdf) and [Rules G.S.R. 846(E)](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf).

## Ads.txt and deployment tests

When both configuration conditions are satisfied, the build generates an ads loader and an `ads.txt` line in the format `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`. Verify the actual publisher identifier and that `/ads.txt` is publicly reachable after deployment.

After publication:
- [ ] Verify the actual deployed HTML and network requests, not only the repository source.
- [ ] Confirm the AdSense loader is absent until the consent setup is complete and the owner has deliberately enabled the gate.
- [ ] Confirm privacy message is displayed to the intended regions and that user choices are respected on every page.
- [ ] Verify `/robots.txt`, `/sitemap.xml`, and, when enabled, `/ads.txt`.
- [ ] Re-test QR generation/download, navigation, mobile layout, console and network failures.
- [ ] Recheck consent, mobile usability, layout, policy notices and accidental-click risks after ads begin serving.

## Other setup information

- Keep the publisher ID blank until Google's account supplies the real ID.
- Confirm the actual legal operator identity, legal address and jurisdiction with counsel; do not invent these in public legal pages.
- Decide a proportionate retention process for visitor-sent contact emails and make sure the published contact mailbox is monitored.
- These checks are operational safeguards, not a guarantee of account approval or legal compliance.
