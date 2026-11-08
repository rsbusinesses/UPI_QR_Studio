'use strict';

const GOOGLE_ADS_TXT_AUTHORITY_ID = 'f08c47fec0942fa0';
const ADSENSE_LOADER_ORIGIN = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

const BLOCKED_ADSENSE_PAGES = new Set([
  'index.html',
  '404.html',
  'pages/about-us.html',
  'pages/contact-us.html',
  'pages/privacy-policy.html',
  'pages/qr-widget.html',
  'pages/safety-center.html',
  'pages/terms-and-conditions.html',
  'pages/upi-faqs.html',
  'pages/upi-guide-topics.html',
  'pages/upi-guide.html',
  'pages/upi-guides.html',
  'pages/upi-id-providers.html'
]);

function getAdSenseState(config = {}) {
  const clientId = String(config.adsenseClientId || '').trim();
  const publisherMatch = /^ca-pub-(\d{16})$/.exec(clientId);
  const publisherDigits = publisherMatch ? publisherMatch[1] : '';
  const publisherId = publisherDigits ? 'pub-' + publisherDigits : '';

  const adsTxtRecord = String(config.adsenseAdsTxtRecord || '').trim().replace(/\s+/g, ' ');
  const adsTxtMatch = /^google\.com,\s*pub-(\d{16}),\s*(DIRECT|RESELLER),\s*([a-f0-9]{16})$/i.exec(adsTxtRecord);
  const adsTxtRecordMatchesPublisher = Boolean(
    adsTxtMatch &&
    publisherDigits &&
    adsTxtMatch[1] === publisherDigits &&
    adsTxtMatch[3].toLowerCase() === GOOGLE_ADS_TXT_AUTHORITY_ID
  );

  const publisherIdVerified = config.adsensePublisherIdVerified === true;
  const adsTxtRecordVerified = config.adsenseAdsTxtRecordVerified === true;
  const siteReviewApproved = config.adsenseSiteReviewApproved === true;
  const consentConfigurationVerified = config.adsenseConsentConfigurationVerified === true;
  const activationAuthorized = config.adsenseActivationAuthorized === true;
  const configuredMode = String(config.adsenseMode || 'disabled');
  const modeValid = configuredMode === 'disabled' || configuredMode === 'auto';
  const mode = configuredMode === 'auto' ? 'auto' : 'disabled';

  const eligiblePages = new Set(
    Array.isArray(config.adsenseEligiblePages)
      ? config.adsenseEligiblePages.filter((value) =>
          typeof value === 'string' &&
          /^pages\/upi-guides\/[a-z0-9-]+\.html$/i.test(value) &&
          !value.split('/').includes('..') &&
          !BLOCKED_ADSENSE_PAGES.has(value)
        )
      : []
  );

  const canPublishVerificationMeta = Boolean(
    publisherMatch &&
    publisherIdVerified &&
    config.adsenseVerificationMetaTagEnabled === true
  );

  // The exact seller relationship line must be copied from the signed-in
  // publisher account. The build never guesses DIRECT or RESELLER.
  const canWriteAdsTxt = Boolean(
    publisherMatch &&
    publisherIdVerified &&
    adsTxtRecordVerified &&
    adsTxtRecordMatchesPublisher
  );

  // Ad code is a separate release decision. A publisher ID alone can never
  // activate ads, and a site-verification meta tag is not an ad loader.
  const canLoadAds = Boolean(
    canWriteAdsTxt &&
    siteReviewApproved &&
    consentConfigurationVerified &&
    activationAuthorized &&
    mode === 'auto'
  );

  const reasons = [];
  if (!publisherMatch) reasons.push('a valid ca-pub publisher ID is not configured');
  if (!publisherIdVerified) reasons.push('the publisher ID has not been verified against the AdSense account');
  if (!adsTxtRecordVerified || !adsTxtRecordMatchesPublisher) reasons.push('the exact account-provided ads.txt seller line has not been verified');
  if (!siteReviewApproved) reasons.push('the AdSense site status is not attested as Ready');
  if (!consentConfigurationVerified) reasons.push('the consent and regional privacy setup is not attested as verified');
  if (!activationAuthorized) reasons.push('the owner has not explicitly authorized advertising activation');
  if (!modeValid) reasons.push('adsenseMode must be disabled or auto');
  else if (mode !== 'auto') reasons.push('adsenseMode is not set to auto');

  return {
    clientId,
    publisherId,
    publisherDigits,
    adsTxtRecord,
    publisherIdVerified,
    adsTxtRecordVerified,
    adsTxtRecordMatchesPublisher,
    siteReviewApproved,
    consentConfigurationVerified,
    activationAuthorized,
    mode,
    modeValid,
    eligiblePages,
    canPublishVerificationMeta,
    canWriteAdsTxt,
    canLoadAds,
    reasons
  };
}

function isAdSenseEligiblePage(relativePath, state) {
  if (!state || !state.eligiblePages || BLOCKED_ADSENSE_PAGES.has(relativePath)) return false;
  return state.eligiblePages.has(relativePath);
}

function adSenseLoaderUrl(clientId) {
  return ADSENSE_LOADER_ORIGIN + '?client=' + encodeURIComponent(clientId);
}

module.exports = {
  GOOGLE_ADS_TXT_AUTHORITY_ID,
  ADSENSE_LOADER_ORIGIN,
  BLOCKED_ADSENSE_PAGES,
  getAdSenseState,
  isAdSenseEligiblePage,
  adSenseLoaderUrl
};
