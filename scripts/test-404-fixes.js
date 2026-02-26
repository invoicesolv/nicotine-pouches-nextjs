#!/usr/bin/env node
/**
 * 404 Fix Test Script
 * Tests all URLs from the 404 CSV file against localhost to verify redirects are working
 *
 * Usage: node scripts/test-404-fixes.js [path-to-csv]
 *
 * If no CSV path is provided, it will look for the default path.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
const DEFAULT_CSV_PATH = '/Users/solvifyab/Desktop/TodosImages/nicotine-pouches_03-feb-2026_404-page_2026-02-03_12-26-21.csv';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Parse CSV file
function parseCSV(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');

  const urlIndex = headers.findIndex(h => h.toLowerCase() === 'url');
  if (urlIndex === -1) {
    throw new Error('CSV must have a "URL" column');
  }

  const urls = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Simple CSV parsing (handles basic cases)
    const values = line.split(',');
    const url = values[urlIndex];
    if (url) {
      urls.push(url.trim());
    }
  }

  return urls;
}

// Extract path from full URL
function extractPath(fullUrl) {
  try {
    const url = new URL(fullUrl);
    return url.pathname;
  } catch {
    return fullUrl;
  }
}

// Test a single URL
function testUrl(urlPath) {
  return new Promise((resolve) => {
    const testUrl = `${BASE_URL}${urlPath}`;

    const req = http.get(testUrl, { timeout: 10000 }, (res) => {
      // Follow redirects manually to check final status
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectTo = res.headers.location;
        resolve({
          path: urlPath,
          status: res.statusCode,
          redirectTo: redirectTo,
          success: true, // Redirect is a success (it's not a 404)
          message: `Redirected to ${redirectTo}`
        });
      } else {
        resolve({
          path: urlPath,
          status: res.statusCode,
          redirectTo: null,
          success: res.statusCode !== 404,
          message: res.statusCode === 404 ? 'Still 404' : `Status ${res.statusCode}`
        });
      }
    });

    req.on('error', (err) => {
      resolve({
        path: urlPath,
        status: 0,
        redirectTo: null,
        success: false,
        message: `Error: ${err.message}`
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        path: urlPath,
        status: 0,
        redirectTo: null,
        success: false,
        message: 'Timeout'
      });
    });
  });
}

// Main test function
async function runTests(csvPath) {
  console.log(`${colors.bold}${colors.cyan}================================${colors.reset}`);
  console.log(`${colors.bold}  404 Fix Verification Test${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================${colors.reset}\n`);

  console.log(`${colors.blue}CSV File:${colors.reset} ${csvPath}`);
  console.log(`${colors.blue}Testing against:${colors.reset} ${BASE_URL}\n`);

  // Parse CSV
  let urls;
  try {
    urls = parseCSV(csvPath);
    console.log(`${colors.green}Found ${urls.length} URLs to test${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}Error reading CSV: ${error.message}${colors.reset}`);
    process.exit(1);
  }

  // Test all URLs
  const results = {
    fixed: [],
    stillBroken: [],
    errors: []
  };

  console.log(`${colors.cyan}Testing URLs...${colors.reset}\n`);

  let completed = 0;
  const total = urls.length;

  // Process URLs in batches to avoid overwhelming the server
  const batchSize = 10;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(url => testUrl(extractPath(url)))
    );

    for (const result of batchResults) {
      completed++;

      if (result.status === 0) {
        results.errors.push(result);
      } else if (result.success) {
        results.fixed.push(result);
      } else {
        results.stillBroken.push(result);
      }

      // Progress indicator
      const progress = Math.round((completed / total) * 100);
      process.stdout.write(`\r  Progress: ${completed}/${total} (${progress}%)`);
    }
  }

  console.log('\n');

  // Print results
  console.log(`${colors.bold}${colors.cyan}================================${colors.reset}`);
  console.log(`${colors.bold}  Results Summary${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================${colors.reset}\n`);

  console.log(`${colors.green}✓ Fixed (redirected or 200):${colors.reset} ${results.fixed.length}`);
  console.log(`${colors.red}✗ Still 404:${colors.reset} ${results.stillBroken.length}`);
  console.log(`${colors.yellow}⚠ Errors:${colors.reset} ${results.errors.length}\n`);

  // Show fixed URLs
  if (results.fixed.length > 0) {
    console.log(`${colors.bold}${colors.green}Fixed URLs:${colors.reset}`);
    for (const r of results.fixed.slice(0, 20)) {
      const redirect = r.redirectTo ? ` → ${r.redirectTo}` : '';
      console.log(`  ${colors.green}✓${colors.reset} ${r.path} (${r.status})${redirect}`);
    }
    if (results.fixed.length > 20) {
      console.log(`  ... and ${results.fixed.length - 20} more`);
    }
    console.log('');
  }

  // Show still broken URLs
  if (results.stillBroken.length > 0) {
    console.log(`${colors.bold}${colors.red}Still Broken (404):${colors.reset}`);
    for (const r of results.stillBroken) {
      console.log(`  ${colors.red}✗${colors.reset} ${r.path}`);
    }
    console.log('');
  }

  // Show errors
  if (results.errors.length > 0) {
    console.log(`${colors.bold}${colors.yellow}Errors:${colors.reset}`);
    for (const r of results.errors) {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${r.path}: ${r.message}`);
    }
    console.log('');
  }

  // Final summary
  const successRate = total > 0 ? Math.round((results.fixed.length / total) * 100) : 0;
  console.log(`${colors.bold}${colors.cyan}================================${colors.reset}`);
  console.log(`${colors.bold}  Success Rate: ${successRate}%${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================${colors.reset}\n`);

  // Write detailed report to file
  const reportPath = path.join(__dirname, 'test-404-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    csvFile: csvPath,
    baseUrl: BASE_URL,
    summary: {
      total: total,
      fixed: results.fixed.length,
      stillBroken: results.stillBroken.length,
      errors: results.errors.length,
      successRate: `${successRate}%`
    },
    fixed: results.fixed,
    stillBroken: results.stillBroken,
    errors: results.errors
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`${colors.blue}Detailed report saved to:${colors.reset} ${reportPath}\n`);

  // Exit with error if there are still broken URLs
  if (results.stillBroken.length > 0) {
    process.exit(1);
  }
}

// Entry point
const csvPath = process.argv[2] || DEFAULT_CSV_PATH;

if (!fs.existsSync(csvPath)) {
  console.error(`${colors.red}Error: CSV file not found: ${csvPath}${colors.reset}`);
  console.error(`Usage: node test-404-fixes.js [path-to-csv]`);
  process.exit(1);
}

runTests(csvPath);
