/**
 * PDF Exporter
 * Export markdown to PDF format
 *
 * NOTE: This implementation generates HTML that can be converted to PDF.
 * For production use in Electron, use Electron's printToPDF() API which
 * provides native PDF generation without external dependencies.
 */

import { marked } from 'marked';
import * as fs from 'fs/promises';
import {
  ExportOptions,
  PdfExportOptions,
  ExportResult,
  FileServiceError,
  FileServiceErrorCode,
} from '../types';

/**
 * Default PDF styling
 */
const DEFAULT_STYLING = {
  fontSize: 12,
  fontFamily: 'Georgia, serif',
  lineHeight: 1.6,
  margins: {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
  },
  backgroundColor: '#FFFFFF',
  textColor: '#000000',
  linkColor: '#0066CC',
  codeBlockBackground: '#F5F5F5',
  codeBlockColor: '#333333',
};

/**
 * PdfExporter class
 * Converts markdown to PDF-ready HTML
 *
 * For Electron apps, use this HTML with BrowserWindow.webContents.printToPDF()
 */
export class PdfExporter {
  /**
   * Export markdown to PDF
   *
   * This method generates a styled HTML file that can be:
   * 1. Converted to PDF using Electron's printToPDF() API
   * 2. Opened in a browser and printed to PDF
   * 3. Converted using external tools (wkhtmltopdf, Prince, etc.)
   */
  async export(markdown: string, options: ExportOptions): Promise<ExportResult> {
    try {
      const pdfOptions = options as PdfExportOptions;

      // Parse markdown to HTML
      const htmlContent = marked(markdown);

      // Create complete HTML document with styling
      const html = this.createStyledHtml(htmlContent, pdfOptions);

      // Determine output path (use .html extension if PDF generation not available)
      const outputPath = options.outputPath.endsWith('.pdf')
        ? options.outputPath.replace('.pdf', '.html')
        : options.outputPath;

      // Write HTML file
      await fs.writeFile(outputPath, html, 'utf-8');

      const stats = await fs.stat(outputPath);

      return {
        success: true,
        outputPath,
        format: 'pdf',
        message: 'PDF-ready HTML generated. Use Electron\'s printToPDF() to convert to PDF.',
        fileSize: stats.size,
      };
    } catch (error) {
      throw new FileServiceError(
        'PDF export failed',
        FileServiceErrorCode.EXPORT_FAILED,
        options.outputPath,
        error as Error
      );
    }
  }

  /**
   * Export directly to PDF using Electron's API (if available)
   * This method should be called from the main process
   */
  async exportWithElectron(
    markdown: string,
    options: PdfExportOptions,
    electronBrowserWindow: any
  ): Promise<ExportResult> {
    try {
      // Parse markdown to HTML
      const htmlContent = marked(markdown);
      const html = this.createStyledHtml(htmlContent, options);

      // Load HTML in browser window
      await electronBrowserWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

      // Wait for content to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate PDF using Electron's API
      const pdfBuffer = await electronBrowserWindow.webContents.printToPDF({
        marginsType: 0,
        pageSize: options.styling?.pageSize || 'Letter',
        landscape: options.styling?.orientation === 'landscape',
        printBackground: true,
        ...options.pdfOptions,
      });

      // Write PDF to file
      await fs.writeFile(options.outputPath, pdfBuffer);

      const stats = await fs.stat(options.outputPath);

      return {
        success: true,
        outputPath: options.outputPath,
        format: 'pdf',
        message: 'PDF export successful',
        fileSize: stats.size,
      };
    } catch (error) {
      throw new FileServiceError(
        'PDF export with Electron failed',
        FileServiceErrorCode.EXPORT_FAILED,
        options.outputPath,
        error as Error
      );
    }
  }

  /**
   * Create styled HTML document
   */
  private createStyledHtml(content: string, options: PdfExportOptions): string {
    const styling = { ...DEFAULT_STYLING, ...options.styling };

    const css = this.generateCSS(styling, options);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.metadata?.title || 'Document'}</title>
  ${options.metadata?.author ? `<meta name="author" content="${options.metadata.author}">` : ''}
  ${options.metadata?.description ? `<meta name="description" content="${options.metadata.description}">` : ''}
  <style>
${css}
  </style>
</head>
<body>
  <article>
${content}
  </article>
</body>
</html>`;
  }

  /**
   * Generate CSS for the PDF
   */
  private generateCSS(styling: any, options: PdfExportOptions): string {
    return `
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* Page setup */
    @page {
      size: ${this.getPageSize(styling.pageSize)};
      margin: ${styling.margins.top}in ${styling.margins.right}in ${styling.margins.bottom}in ${styling.margins.left}in;
    }

    /* Body styles */
    body {
      font-family: ${styling.fontFamily};
      font-size: ${styling.fontSize}pt;
      line-height: ${styling.lineHeight};
      color: ${styling.textColor};
      background-color: ${styling.backgroundColor};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Article container */
    article {
      max-width: 100%;
    }

    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: bold;
      line-height: 1.2;
      page-break-after: avoid;
    }

    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1.1em; }
    h5 { font-size: 1em; }
    h6 { font-size: 0.9em; }

    p {
      margin-bottom: 1em;
      orphans: 3;
      widows: 3;
    }

    /* Links */
    a {
      color: ${styling.linkColor};
      text-decoration: underline;
    }

    a:visited {
      color: ${styling.linkColor};
    }

    /* Lists */
    ul, ol {
      margin-bottom: 1em;
      padding-left: 2em;
    }

    li {
      margin-bottom: 0.5em;
    }

    /* Code blocks */
    code {
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      background-color: ${styling.codeBlockBackground};
      color: ${styling.codeBlockColor};
      padding: 0.2em 0.4em;
      border-radius: 3px;
    }

    pre {
      margin-bottom: 1em;
      padding: 1em;
      background-color: ${styling.codeBlockBackground};
      border-radius: 5px;
      overflow-x: auto;
      page-break-inside: avoid;
    }

    pre code {
      padding: 0;
      background: transparent;
      display: block;
    }

    /* Blockquotes */
    blockquote {
      margin: 1em 0;
      padding: 0.5em 1em;
      border-left: 4px solid #CCCCCC;
      background-color: #F9F9F9;
      font-style: italic;
      page-break-inside: avoid;
    }

    /* Tables */
    table {
      width: 100%;
      margin-bottom: 1em;
      border-collapse: collapse;
      page-break-inside: avoid;
    }

    th, td {
      padding: 0.5em;
      border: 1px solid #DDDDDD;
      text-align: left;
    }

    th {
      background-color: #F0F0F0;
      font-weight: bold;
    }

    tr:nth-child(even) {
      background-color: #F9F9F9;
    }

    /* Images */
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1em auto;
      page-break-inside: avoid;
    }

    /* Horizontal rules */
    hr {
      margin: 2em 0;
      border: none;
      border-top: 1px solid #CCCCCC;
      page-break-after: avoid;
    }

    /* Emphasis */
    em, i {
      font-style: italic;
    }

    strong, b {
      font-weight: bold;
    }

    /* Print optimizations */
    @media print {
      body {
        background-color: white;
      }

      a {
        text-decoration: none;
      }

      a[href]:after {
        content: " (" attr(href) ")";
        font-size: 0.8em;
      }

      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
      }

      img {
        page-break-inside: avoid;
      }

      blockquote, pre, table {
        page-break-inside: avoid;
      }
    }
    `;
  }

  /**
   * Get CSS page size from options
   */
  private getPageSize(pageSize?: string): string {
    switch (pageSize) {
      case 'letter':
        return '8.5in 11in';
      case 'legal':
        return '8.5in 14in';
      case 'a4':
        return '210mm 297mm';
      case 'a5':
        return '148mm 210mm';
      default:
        return '8.5in 11in'; // letter
    }
  }
}

/**
 * Helper function to convert HTML to PDF using Electron
 * This should be called from the main process
 */
export async function convertHtmlToPdfElectron(
  htmlPath: string,
  pdfPath: string,
  electronApp: any
): Promise<void> {
  const { BrowserWindow } = electronApp;

  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      offscreen: true,
    },
  });

  await win.loadFile(htmlPath);

  const pdfData = await win.webContents.printToPDF({
    marginsType: 0,
    printBackground: true,
  });

  await fs.writeFile(pdfPath, pdfData);

  win.destroy();
}
