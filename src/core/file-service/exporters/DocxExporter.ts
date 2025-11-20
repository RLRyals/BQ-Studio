/**
 * DOCX Exporter
 * Export markdown to Microsoft Word (.docx) format
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  UnderlineType,
  convertInchesToTwip,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';
import { marked } from 'marked';
import * as fs from 'fs/promises';
import {
  ExportOptions,
  DocxExportOptions,
  ExportResult,
  FileServiceError,
  FileServiceErrorCode,
  ParagraphStyle,
} from '../types';

/**
 * Default DOCX styling
 */
const DEFAULT_STYLING = {
  fontSize: 24, // 12pt (half-points)
  fontFamily: 'Calibri',
  lineHeight: 1.15,
  margins: {
    top: 1440, // 1 inch in twips
    right: 1440,
    bottom: 1440,
    left: 1440,
  },
};

/**
 * DocxExporter class
 * Converts markdown to Word documents with formatting
 */
export class DocxExporter {
  /**
   * Export markdown to DOCX
   */
  async export(markdown: string, options: ExportOptions): Promise<ExportResult> {
    try {
      const docxOptions = options as DocxExportOptions;

      // Parse markdown to tokens
      const tokens = marked.lexer(markdown);

      // Convert tokens to DOCX paragraphs
      const children = this.tokensToDocxElements(tokens, docxOptions);

      // Create document
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: convertInchesToTwip(docxOptions.styling?.margins?.top || 1),
                  right: convertInchesToTwip(docxOptions.styling?.margins?.right || 1),
                  bottom: convertInchesToTwip(docxOptions.styling?.margins?.bottom || 1),
                  left: convertInchesToTwip(docxOptions.styling?.margins?.left || 1),
                },
              },
            },
            children,
          },
        ],
        creator: options.metadata?.creator || 'BQ Studio',
        title: options.metadata?.title,
        description: options.metadata?.description,
        subject: options.metadata?.subject,
        keywords: options.metadata?.keywords?.join(', '),
      });

      // Generate buffer
      const buffer = await Packer.toBuffer(doc);

      // Write to file
      await fs.writeFile(options.outputPath, buffer);

      const stats = await fs.stat(options.outputPath);

      return {
        success: true,
        outputPath: options.outputPath,
        format: 'docx',
        message: 'DOCX export successful',
        fileSize: stats.size,
      };
    } catch (error) {
      throw new FileServiceError(
        'DOCX export failed',
        FileServiceErrorCode.EXPORT_FAILED,
        options.outputPath,
        error as Error
      );
    }
  }

  /**
   * Convert markdown tokens to DOCX elements
   */
  private tokensToDocxElements(
    tokens: marked.Token[],
    options: DocxExportOptions
  ): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];

    for (const token of tokens) {
      switch (token.type) {
        case 'heading':
          elements.push(this.createHeading(token, options));
          break;

        case 'paragraph':
          elements.push(this.createParagraph(token, options));
          break;

        case 'list':
          elements.push(...this.createList(token, options));
          break;

        case 'code':
          elements.push(this.createCodeBlock(token, options));
          break;

        case 'blockquote':
          elements.push(this.createBlockquote(token, options));
          break;

        case 'table':
          elements.push(this.createTable(token, options));
          break;

        case 'hr':
          elements.push(this.createHorizontalRule());
          break;

        case 'space':
          // Skip spaces
          break;

        default:
          // Handle unknown tokens as plain paragraphs
          if ('text' in token && token.text) {
            elements.push(
              new Paragraph({
                text: token.text,
              })
            );
          }
      }
    }

    return elements;
  }

  /**
   * Create heading paragraph
   */
  private createHeading(token: marked.Tokens.Heading, options: DocxExportOptions): Paragraph {
    const headingLevels = [
      HeadingLevel.HEADING_1,
      HeadingLevel.HEADING_2,
      HeadingLevel.HEADING_3,
      HeadingLevel.HEADING_4,
      HeadingLevel.HEADING_5,
      HeadingLevel.HEADING_6,
    ];

    const level = headingLevels[Math.min(token.depth - 1, 5)];
    const text = this.extractText(token.tokens);

    return new Paragraph({
      text,
      heading: level,
      spacing: {
        before: 240,
        after: 120,
      },
    });
  }

  /**
   * Create paragraph with inline formatting
   */
  private createParagraph(token: marked.Tokens.Paragraph, options: DocxExportOptions): Paragraph {
    const runs = this.tokensToTextRuns(token.tokens, options);

    return new Paragraph({
      children: runs,
      spacing: {
        after: 200,
        line: 276, // 1.15 line spacing
      },
    });
  }

  /**
   * Create list items
   */
  private createList(
    token: marked.Tokens.List,
    options: DocxExportOptions
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    for (let i = 0; i < token.items.length; i++) {
      const item = token.items[i];
      const text = this.extractText(item.tokens);

      paragraphs.push(
        new Paragraph({
          text,
          bullet: token.ordered
            ? { level: 0 }
            : { level: 0 },
          spacing: {
            after: 100,
          },
        })
      );
    }

    return paragraphs;
  }

  /**
   * Create code block
   */
  private createCodeBlock(token: marked.Tokens.Code, options: DocxExportOptions): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: token.text,
          font: 'Courier New',
          size: 20,
        }),
      ],
      shading: {
        fill: 'F5F5F5',
      },
      spacing: {
        before: 120,
        after: 120,
      },
    });
  }

  /**
   * Create blockquote
   */
  private createBlockquote(token: marked.Tokens.Blockquote, options: DocxExportOptions): Paragraph {
    const text = this.extractText(token.tokens);

    return new Paragraph({
      children: [
        new TextRun({
          text,
          italics: true,
        }),
      ],
      indent: {
        left: 720, // 0.5 inch
      },
      border: {
        left: {
          color: 'CCCCCC',
          space: 8,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      spacing: {
        after: 200,
      },
    });
  }

  /**
   * Create table
   */
  private createTable(token: marked.Tokens.Table, options: DocxExportOptions): Table {
    const rows: TableRow[] = [];

    // Header row
    if (token.header && token.header.length > 0) {
      const headerCells = token.header.map(
        (cell) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: this.extractText(cell.tokens),
                    bold: true,
                  }),
                ],
              }),
            ],
            shading: {
              fill: 'E0E0E0',
            },
          })
      );

      rows.push(new TableRow({ children: headerCells }));
    }

    // Data rows
    for (const row of token.rows) {
      const cells = row.map(
        (cell) =>
          new TableCell({
            children: [
              new Paragraph({
                text: this.extractText(cell.tokens),
              }),
            ],
          })
      );

      rows.push(new TableRow({ children: cells }));
    }

    return new Table({
      rows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
    });
  }

  /**
   * Create horizontal rule
   */
  private createHorizontalRule(): Paragraph {
    return new Paragraph({
      border: {
        bottom: {
          color: '000000',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      spacing: {
        before: 200,
        after: 200,
      },
    });
  }

  /**
   * Convert inline tokens to TextRuns with formatting
   */
  private tokensToTextRuns(
    tokens: marked.Token[],
    options: DocxExportOptions
  ): TextRun[] {
    const runs: TextRun[] = [];

    for (const token of tokens) {
      switch (token.type) {
        case 'text':
          runs.push(new TextRun({ text: token.text }));
          break;

        case 'strong':
          runs.push(
            new TextRun({
              text: this.extractText(token.tokens),
              bold: true,
            })
          );
          break;

        case 'em':
          runs.push(
            new TextRun({
              text: this.extractText(token.tokens),
              italics: true,
            })
          );
          break;

        case 'codespan':
          runs.push(
            new TextRun({
              text: token.text,
              font: 'Courier New',
              shading: {
                fill: 'F5F5F5',
              },
            })
          );
          break;

        case 'link':
          runs.push(
            new TextRun({
              text: this.extractText(token.tokens),
              color: '0000FF',
              underline: {
                type: UnderlineType.SINGLE,
              },
            })
          );
          break;

        case 'del':
          runs.push(
            new TextRun({
              text: this.extractText(token.tokens),
              strike: true,
            })
          );
          break;

        default:
          if ('text' in token && token.text) {
            runs.push(new TextRun({ text: token.text }));
          }
      }
    }

    return runs;
  }

  /**
   * Extract plain text from tokens
   */
  private extractText(tokens?: marked.Token[]): string {
    if (!tokens) return '';

    let text = '';

    for (const token of tokens) {
      if ('text' in token && token.text) {
        text += token.text;
      }
      if ('tokens' in token && token.tokens) {
        text += this.extractText(token.tokens);
      }
    }

    return text;
  }
}
