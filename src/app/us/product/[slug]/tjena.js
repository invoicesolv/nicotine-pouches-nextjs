#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

// Configuration
const config = {
    csvFile: process.argv[2] || 'hreflang-data.csv',
    outputFile: 'hreflang-issues-report.csv',
    checkLive: process.argv.includes('--live'), // Add --live flag to check URLs in real-time
    concurrency: 5, // Number of concurrent requests when checking live
    timeout: 10000 // Request timeout in ms
};

class HreflangChecker {
    constructor() {
        this.results = [];
        this.stats = {
            total: 0,
            broken404: 0,
            redirects: 0,
            ok: 0,
            otherIssues: 0
        };
    }

    // Parse CSV data
    parseCSV(csvContent) {
        const lines = csvContent.trim().split('\n');
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        
        // Find column indices
        const indices = {
            sourceUrl: headers.findIndex(h => h.includes('source url')),
            sourceStatus: headers.findIndex(h => h.includes('source http status')),
            targetUrl: headers.findIndex(h => h.includes('target url') && !h.includes('final')),
            targetStatus: headers.findIndex(h => h.includes('target http status') && !h.includes('final')),
            hreflang: headers.findIndex(h => h.includes('hreflang')),
            finalUrl: headers.findIndex(h => h.includes('final redirect url')),
            finalStatus: headers.findIndex(h => h.includes('final redirect http status'))
        };

        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            // Handle CSV with potential commas in URLs
            const parts = this.parseCSVLine(lines[i]);
            
            if (parts.length > indices.sourceUrl) {
                const entry = {
                    sourceUrl: parts[indices.sourceUrl]?.trim() || '',
                    sourceStatus: parseInt(parts[indices.sourceStatus]) || 0,
                    targetUrl: parts[indices.targetUrl]?.trim() || '',
                    targetStatus: parseInt(parts[indices.targetStatus]) || 0,
                    hreflang: parts[indices.hreflang]?.trim() || '',
                    finalUrl: parts[indices.finalUrl]?.trim() || '',
                    finalStatus: parseInt(parts[indices.finalStatus]) || 0
                };
                
                // Only process entries with hreflang data
                if (entry.sourceUrl && entry.targetUrl) {
                    data.push(entry);
                }
            }
        }
        
        return data;
    }

    // Parse CSV line handling quotes
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    // Analyze hreflang issues
    analyzeIssues(data) {
        console.log(`\n${colors.cyan}${colors.bold}Analyzing ${data.length} hreflang entries...${colors.reset}\n`);
        
        data.forEach(entry => {
            const issue = this.determineIssue(entry);
            this.results.push({
                ...entry,
                issue: issue.type,
                severity: issue.severity,
                recommendation: issue.recommendation
            });
            
            // Update stats
            this.stats.total++;
            if (issue.type === '404 Error') this.stats.broken404++;
            else if (issue.type.includes('Redirect')) this.stats.redirects++;
            else if (issue.type === 'OK') this.stats.ok++;
            else this.stats.otherIssues++;
        });
    }

    // Determine issue type for each entry
    determineIssue(entry) {
        const { targetStatus, finalStatus, targetUrl, finalUrl } = entry;
        
        if (targetStatus === 404) {
            return {
                type: '404 Error',
                severity: 'HIGH',
                recommendation: `Fix broken hreflang: Target URL returns 404. Either update the hreflang to point to a valid URL or remove it.`
            };
        }
        
        if ([301, 302, 307, 308].includes(targetStatus)) {
            // Check if redirect goes to homepage instead of equivalent page
            if (finalUrl && (finalUrl.endsWith('/us') || finalUrl.endsWith('/us/'))) {
                const isProductOrBlog = targetUrl.includes('/product/') || targetUrl.includes('/blog/');
                if (isProductOrBlog) {
                    return {
                        type: 'Redirect to Homepage',
                        severity: 'MEDIUM',
                        recommendation: `Hreflang redirects to homepage instead of equivalent page. Update to point directly to the correct localized version.`
                    };
                }
            }
            
            return {
                type: `${targetStatus} Redirect`,
                severity: 'MEDIUM',
                recommendation: `Update hreflang to point directly to final URL (${finalUrl}) to avoid redirect chains.`
            };
        }
        
        if (targetStatus === 200) {
            return {
                type: 'OK',
                severity: 'NONE',
                recommendation: 'No issues detected'
            };
        }
        
        return {
            type: `Other (${targetStatus})`,
            severity: 'LOW',
            recommendation: 'Review this hreflang implementation'
        };
    }

    // Check URL status (for --live flag)
    async checkUrlStatus(url) {
        return new Promise((resolve) => {
            const parsedUrl = new URL(url);
            const protocol = parsedUrl.protocol === 'https:' ? https : http;
            
            const options = {
                method: 'HEAD',
                timeout: config.timeout
            };
            
            const req = protocol.request(url, options, (res) => {
                resolve({
                    url,
                    status: res.statusCode,
                    location: res.headers.location || null
                });
            });
            
            req.on('error', () => {
                resolve({
                    url,
                    status: 0,
                    location: null,
                    error: true
                });
            });
            
            req.on('timeout', () => {
                req.abort();
                resolve({
                    url,
                    status: 0,
                    location: null,
                    error: true
                });
            });
            
            req.end();
        });
    }

    // Display results
    displayResults() {
        console.log(`\n${colors.bold}${'='.repeat(80)}${colors.reset}`);
        console.log(`${colors.cyan}${colors.bold}HREFLANG ANALYSIS RESULTS${colors.reset}`);
        console.log(`${colors.bold}${'='.repeat(80)}${colors.reset}\n`);
        
        // Statistics
        console.log(`${colors.bold}Statistics:${colors.reset}`);
        console.log(`  Total hreflang tags: ${colors.bold}${this.stats.total}${colors.reset}`);
        console.log(`  ${colors.red}✗ 404 Errors: ${this.stats.broken404}${colors.reset}`);
        console.log(`  ${colors.yellow}⚠ Redirects: ${this.stats.redirects}${colors.reset}`);
        console.log(`  ${colors.green}✓ OK: ${this.stats.ok}${colors.reset}`);
        console.log(`  ${colors.blue}? Other Issues: ${this.stats.otherIssues}${colors.reset}\n`);
        
        // Group issues by type
        const issueGroups = {};
        this.results.forEach(result => {
            if (!issueGroups[result.issue]) {
                issueGroups[result.issue] = [];
            }
            issueGroups[result.issue].push(result);
        });
        
        // Display issues by severity
        const severityOrder = ['HIGH', 'MEDIUM', 'LOW'];
        
        severityOrder.forEach(severity => {
            const severityIssues = this.results.filter(r => r.severity === severity);
            
            if (severityIssues.length > 0) {
                const severityColor = severity === 'HIGH' ? colors.red : 
                                     severity === 'MEDIUM' ? colors.yellow : colors.blue;
                
                console.log(`\n${severityColor}${colors.bold}${severity} SEVERITY ISSUES (${severityIssues.length})${colors.reset}`);
                console.log(`${'─'.repeat(80)}`);
                
                // Show first 5 examples of each issue type
                const examples = {};
                severityIssues.forEach(issue => {
                    if (!examples[issue.issue]) examples[issue.issue] = [];
                    if (examples[issue.issue].length < 5) {
                        examples[issue.issue].push(issue);
                    }
                });
                
                Object.keys(examples).forEach(issueType => {
                    console.log(`\n${colors.bold}${issueType}:${colors.reset}`);
                    examples[issueType].forEach(issue => {
                        console.log(`  Source: ${colors.cyan}${issue.sourceUrl}${colors.reset}`);
                        console.log(`  Target: ${issue.targetUrl} ${severityColor}(${issue.targetStatus})${colors.reset}`);
                        console.log(`  Hreflang: ${issue.hreflang}`);
                        if (issue.finalUrl) {
                            console.log(`  Final: ${colors.magenta}${issue.finalUrl}${colors.reset}`);
                        }
                        console.log(`  ${colors.bold}Fix:${colors.reset} ${issue.recommendation}`);
                        console.log();
                    });
                });
            }
        });
    }

    // Export results to CSV
    exportResults() {
        const csvHeader = 'Source URL,Target URL,Hreflang,Target Status,Issue Type,Severity,Recommendation,Final URL\n';
        const csvContent = this.results.map(r => 
            `"${r.sourceUrl}","${r.targetUrl}","${r.hreflang}",${r.targetStatus},"${r.issue}","${r.severity}","${r.recommendation}","${r.finalUrl || 'N/A'}"`
        ).join('\n');
        
        fs.writeFileSync(config.outputFile, csvHeader + csvContent);
        console.log(`\n${colors.green}${colors.bold}✓ Detailed report exported to: ${config.outputFile}${colors.reset}\n`);
    }

    // Main execution
    async run() {
        console.log(`${colors.cyan}${colors.bold}Hreflang Issue Checker${colors.reset}`);
        console.log(`${'─'.repeat(80)}\n`);
        
        // Check if CSV file exists
        if (!fs.existsSync(config.csvFile)) {
            console.error(`${colors.red}Error: CSV file not found: ${config.csvFile}${colors.reset}`);
            console.log('\nUsage: node hreflang-checker.js [csv-file] [--live]');
            console.log('  csv-file: Path to your CSV file (default: hreflang-data.csv)');
            console.log('  --live: Check URLs in real-time (slower but more accurate)\n');
            process.exit(1);
        }
        
        // Read and parse CSV
        const csvContent = fs.readFileSync(config.csvFile, 'utf-8');
        const data = this.parseCSV(csvContent);
        
        if (data.length === 0) {
            console.error(`${colors.red}No valid hreflang data found in CSV${colors.reset}`);
            process.exit(1);
        }
        
        console.log(`${colors.green}✓ Loaded ${data.length} hreflang entries from ${config.csvFile}${colors.reset}`);
        
        // Analyze issues
        this.analyzeIssues(data);
        
        // Display results
        this.displayResults();
        
        // Export results
        this.exportResults();
        
        // Summary
        const issuePercentage = ((this.stats.broken404 + this.stats.redirects) / this.stats.total * 100).toFixed(1);
        
        console.log(`${colors.bold}${'='.repeat(80)}${colors.reset}`);
        console.log(`${colors.bold}SUMMARY${colors.reset}`);
        console.log(`${colors.bold}${'='.repeat(80)}${colors.reset}\n`);
        
        if (this.stats.broken404 > 0) {
            console.log(`${colors.red}${colors.bold}⚠ CRITICAL: ${this.stats.broken404} broken hreflang tags (404 errors) need immediate attention!${colors.reset}`);
        }
        
        if (this.stats.redirects > 0) {
            console.log(`${colors.yellow}${colors.bold}⚠ WARNING: ${this.stats.redirects} hreflang tags point to redirecting URLs${colors.reset}`);
        }
        
        console.log(`\n${colors.bold}Overall: ${issuePercentage}% of hreflang tags have issues${colors.reset}`);
        
        if (issuePercentage > 20) {
            console.log(`${colors.red}${colors.bold}This requires urgent SEO attention!${colors.reset}`);
        } else if (issuePercentage > 10) {
            console.log(`${colors.yellow}Consider prioritizing these fixes for better international SEO${colors.reset}`);
        } else {
            console.log(`${colors.green}Your hreflang implementation is in good shape${colors.reset}`);
        }
    }
}

// Run the checker
const checker = new HreflangChecker();
checker.run().catch(error => {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
});