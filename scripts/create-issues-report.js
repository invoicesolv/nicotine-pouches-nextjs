const fs = require('fs');
const path = require('path');

// Read the exported CSV
const csvPath = path.join(__dirname, '../vendor-products-export.csv');
const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.split('\n').filter(l => l.trim());

// Parse CSV (simple parser)
function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += line[i];
    }
  }
  values.push(current);
  return values;
}

const headers = parseCsvLine(lines[0]);
const data = lines.slice(1).map(parseCsvLine);

// Filter products with issues
const issues = data.filter(row => {
  const linkStatus = row[5]; // Link Status column
  const price15Pack = row[11]; // Price 15 Pack column
  const price1Pack = row[6]; // Price 1 Pack column
  const price10Pack = row[9]; // Price 10 Pack column
  
  // Include if:
  // - Broken link
  // - Missing 15 pack (critical for default view)
  // - Missing both 1 pack and 10 pack (no fallback available)
  return linkStatus === 'BROKEN_LINK' || 
         price15Pack === 'N/A' || 
         (price1Pack === 'N/A' && price10Pack === 'N/A');
});

// Create issues CSV
const issuesCsv = [headers.join(',')];
issues.forEach(row => {
  issuesCsv.push(row.join(','));
});

// Write issues report
const issuesPath = path.join(__dirname, '../vendor-products-issues.csv');
fs.writeFileSync(issuesPath, issuesCsv.join('\n'), 'utf8');

console.log(`✅ Issues report created: ${issuesPath}`);
console.log(`📊 Products with issues: ${issues.length} out of ${data.length} (${(issues.length/data.length*100).toFixed(1)}%)`);

// Breakdown by issue type
const brokenLinks = issues.filter(r => r[5] === 'BROKEN_LINK').length;
const missing15Pack = issues.filter(r => r[11] === 'N/A' || !r[11]).length;
const missingBoth = issues.filter(r => r[6] === 'N/A' && r[9] === 'N/A').length;

console.log(`   - Broken Links: ${brokenLinks}`);
console.log(`   - Missing 15 Pack: ${missing15Pack}`);
console.log(`   - Missing Both 1 Pack & 10 Pack: ${missingBoth}`);


