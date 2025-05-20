#!/usr/bin/env node

/**
 * This script generates an HTML report for examining image snapshot differences
 * Run after tests fail with image snapshot differences
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SNAPSHOTS_DIR = path.join(__dirname, '..', 'src', '__image_snapshots__');
const DIFFS_DIR = path.join(SNAPSHOTS_DIR, '__diff_output__');
const REPORT_DIR = path.join(SNAPSHOTS_DIR, '__report__');
const REPORT_FILE = path.join(REPORT_DIR, 'index.html');

// Create report directory if it doesn't exist
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Find all diff files
const findDiffFiles = () => {
  if (!fs.existsSync(DIFFS_DIR)) {
    console.log('No diff directory found. No failing tests?');
    return [];
  }
  
  return fs.readdirSync(DIFFS_DIR)
    .filter(file => file.includes('-diff.png'))
    .map(file => {
      const diffPath = path.join(DIFFS_DIR, file);
      const baseName = file.replace('-diff.png', '.png');
      const expectedPath = path.join(SNAPSHOTS_DIR, baseName);
      
      return {
        name: baseName.replace('.png', ''),
        diffPath: path.relative(REPORT_DIR, diffPath),
        expectedPath: path.relative(REPORT_DIR, expectedPath),
      };
    });
};

// Generate HTML report
const generateReport = (diffs) => {
  if (diffs.length === 0) {
    console.log('No differences found. All tests passed?');
    return;
  }
  
  const diffRows = diffs.map(diff => `
    <tr>
      <td>${diff.name}</td>
      <td><img src="../${diff.expectedPath}" alt="Expected" width="400"></td>
      <td><img src="../${diff.diffPath}" alt="Difference" width="400"></td>
    </tr>
  `).join('');
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Screenshot Test Differences</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        h1 { color: #d32f2f; margin-bottom: 30px; }
        table { border-collapse: collapse; width: 100%; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f8f8; font-weight: bold; }
        tr:hover { background-color: #f1f1f1; }
        img { border: 1px solid #ddd; max-width: 100%; display: block; margin: 0 auto; }
        .actions { margin: 20px 0; }
        .button { background: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
        .button:hover { background: #45a049; }
      </style>
    </head>
    <body>
      <h1>Screenshot Test Differences</h1>
      <div class="actions">
        <button class="button" onclick="window.location.href='../../../scripts/update-snapshots.sh'">Update Snapshots</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Test Name</th>
            <th>Expected</th>
            <th>Difference</th>
          </tr>
        </thead>
        <tbody>
          ${diffRows}
        </tbody>
      </table>
    </body>
    </html>
  `;
  
  fs.writeFileSync(REPORT_FILE, html);
  console.log(`Report generated at: ${REPORT_FILE}`);
};

// Main execution
const diffs = findDiffFiles();
generateReport(diffs);

if (diffs.length > 0) {
  console.log(`Found ${diffs.length} difference${diffs.length > 1 ? 's' : ''}`);
  console.log(`Open the report: file://${REPORT_FILE}`);
} else {
  console.log('No differences found');
} 