// Simple test script to verify Google Analytics implementation
// Run this in the browser console after loading the page

console.log('Testing Google Analytics implementation...');

// Check if gtag is available
if (typeof window !== 'undefined' && window.gtag) {
  console.log('✅ gtag function is available');
  
  // Check if dataLayer is available
  if (window.dataLayer) {
    console.log('✅ dataLayer is available');
    console.log('DataLayer contents:', window.dataLayer);
  } else {
    console.log('❌ dataLayer is not available');
  }
  
  // Test sending a custom event
  try {
    window.gtag('event', 'test_event', {
      event_category: 'test',
      event_label: 'google_analytics_test',
      value: 1
    });
    console.log('✅ Test event sent successfully');
  } catch (error) {
    console.log('❌ Error sending test event:', error);
  }
  
} else {
  console.log('❌ gtag function is not available');
  console.log('Make sure Google Analytics script is loaded in the document head');
}

// Check for Google Analytics script in DOM
const gaScript = document.querySelector('script[src*="googletagmanager.com"]');
if (gaScript) {
  console.log('✅ Google Analytics script found in DOM');
  console.log('Script src:', gaScript.src);
} else {
  console.log('❌ Google Analytics script not found in DOM');
}

// Check for measurement ID in scripts
const scripts = document.querySelectorAll('script');
let foundMeasurementId = false;
scripts.forEach(script => {
  if (script.innerHTML && script.innerHTML.includes('G-9FT722JELW')) {
    foundMeasurementId = true;
  }
});

if (foundMeasurementId) {
  console.log('✅ Measurement ID G-9FT722JELW found in scripts');
} else {
  console.log('❌ Measurement ID G-9FT722JELW not found in scripts');
}
