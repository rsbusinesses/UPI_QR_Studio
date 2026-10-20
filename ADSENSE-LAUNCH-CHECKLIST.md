# Google AdSense launch checklist

The site template does not contain a fake publisher ID, sample ad units, or active advertising code. Connect the website only with the real code supplied in your own AdSense account and after your site has a stable public URL.

## Before applying

- [ ] **Choose a domain AdSense can accept.** Google's signup guidance requires a standard domain without a path. A GitHub Pages project URL such as `username.github.io/repository` includes a path; connect a custom domain you own to GitHub Pages for a clearer AdSense setup, and verify eligibility in your account. See https://support.google.com/adsense/answer/2784438.
- [ ] Publish the complete site over HTTPS and verify that all pages are complete, usable and accessible without login.
- [ ] Replace `contactEmail` in `site-config.json` with an email address you monitor.
- [ ] Replace `siteUrl` with the actual GitHub Pages base URL or custom-domain HTTPS origin, then run `npm run build`.
- [ ] Test all navigation links, nested article links, QR generation/download, mobile menu, contact email preparation and browser-console/network errors.
- [ ] Read the Privacy Policy and Terms pages and make sure they accurately describe how the live site actually works. If analytics, cookies, a third-party form, or other integrations are added later, update the policy before enabling them.
- [ ] Review every article for originality, accuracy, readability, current official sources, and value beyond generic or repeated advice. Remove or improve pages that are incomplete or too thin to help a reader.
- [ ] Verify claims about UPI limits, features, eligibility, biometrics, AutoPay, UPI Circle, supported providers and complaint processes against current official sources and the relevant banks/apps. Do not treat example values as universal limits.
- [ ] Add a useful About page, functional contact route, clear navigation and a valid 404 page; recheck footer/legal links.
- [ ] Check the website's eligibility and current policies inside your own AdSense account. Acceptance is determined by Google, not by this repository.

## Add your AdSense code centrally

Once AdSense gives you your publisher client ID (in the form `ca-pub-` plus 16 digits), enter that complete value in `adsenseClientId` in `site-config.json` and rebuild the website. The Node.js builder inserts Google's official loader snippet into each page's `<head>` and creates the root `ads.txt` line using the same ID. Do not put a sample or someone else's ID there. Keep the field blank until you have the real ID and need to connect the site.

The generated `ads.txt` entry is `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`. Verify that it is publicly reachable at `/ads.txt` after deploying. Google's AdSense guidance describes ads.txt as highly recommended, but it is not universally mandatory for every site status.

## Privacy and consent

If you serve personalized ads to users in regions where Google requires a consent management platform (for example, the EEA, UK and Switzerland), configure a Google-certified CMP that meets Google's current requirements. Do not represent a consent banner as compliant until the actual CMP has been configured and tested. Review Google's current publisher and consent policies before enabling advertising.

## After publication

- [ ] Visit the public site URL and confirm the account code is present only if intentionally configured.
- [ ] Confirm `/robots.txt`, `/sitemap.xml`, and, after configuring a real publisher ID, `/ads.txt` return successfully.
- [ ] Add and verify the site in AdSense using the method shown in the account.
- [ ] Request review when the AdSense account indicates all required steps are complete.
- [ ] Wait for Google to make its review decision. Do not add ad units to interfere with tools, navigation, downloads or content.
- [ ] Recheck performance, mobile usability, policy notices and accidental clicks after ads begin serving.

## Official references

- AdSense site readiness: https://support.google.com/adsense/answer/7299563
- AdSense eligibility: https://support.google.com/adsense/answer/9724
- Connect your site: https://support.google.com/adsense/answer/7584263
- Ads.txt guidance: https://support.google.com/adsense/answer/12171612
- Google consent requirements: https://support.google.com/adsense/answer/13554116
