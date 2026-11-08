# Google AdSense readiness and implementation — UPI QR Studio

Audit date: 8 November 2026  
Branch: `development`  
Site: https://upiqrstudio.com/

## 1. Existing implementation audit

The source audit covered all 23 HTML documents (22 indexable pages and the noindex 404), shared header/footer, application scripts, site builder, public-artifact packager, site configuration and GitHub Actions workflows.

| Item | Finding |
| --- | --- |
| Existing AdSense loader | None active in the audited branch |
| Publisher IDs | No `ca-pub-` identifier configured or embedded |
| Ad-unit code / slot IDs | None found |
| Duplicate loader scripts | None found |
| Multiple publisher IDs | None found |
| Build-time ad behavior | The earlier builder removed and conditionally injected a loader based on a two-flag gate. This phase replaces it with separate account, site-review, consent, seller-record and owner-authorization gates. |
| Existing `ads.txt` | No root `ads.txt` file in the audited branch tree |
| Generated/deployed `ads.txt` | No record generated in this branch; live URL was not independently fetched by this audit environment |
| QR-generator interference | No advertising code or slots in either QR tool; both tools use local QRCode.js |
| Old insertion comments | The builder previously added an inert “ADSENSE INSERTION POINT” comment to each HTML head. The revised builder removes these comments; they are not ad code. |

No account-specific code was blindly deleted. The existing active integration point was the central builder and its blank configuration. No Google AdSense account connection or publisher ID was available in this work session. The repository's `adsenseClientId` remains blank; no ID or seller relationship was fabricated.

## 2. Controlled architecture now implemented

### One central configuration

All AdSense settings live in `site-config.json`. Defaults are deliberately disabled:

- `adsenseClientId`: blank until copied from the actual account's official Auto ads code.
- `adsensePublisherIdVerified`: false until the ID is checked against the signed-in account.
- `adsenseVerificationMetaTagEnabled`: false; optional ownership verification only, not an ad loader.
- `adsenseAdsTxtRecord`: blank until the exact seller line is copied from the account.
- `adsenseAdsTxtRecordVerified`: false until that exact line is checked against the account.
- `adsenseSiteReviewApproved`: false until AdSense reports the site as Ready.
- `adsenseConsentConfigurationVerified`: false until the actual visitor-geography, ad-mode and consent setup is reviewed and tested.
- `adsenseActivationAuthorized`: false; the owner must deliberately authorize advertising.
- `adsenseMode`: `disabled` by default; `auto` is the only serving mode supported here.
- `adsenseEligiblePages`: an allowlist of long-form editorial UPI guides.

Shared validation lives in `tools/adsense-config.js`. It validates the publisher ID, checks that the account-provided `ads.txt` record belongs to that publisher, and computes separate permissions for site verification, `ads.txt` publication and advertising activation.

### Site ownership verification without loading ads

Google supports a `google-adsense-account` meta-tag verification method as an alternative to the AdSense code snippet. When the owner has entered a verified publisher ID and explicitly enabled `adsenseVerificationMetaTagEnabled`, the builder adds that meta tag to the homepage only. This tag does not load advertising scripts and does not itself show ads.

Use the meta-tag method when it is offered in the authenticated account and you want to request site review without putting an ad-serving script on the QR or other non-ad pages. Verify that the deployed page is recognized by AdSense before requesting review.

### Exact account-provided ads.txt record

The builder does **not** invent `DIRECT`, `RESELLER`, or a publisher identifier. It writes `/ads.txt` only after:
1. A valid publisher ID is configured and marked verified.
2. The exact seller line copied from the authenticated account is supplied.
3. The owner attests that the line was checked against that account.

The line must use Google's seller domain, the same 16-digit publisher ID, a relationship type present in the account-provided line, and Google's current certification authority ID. The build accepts the account-copied `DIRECT` or `RESELLER` relationship; it does not choose one. If the ID or seller line is blank, invalid, mismatched or unverified, any stale `ads.txt` is removed rather than shipped.

### Advertising activation gate

The loader is inserted only when **all** of these are true:
- Valid and verified publisher ID.
- Exact account-provided `ads.txt` line verified.
- AdSense site review status is Ready.
- The real consent/regional configuration has been reviewed and tested.
- The owner has explicitly authorized activation.
- `adsenseMode` is `auto`.

Before each build, the builder removes any previous AdSense loader so repeated builds cannot duplicate it. When enabled, it uses Google's standard asynchronous Auto ads script format with the configured `ca-pub-` ID. This implementation does not create ad-unit slots or manually insert `adsbygoogle.push()` code. Manual ad units require account-created slot IDs and a separate implementation; none are invented here.

## 3. Placement plan

The prepared allowlist includes only nine long-form editorial articles:

- Biometric authentication
- Cash deposit and withdrawal services
- Conversational payments
- Onboarding and account activation
- Transaction rules and merchant payments
- UPI AutoPay and recurring payments
- UPI Circle and delegated payments
- UPI ID and number guide
- User safety and daily limits

The loader is explicitly blocked from the homepage and standalone QR widget, 404, Contact, About, Safety Center, Privacy Policy, Terms, FAQ/filter page, UPI provider directory, and guide-navigation landing pages. This keeps ad code away from QR input, generate/download controls, interactive filters, emergency fraud guidance, legal notices and navigation-only screens.

No ad units or visual ad placeholders were added. When Auto ads is eventually configured in the Google account, review the live layout on desktop and mobile. Disable intrusive or overlay formats if they obscure content or controls. Google ads must be clearly distinguishable from site content and must not resemble navigation, download or QR-generation controls.

## 4. Publisher ID and account status

**Current status: not supplied and not authenticated.** No Google AdSense account was connected or read in this task.

To obtain and configure the ID:
1. Sign in to the Google account that owns the AdSense account.
2. In AdSense, open **Account → Settings → Account information** to view the publisher ID, displayed as `pub-1234567890123456`.
3. For the website loader, use the actual `ca-pub-1234567890123456` value in the official Auto ads code snippet from **Ads → Get code**. Do not guess the identifier or use a sample.
4. Only after checking that code against the account, enter it into `adsenseClientId` and set `adsensePublisherIdVerified` to true.

Before activation:
- Add `https://upiqrstudio.com` on the AdSense **Sites** page.
- Verify ownership using a method offered in the account. Prefer the homepage meta-tag method if it is available and you want to avoid loading the ad-serving script during verification. Set `adsenseVerificationMetaTagEnabled` to true only after configuring the real verified ID.
- Request review and wait for Google to mark the site **Ready**. A repository build or passing automated test does not establish approval.
- Complete the account setup and any identity/payment verification request shown in the account. Google states that identity verification may be required from June 2026 before ads can start serving.
- Copy the exact seller line from the site's AdSense ads.txt status page into `adsenseAdsTxtRecord`; verify that it contains your publisher ID and the relationship shown by Google, then set `adsenseAdsTxtRecordVerified` to true.
- After reviewing consent and page placement, set `adsenseSiteReviewApproved`, `adsenseConsentConfigurationVerified`, and `adsenseActivationAuthorized` to true, and change `adsenseMode` to `auto`. Those final settings are intentionally not enabled in this commit.

Never put the Google account password, recovery codes or payment credentials in the repository or chat.

## 5. Consent and privacy dependencies

Google requires a CMP certified by Google and integrated with the IAB Transparency and Consent Framework (TCF) when serving **personalized** AdSense, Ad Manager or AdMob ads to users in the EEA, UK or Switzerland. The EEA/UK enforcement date (16 January 2024) and Switzerland date (31 July 2024) have passed. Traffic without an eligible certified CMP is not eligible for personalized ads. Google's certification assessment is not a determination of the publisher's complete legal compliance.

### Current TCF implementation version and timeline

Google's AdSense publisher integration guidance states that newly created TCF consent strings must use **TCF v2.3 or later** from 1 March 2026. Google Privacy & Messaging European-regulations messages have also been updated to support **TCF v2.4**. Separately, IAB Europe confirmed that TCF Specifications v2.4 and the Global Vendor List update were published on 23 July 2026, with a **23 October 2026** deadline for CMPs to implement the new disclosures in web environments. That web CMP deadline has passed as of this audit. A selected CMP's current web implementation should therefore meet the latest applicable TCF policies/specification, not merely be listed as Google-certified at some earlier date.

Recommended path: configure the Google Privacy & Messaging European-regulations message or choose a currently Google-certified web CMP. Check both Google's current certified CMP list and the selected CMP's confirmation that its deployed web integration implements the current IAB TCF disclosures and string version required by Google. Test consent, rejection, customization and withdrawal in clean browser sessions. Other applicable privacy/cookie laws can require choices independently. A plain banner or this build's boolean flag is not a CMP and does not establish compliance.

The current Privacy Policy says AdSense is not active and the current site build has no ad/analytics tags. Keep that disclosure while ads remain disabled. Before activation, update it to describe the actual Google advertising services, data recipients, personalization, cookies/identifiers, CMP, available choices and contact route. Do not claim that a consent tool is active until it is deployed and tested.

## 6. Website and policy readiness assessment

### Positive source-level signals

- The repository contains 22 intended indexable pages plus the noindex 404.
- The content audit describes distinct site purposes: two QR tools, a detailed guide index, 159 FAQs, a provider directory, a Safety Center and nine detailed UPI articles.
- The content audit records targeted rewrites of malformed and repetitive guide content.
- Navigation, About, Contact, Privacy Policy and Terms pages exist.
- The site configuration uses the custom HTTPS origin `https://upiqrstudio.com`; the build generates canonical URLs and a sitemap on that origin.
- The QR tool is functional and uses local QR library files rather than a third-party QR script request.
- The Privacy Policy describes local QR data handling and GitHub Pages visitor IP logging, and states that AdSense is currently inactive.

### Still requires account/live verification

- The live domain, DNS/HTTPS response, page rendering and crawler accessibility could not be independently fetched in this inspection environment.
- AdSense must verify site ownership and review the live content. No code or audit can guarantee a Ready decision.
- Review the AdSense Policy Center after site submission. Check whether any page or content category is restricted or disallowed.
- Recheck content originality, accuracy, user value and the ratio of substantive publisher content to ads. Avoid adding ads to pages that mainly serve navigation or a utility task.
- Verify the actual mobile/desktop Auto ads layout and page-level exclusions before serving real traffic.

## 7. Automated tests

Added `npm run check:adsense`. It checks:
- Every HTML page in the repository and packaged `dist`.
- Exactly one loader only on an eligible page when the full activation gate is true; otherwise zero.
- No loader on blocked pages.
- Duplicate or mismatched publisher IDs.
- Correct asynchronous loader attributes and configured publisher ID.
- Homepage verification meta tag only when explicitly enabled.
- No manual ad-unit markup or slot IDs in this Auto ads-only implementation.
- No obsolete insertion comments.
- Root and packaged `ads.txt` match the exact verified account line, or are both absent.

The development and production deployment workflows run this check after packaging.

## 8. Official Google references

- [Add a new site to AdSense and verify ownership](https://support.google.com/adsense/answer/12169212)
- [Get and copy the AdSense code for Auto ads or ad units](https://support.google.com/adsense/answer/9274019)
- [Find your publisher ID](https://support.google.com/adsense/answer/105516)
- [Ads.txt guide](https://support.google.com/adsense/answer/12171612)
- [Ads.txt FAQs and publisher relationship values](https://support.google.com/adsense/answer/9785052)
- [Ad placement policies](https://support.google.com/adsense/answer/1346295)
- [Google Publisher Policies](https://support.google.com/adsense/answer/10502938)
- [Publisher integration with the IAB Europe TCF — Google’s TCF v2.3 requirements](https://support.google.com/adsense/answer/9804260)
- [About European regulations messages — Google Privacy & Messaging and TCF v2.4 support](https://support.google.com/adsense/answer/10961068)
- [IAB Europe — 16 July 2026 confirmation of TCF Policies v5.0.b / Specifications v2.4 timeline](https://iabeurope.eu/wp-content/uploads/TCF_V-CMP_comms_TCFpoliciesV5.0.bAndSpecificationsV2.4ConfirmationOf-theTimeline_160726_IABEurope.pdf)
- [CMP requirements for personalized ads in EEA, UK and Switzerland](https://support.google.com/adsense/answer/13554116)
- [Complete AdSense account setup and current identity verification](https://support.google.com/adsense/answer/7402256)

## Readiness conclusion

The development branch is configured for controlled future AdSense integration, but it is **not connected to a verified publisher account, not site-approved, and not serving ads**. The real publisher ID, account-copied ads.txt line, account/site status, consent configuration and explicit owner authorization remain outstanding. AdSense acceptance is determined by Google and is not guaranteed by this work.
