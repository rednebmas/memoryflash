import { createCanvas, loadImage } from 'canvas';
import { generateHTMLReport } from './setup-screenshots';

// Convert DOM element to PNG buffer for snapshot testing
export async function captureDomScreenshot(
  element: HTMLElement, 
  options: { width?: number; height?: number; scale?: number } = {}
): Promise<Buffer> {
  const { width = 800, height = 600, scale = 1 } = options;
  
  try {
    // Find SVG element
    const svgElement = element.querySelector('svg');
    if (!svgElement) {
      throw new Error('No SVG element found in the provided DOM element');
    }
    
    // Get SVG as string
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;
    
    // Load the image onto canvas
    const image = await loadImage(svgDataUrl);
    
    // Create canvas with the specified dimensions
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw the image centered and scaled
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const x = (width - imgWidth) / 2;
    const y = (height - imgHeight) / 2;
    
    ctx.drawImage(image, x, y, imgWidth, imgHeight);
    
    // Return PNG buffer
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Error capturing DOM screenshot:', error);
    throw error;
  }
}

// Handle image snapshot failures
export function handleSnapshotFailure(error: Error, testName: string): void {
  if (error.name === 'Error' && error.message.includes('different from snapshot')) {
    // Extract the diff image path from the error message
    const match = error.message.match(/See diff for details: (.+)/);
    
    if (match && match[1]) {
      const diffPath = match[1];
      // Generate HTML report for easy visual comparison
      generateHTMLReport(diffPath, testName);
    }
  }
  
  // Re-throw the error to fail the test
  throw error;
} 