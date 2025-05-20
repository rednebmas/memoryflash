import { expect } from 'vitest';
import { configureToMatchImageSnapshot } from 'jest-image-snapshot';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import fs from 'fs';

// Configure the image snapshot matcher
const toMatchImageSnapshot = configureToMatchImageSnapshot({
  customDiffConfig: {
    threshold: 0.001, 
  },
  customSnapshotsDir: path.join(process.cwd(), 'src', '__image_snapshots__'),
  customDiffDir: path.join(process.cwd(), 'src', '__image_snapshots__', '__diff_output__'),
  failureThreshold: 0.0001, 
  failureThresholdType: 'percent',
  updatePassedSnapshot: false,
});

// Add the matcher to vitest's expect
expect.extend({ toMatchImageSnapshot });

// Helper function to generate an HTML report for visual comparison
export function generateHTMLReport(diffOutputPath: string, testName: string): void {
  const reportDir = path.join(process.cwd(), 'src', '__image_snapshots__', '__report__');
  
  // Ensure the report directory exists
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Screenshot Test Difference - ${testName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #d32f2f; }
        .image-container { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 20px; }
        .image-item { flex: 1; min-width: 300px; }
        img { max-width: 100%; border: 1px solid #ccc; }
        h2 { font-size: 1.2rem; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <h1>Screenshot Test Failed</h1>
      <p>Test: ${testName}</p>
      <div class="image-container">
        <div class="image-item">
          <h2>Actual</h2>
          <img src="${diffOutputPath.replace(reportDir, '.')}" alt="Actual screenshot">
        </div>
        <div class="image-item">
          <h2>Expected</h2>
          <img src="${diffOutputPath.replace(reportDir, '.').replace('-diff', '')}" alt="Expected screenshot">
        </div>
        <div class="image-item">
          <h2>Difference</h2>
          <img src="${diffOutputPath.replace(reportDir, '.')}" alt="Difference">
        </div>
      </div>
    </body>
    </html>
  `;
  
  const reportPath = path.join(reportDir, `${testName}.html`);
  fs.writeFileSync(reportPath, htmlContent);
  console.log(`HTML report generated at: ${reportPath}`);
}

// Helper function to render an SVG to canvas and return PNG buffer
export async function svgToImageBuffer(svgElement: SVGElement): Promise<Buffer> {
  try {
    // Convert SVG to a string
    const svgString = new XMLSerializer().serializeToString(svgElement);
    
    // Create a data URL
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;
    
    // Load the image
    const image = await loadImage(svgDataUrl);
    
    // Create a canvas with the same dimensions as the SVG
    const canvas = createCanvas(svgElement.clientWidth || 800, svgElement.clientHeight || 600);
    const ctx = canvas.getContext('2d');
    
    // Draw the image onto the canvas
    ctx.drawImage(image, 0, 0);
    
    // Return the PNG buffer
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Error converting SVG to image buffer:', error);
    throw error;
  }
} 