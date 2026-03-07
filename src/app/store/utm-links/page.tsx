'use client';

import { useState } from 'react';
import StoreLayout from '@/components/store/StoreLayout';
import { useStoreAuth } from '@/contexts/StoreAuthContext';

export default function StoreUTMLinksPage() {
  const { vendor } = useStoreAuth();
  const [copied, setCopied] = useState<string | null>(null);

  const vendorSlug = vendor?.name?.toLowerCase().replace(/\s+/g, '-') || 'your-store';
  const vendorDomain = vendor?.website_url || `https://${vendorSlug}.com`;

  // Pre-built UTM links
  const utmLinks = [
    {
      id: 'homepage',
      label: 'Homepage link',
      description: 'Link to your store listing on nicotine-pouches.org',
      url: `https://nicotine-pouches.org/vendor/${vendorSlug}?utm_source=${encodeURIComponent(vendorDomain.replace(/https?:\/\//, ''))}&utm_medium=website&utm_campaign=vendor-badge`,
    },
    {
      id: 'compare',
      label: 'Compare page link',
      description: 'Link to the price comparison page',
      url: `https://nicotine-pouches.org/compare?utm_source=${encodeURIComponent(vendorDomain.replace(/https?:\/\//, ''))}&utm_medium=website&utm_campaign=price-comparison`,
    },
  ];

  // Custom UTM builder
  const [customUrl, setCustomUrl] = useState(`https://nicotine-pouches.org/vendor/${vendorSlug}`);
  const [customSource, setCustomSource] = useState(vendorDomain.replace(/https?:\/\//, ''));
  const [customMedium, setCustomMedium] = useState('website');
  const [customCampaign, setCustomCampaign] = useState('');
  const [customContent, setCustomContent] = useState('');

  const buildCustomUTM = () => {
    const params = new URLSearchParams();
    if (customSource) params.set('utm_source', customSource);
    if (customMedium) params.set('utm_medium', customMedium);
    if (customCampaign) params.set('utm_campaign', customCampaign);
    if (customContent) params.set('utm_content', customContent);
    const sep = customUrl.includes('?') ? '&' : '?';
    return `${customUrl}${sep}${params.toString()}`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const vendorId = vendor?.realVendorId || 0;

  // Conversion tracking snippet — paste on ALL pages, fires only on thank-you page
  const conversionSnippet = `<!-- Nicotine Pouches Conversion Tracking -->
<script>
(function(){
  // Step 1: On any page, detect if visitor came from nicotine-pouches.org
  var p = new URLSearchParams(window.location.search);
  if (p.get("utm_source") === "nicotine-pouches.org") {
    document.cookie = "np_ref=1;path=/;max-age=2592000;SameSite=Lax";
  }
  // Step 2: On your thank-you / order-confirmation page, add this attribute
  // to any element: data-np-conversion
  // Optional: data-np-value="29.99" data-np-order-id="ORD-123"
  var el = document.querySelector("[data-np-conversion]");
  if (el && document.cookie.indexOf("np_ref=1") !== -1) {
    var v = el.getAttribute("data-np-value") || "";
    var o = el.getAttribute("data-np-order-id") || "";
    fetch("https://nicotine-pouches.org/api/conversions/track", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({vendor_id: ${vendorId}, order_value: v, order_id: o})
    });
    document.cookie = "np_ref=;path=/;max-age=0";
  }
})();
</script>`;

  const thankYouSnippet = `<!-- Add this to your thank-you / order confirmation page -->
<div data-np-conversion data-np-value="ORDER_TOTAL" data-np-order-id="ORDER_ID" style="display:none"></div>`;

  // HTML badge snippet
  const badgeSnippet = `<!-- Nicotine Pouches Price Comparison Badge -->
<a href="https://nicotine-pouches.org/vendor/${vendorSlug}?utm_source=${encodeURIComponent(vendorDomain.replace(/https?:\/\//, ''))}&utm_medium=website&utm_campaign=vendor-badge"
   target="_blank" rel="noopener"
   style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:#1d4ed8;color:#fff;border-radius:8px;text-decoration:none;font-family:sans-serif;font-size:14px;">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
  Compare our prices on Nicotine Pouches
</a>`;

  return (
    <StoreLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">UTM Links</h1>
          <p className="text-gray-600 mt-1">
            Track traffic between your site and nicotine-pouches.org
          </p>
        </div>

        {/* How it works */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="font-semibold text-blue-900 text-lg mb-3">How UTM tracking works</h2>
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              <strong>We already tag all links to your site</strong> with UTM parameters. When a customer clicks
              "Buy" on your product listing, the link includes:
            </p>
            <div className="bg-white rounded-lg p-3 font-mono text-xs text-gray-700 overflow-x-auto">
              {vendorDomain}/your-product?<span className="text-blue-600">utm_source</span>=nicotine-pouches.org&<span className="text-blue-600">utm_medium</span>=price-comparison&<span className="text-blue-600">utm_campaign</span>=product-listing
            </div>
            <p>
              This means you can see all traffic from nicotine-pouches.org in your Google Analytics under
              <strong> Acquisition &gt; Campaigns</strong>.
            </p>
            <p>
              <strong>Want to track traffic the other way?</strong> Use the links below on your website to send
              visitors to your nicotine-pouches.org listing. This lets us track how much traffic you send us,
              which counts towards your vendor analytics.
            </p>
          </div>
        </div>

        {/* What we tag (outgoing) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-2">Outgoing links (we handle this)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Every "Buy" link from nicotine-pouches.org to your store already includes these UTM parameters.
            Check your Google Analytics to see the traffic.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Parameter</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Value</th>
                  <th className="text-left py-2 font-medium text-gray-500">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2 pr-4 font-mono text-blue-600">utm_source</td>
                  <td className="py-2 pr-4 font-mono">nicotine-pouches.org</td>
                  <td className="py-2 text-gray-600">Identifies traffic from our site</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-blue-600">utm_medium</td>
                  <td className="py-2 pr-4 font-mono">price-comparison</td>
                  <td className="py-2 text-gray-600">Traffic type</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-blue-600">utm_campaign</td>
                  <td className="py-2 pr-4 font-mono">product-listing</td>
                  <td className="py-2 text-gray-600">Campaign name</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            In Google Analytics: Go to Reports &gt; Acquisition &gt; Traffic acquisition, then filter by Source = "nicotine-pouches.org"
          </p>
        </div>

        {/* Pre-built links (incoming) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-2">Links for your website</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add these links to your website to send customers to your nicotine-pouches.org listing. We'll track the traffic in your store analytics.
          </p>
          <div className="space-y-4">
            {utmLinks.map((link) => (
              <div key={link.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{link.label}</span>
                  <button
                    onClick={() => copyToClipboard(link.url, link.id)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {copied === link.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-2">{link.description}</p>
                <div className="bg-gray-50 rounded p-2 font-mono text-xs text-gray-700 break-all">
                  {link.url}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom UTM Builder */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-2">Custom UTM builder</h2>
          <p className="text-sm text-gray-600 mb-4">
            Build a custom tracked link for specific campaigns, emails, or social posts.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination URL</label>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source (your site)</label>
              <input
                type="text"
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medium</label>
              <select
                value={customMedium}
                onChange={(e) => setCustomMedium(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="website">website</option>
                <option value="email">email</option>
                <option value="social">social</option>
                <option value="banner">banner</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign (optional)</label>
              <input
                type="text"
                value={customCampaign}
                onChange={(e) => setCustomCampaign(e.target.value)}
                placeholder="e.g. summer-sale"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Content (optional)</label>
              <input
                type="text"
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="e.g. header-banner, footer-link"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Generated link</span>
              <button
                onClick={() => copyToClipboard(buildCustomUTM(), 'custom')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {copied === 'custom' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="bg-gray-50 rounded p-2 font-mono text-xs text-gray-700 break-all">
              {buildCustomUTM()}
            </div>
          </div>
        </div>

        {/* Badge / Widget */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-2">Website badge</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add this HTML snippet to your website to show a "Compare our prices" badge that links
            to your listing with tracking.
          </p>

          {/* Preview */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center justify-center">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#1d4ed8',
                color: '#fff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontFamily: 'sans-serif',
                fontSize: '14px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Compare our prices on Nicotine Pouches
            </a>
          </div>

          {/* Code */}
          <div className="relative">
            <button
              onClick={() => copyToClipboard(badgeSnippet, 'badge')}
              className="absolute top-2 right-2 text-xs text-blue-600 hover:text-blue-800 font-medium bg-white px-2 py-1 rounded"
            >
              {copied === 'badge' ? 'Copied!' : 'Copy HTML'}
            </button>
            <pre className="bg-gray-900 text-gray-300 rounded-lg p-4 text-xs overflow-x-auto">
              {badgeSnippet}
            </pre>
          </div>
        </div>

        {/* Conversion Tracking */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h2 className="font-semibold text-green-900 text-lg mb-3">Conversion tracking</h2>
          <div className="space-y-3 text-sm text-green-800">
            <p>
              Track actual sales that come from nicotine-pouches.org. When a customer clicks through
              from our site and completes a purchase on yours, the conversion shows up in your Analytics dashboard.
            </p>
            <p><strong>Two steps:</strong></p>
          </div>

          {/* Step 1: Script on all pages */}
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Step 1: Add this script to all pages (header or footer)
              </h3>
              <p className="text-xs text-gray-600 mb-2">
                This detects visitors from nicotine-pouches.org and remembers them for 30 days.
                On your thank-you page, it fires the conversion back to us.
              </p>
              <div className="relative">
                <button
                  onClick={() => copyToClipboard(conversionSnippet, 'conversion-script')}
                  className="absolute top-2 right-2 text-xs text-green-600 hover:text-green-800 font-medium bg-white px-2 py-1 rounded z-10"
                >
                  {copied === 'conversion-script' ? 'Copied!' : 'Copy'}
                </button>
                <pre className="bg-gray-900 text-gray-300 rounded-lg p-4 text-xs overflow-x-auto">
                  {conversionSnippet}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Step 2: Add this hidden element to your thank-you / order confirmation page
              </h3>
              <p className="text-xs text-gray-600 mb-2">
                Replace <code className="bg-gray-100 px-1 rounded">ORDER_TOTAL</code> with the order value and <code className="bg-gray-100 px-1 rounded">ORDER_ID</code> with the order ID.
                Most platforms (Shopify, WooCommerce) let you use template variables here.
              </p>
              <div className="relative">
                <button
                  onClick={() => copyToClipboard(thankYouSnippet, 'thankyou-snippet')}
                  className="absolute top-2 right-2 text-xs text-green-600 hover:text-green-800 font-medium bg-white px-2 py-1 rounded z-10"
                >
                  {copied === 'thankyou-snippet' ? 'Copied!' : 'Copy'}
                </button>
                <pre className="bg-gray-900 text-gray-300 rounded-lg p-4 text-xs overflow-x-auto">
                  {thankYouSnippet}
                </pre>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Platform examples</h4>
              <div className="space-y-2 text-xs text-gray-700">
                <div>
                  <strong>Shopify:</strong> Go to Settings &gt; Checkout &gt; Additional scripts. Paste both snippets.
                  Use <code className="bg-gray-100 px-1 rounded">{'{{ total_price | money_without_currency }}'}</code> for value
                  and <code className="bg-gray-100 px-1 rounded">{'{{ order_number }}'}</code> for order ID.
                </div>
                <div>
                  <strong>WooCommerce:</strong> Add to your theme&apos;s thank-you page template or use a plugin like
                  &quot;Insert Headers and Footers&quot;. Use WooCommerce template tags for order data.
                </div>
                <div>
                  <strong>Custom site:</strong> Add the script to your global header/footer. On your payment success
                  callback page, render the hidden div with the order details.
                </div>
              </div>
            </div>

            <p className="text-xs text-green-700">
              Your vendor ID is <strong>{vendorId}</strong>. This is already baked into the script above.
              Conversions are deduplicated by order ID so the same order won&apos;t be counted twice.
            </p>
          </div>
        </div>

        {/* Setup instructions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-4">Setup instructions</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
              <div>
                <strong>Check your incoming traffic.</strong> Open Google Analytics, go to Acquisition &gt; Traffic acquisition.
                Filter by Source = "nicotine-pouches.org". You should already see traffic from us.
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
              <div>
                <strong>Add a link back (optional).</strong> Copy one of the tracked links above or
                the HTML badge and add it to your website — footer, about page, or wherever makes sense.
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
              <div>
                <strong>Track conversions.</strong> Install the conversion tracking script above to see
                actual sales from nicotine-pouches.org in your Analytics dashboard.
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
