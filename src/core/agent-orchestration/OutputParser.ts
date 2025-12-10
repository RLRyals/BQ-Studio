/**
 * Output Parser
 * Parses Claude Code CLI output to extract structured information
 */

import { ClaudeCodeOutput, TokenUsageReport } from './types';

export class OutputParser {
  /**
   * Parse Claude Code CLI output line
   */
  parseLine(line: string): ClaudeCodeOutput | null {
    const timestamp = new Date();

    // Parse phase updates
    const phaseMatch = line.match(/^\[Phase\] (.+)/);
    if (phaseMatch) {
      return {
        type: 'phase-update',
        timestamp,
        data: {
          phase: phaseMatch[1],
        },
      };
    }

    // Parse token usage
    // Format: "Usage: 45,200 tokens (input: 25,450, output: 19,750)"
    const tokenMatch = line.match(/Usage: ([\d,]+) tokens \(input: ([\d,]+), output: ([\d,]+)\)/);
    if (tokenMatch) {
      return {
        type: 'token-usage',
        timestamp,
        data: {
          totalTokens: parseInt(tokenMatch[1].replace(/,/g, ''), 10),
          inputTokens: parseInt(tokenMatch[2].replace(/,/g, ''), 10),
          outputTokens: parseInt(tokenMatch[3].replace(/,/g, ''), 10),
        },
      };
    }

    // Parse progress
    // Format: "Progress: 75%"
    const progressMatch = line.match(/Progress: (\d+)%/);
    if (progressMatch) {
      return {
        type: 'phase-update',
        timestamp,
        data: {
          progress: parseInt(progressMatch[1], 10),
        },
      };
    }

    // Parse errors
    // Format: "[ERROR] Something went wrong"
    const errorMatch = line.match(/^\[ERROR\] (.+)/);
    if (errorMatch) {
      return {
        type: 'error',
        timestamp,
        data: {
          message: errorMatch[1],
        },
      };
    }

    // Parse completion
    if (line.includes('Execution completed successfully') || line.includes('✓ Complete')) {
      return {
        type: 'completion',
        timestamp,
        data: {
          success: true,
        },
      };
    }

    // Regular log line
    return {
      type: 'log',
      timestamp,
      data: {
        message: line,
      },
    };
  }

  /**
   * Parse multiple lines of output
   */
  parseLines(output: string): ClaudeCodeOutput[] {
    const lines = output.split('\n').filter((line) => line.trim().length > 0);
    const results: ClaudeCodeOutput[] = [];

    for (const line of lines) {
      const parsed = this.parseLine(line);
      if (parsed) {
        results.push(parsed);
      }
    }

    return results;
  }

  /**
   * Extract token usage from output
   */
  extractTokenUsage(output: string): TokenUsageReport | null {
    // Look for the final token usage report
    const match = output.match(/Usage: ([\d,]+) tokens \(input: ([\d,]+), output: ([\d,]+)\)/);

    if (!match) {
      return null;
    }

    return {
      jobId: '', // Will be set by caller
      totalTokens: parseInt(match[1].replace(/,/g, ''), 10),
      inputTokens: parseInt(match[2].replace(/,/g, ''), 10),
      outputTokens: parseInt(match[3].replace(/,/g, ''), 10),
      timestamp: new Date(),
    };
  }

  /**
   * Extract current phase from output
   */
  extractCurrentPhase(output: string): string | null {
    const lines = output.split('\n');

    // Find the last phase mentioned
    for (let i = lines.length - 1; i >= 0; i--) {
      const match = lines[i].match(/^\[Phase\] (.+)/);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Extract progress percentage from output
   */
  extractProgress(output: string): number | null {
    const lines = output.split('\n');

    // Find the last progress mentioned
    for (let i = lines.length - 1; i >= 0; i--) {
      const match = lines[i].match(/Progress: (\d+)%/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    return null;
  }

  /**
   * Extract files created from output
   */
  extractFilesCreated(output: string): string[] {
    const files: string[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      const match = line.match(/Created file: (.+)/i);
      if (match) {
        files.push(match[1].trim());
      }
    }

    return files;
  }

  /**
   * Check if output indicates completion
   */
  isComplete(output: string): boolean {
    return (
      output.includes('Execution completed successfully') ||
      output.includes('✓ Complete') ||
      output.includes('All phases completed')
    );
  }

  /**
   * Check if output indicates error
   */
  hasError(output: string): boolean {
    return (
      output.includes('[ERROR]') ||
      output.includes('Error:') ||
      output.includes('Failed to') ||
      output.includes('Exception:')
    );
  }

  /**
   * Extract error message from output
   */
  extractErrorMessage(output: string): string | null {
    const lines = output.split('\n');

    for (const line of lines) {
      if (line.includes('[ERROR]')) {
        return line.replace(/^\[ERROR\]\s*/, '').trim();
      }
      if (line.includes('Error:')) {
        return line.replace(/^.*Error:\s*/, '').trim();
      }
    }

    return null;
  }

  /**
   * Parse agent name from output
   */
  extractAgentName(output: string): string | null {
    const match = output.match(/Agent: (.+)/i);
    return match ? match[1].trim() : null;
  }

  /**
   * Parse skill name from output
   */
  extractSkillName(output: string): string | null {
    const match = output.match(/Executing skill: (.+)/i);
    return match ? match[1].trim() : null;
  }
}
