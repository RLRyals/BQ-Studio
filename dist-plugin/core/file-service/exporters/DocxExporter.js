"use strict";
/**
 * DOCX Exporter
 * Export markdown to Microsoft Word (.docx) format
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocxExporter = void 0;
const docx_1 = require("docx");
const marked_1 = require("marked");
const fs = __importStar(require("fs/promises"));
const types_1 = require("../types");
/**
 * Default DOCX styling
 * TODO: Use this in the future for custom styling
 */
// const DEFAULT_STYLING = {
//   fontSize: 24, // 12pt (half-points)
//   fontFamily: 'Calibri',
//   lineHeight: 1.15,
//   margins: {
//     top: 1440, // 1 inch in twips
//     right: 1440,
//     bottom: 1440,
//     left: 1440,
//   },
// };
/**
 * DocxExporter class
 * Converts markdown to Word documents with formatting
 */
class DocxExporter {
    /**
     * Export markdown to DOCX
     */
    async export(markdown, options) {
        try {
            const docxOptions = options;
            // Parse markdown to tokens
            const tokens = marked_1.marked.lexer(markdown);
            // Convert tokens to DOCX paragraphs
            const children = this.tokensToDocxElements(tokens, docxOptions);
            // Create document
            const doc = new docx_1.Document({
                sections: [
                    {
                        properties: {
                            page: {
                                margin: {
                                    top: (0, docx_1.convertInchesToTwip)(docxOptions.styling?.margins?.top || 1),
                                    right: (0, docx_1.convertInchesToTwip)(docxOptions.styling?.margins?.right || 1),
                                    bottom: (0, docx_1.convertInchesToTwip)(docxOptions.styling?.margins?.bottom || 1),
                                    left: (0, docx_1.convertInchesToTwip)(docxOptions.styling?.margins?.left || 1),
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
            const buffer = await docx_1.Packer.toBuffer(doc);
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
        }
        catch (error) {
            throw new types_1.FileServiceError('DOCX export failed', types_1.FileServiceErrorCode.EXPORT_FAILED, options.outputPath, error);
        }
    }
    /**
     * Convert markdown tokens to DOCX elements
     */
    tokensToDocxElements(tokens, options) {
        const elements = [];
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
                        elements.push(new docx_1.Paragraph({
                            text: token.text,
                        }));
                    }
            }
        }
        return elements;
    }
    /**
     * Create heading paragraph
     */
    createHeading(token, _options) {
        const headingLevels = [
            docx_1.HeadingLevel.HEADING_1,
            docx_1.HeadingLevel.HEADING_2,
            docx_1.HeadingLevel.HEADING_3,
            docx_1.HeadingLevel.HEADING_4,
            docx_1.HeadingLevel.HEADING_5,
            docx_1.HeadingLevel.HEADING_6,
        ];
        const level = headingLevels[Math.min(token.depth - 1, 5)];
        const text = this.extractText(token.tokens);
        return new docx_1.Paragraph({
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
    createParagraph(token, options) {
        const runs = this.tokensToTextRuns(token.tokens, options);
        return new docx_1.Paragraph({
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
    createList(token, _options) {
        const paragraphs = [];
        for (let i = 0; i < token.items.length; i++) {
            const item = token.items[i];
            const text = this.extractText(item.tokens);
            paragraphs.push(new docx_1.Paragraph({
                text,
                bullet: token.ordered
                    ? { level: 0 }
                    : { level: 0 },
                spacing: {
                    after: 100,
                },
            }));
        }
        return paragraphs;
    }
    /**
     * Create code block
     */
    createCodeBlock(token, _options) {
        return new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
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
    createBlockquote(token, _options) {
        const text = this.extractText(token.tokens);
        return new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
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
                    style: docx_1.BorderStyle.SINGLE,
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
    createTable(token, _options) {
        const rows = [];
        // Header row
        if (token.header && token.header.length > 0) {
            const headerCells = token.header.map((cell) => new docx_1.TableCell({
                children: [
                    new docx_1.Paragraph({
                        children: [
                            new docx_1.TextRun({
                                text: this.extractText(cell.tokens),
                                bold: true,
                            }),
                        ],
                    }),
                ],
                shading: {
                    fill: 'E0E0E0',
                },
            }));
            rows.push(new docx_1.TableRow({ children: headerCells }));
        }
        // Data rows
        for (const row of token.rows) {
            const cells = row.map((cell) => new docx_1.TableCell({
                children: [
                    new docx_1.Paragraph({
                        text: this.extractText(cell.tokens),
                    }),
                ],
            }));
            rows.push(new docx_1.TableRow({ children: cells }));
        }
        return new docx_1.Table({
            rows,
            width: {
                size: 100,
                type: docx_1.WidthType.PERCENTAGE,
            },
        });
    }
    /**
     * Create horizontal rule
     */
    createHorizontalRule() {
        return new docx_1.Paragraph({
            border: {
                bottom: {
                    color: '000000',
                    space: 1,
                    style: docx_1.BorderStyle.SINGLE,
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
    tokensToTextRuns(tokens, _options) {
        const runs = [];
        for (const token of tokens) {
            switch (token.type) {
                case 'text':
                    runs.push(new docx_1.TextRun({ text: token.text }));
                    break;
                case 'strong':
                    runs.push(new docx_1.TextRun({
                        text: this.extractText(token.tokens),
                        bold: true,
                    }));
                    break;
                case 'em':
                    runs.push(new docx_1.TextRun({
                        text: this.extractText(token.tokens),
                        italics: true,
                    }));
                    break;
                case 'codespan':
                    runs.push(new docx_1.TextRun({
                        text: token.text,
                        font: 'Courier New',
                        shading: {
                            fill: 'F5F5F5',
                        },
                    }));
                    break;
                case 'link':
                    runs.push(new docx_1.TextRun({
                        text: this.extractText(token.tokens),
                        color: '0000FF',
                        underline: {
                            type: docx_1.UnderlineType.SINGLE,
                        },
                    }));
                    break;
                case 'del':
                    runs.push(new docx_1.TextRun({
                        text: this.extractText(token.tokens),
                        strike: true,
                    }));
                    break;
                default:
                    if ('text' in token && token.text) {
                        runs.push(new docx_1.TextRun({ text: token.text }));
                    }
            }
        }
        return runs;
    }
    /**
     * Extract plain text from tokens
     */
    extractText(tokens) {
        if (!tokens)
            return '';
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
exports.DocxExporter = DocxExporter;
