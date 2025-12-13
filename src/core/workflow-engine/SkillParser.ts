/**
 * SkillParser - Parses skill markdown files to extract workflow phases
 *
 * Extracts:
 * - YAML frontmatter metadata
 * - Individual phases (## Phase N: Title)
 * - Phase content and instructions
 * - MCP operations and permissions per phase
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface SkillMetadata {
  name: string;
  description: string;
  version?: string;
  phase?: string;
  mcps?: string[];
  [key: string]: any;
}

export interface PhaseDefinition {
  phaseNumber: number;
  title: string;
  content: string;
  mcpOperations: string[];
  requiresPermission: boolean;
}

export interface ParsedSkill {
  metadata: SkillMetadata;
  phases: PhaseDefinition[];
  rawContent: string;
  fileName: string;
}

export class SkillParser {
  /**
   * Parse a skill markdown file
   */
  async parseSkillFile(filePath: string): Promise<ParsedSkill> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const fileName = path.basename(filePath);

    // Extract YAML frontmatter
    const metadata = this.extractMetadata(content);

    // Extract phases
    const phases = this.extractPhases(content);

    return {
      metadata,
      phases,
      rawContent: content,
      fileName,
    };
  }

  /**
   * Parse all skills in a directory
   */
  async parseSkillDirectory(dirPath: string): Promise<ParsedSkill[]> {
    const files = await fs.promises.readdir(dirPath);
    const skillFiles = files.filter((f) => f.endsWith('.md'));

    const skills: ParsedSkill[] = [];

    for (const file of skillFiles) {
      const filePath = path.join(dirPath, file);
      try {
        const skill = await this.parseSkillFile(filePath);
        skills.push(skill);
      } catch (error) {
        console.error(`Failed to parse skill file ${file}:`, error);
      }
    }

    return skills;
  }

  /**
   * Extract YAML frontmatter metadata
   */
  private extractMetadata(content: string): SkillMetadata {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) {
      throw new Error('No YAML frontmatter found in skill file');
    }

    const frontmatter = frontmatterMatch[1];

    try {
      const metadata = yaml.load(frontmatter) as SkillMetadata;

      if (!metadata.name) {
        throw new Error('Skill metadata must include "name" field');
      }

      if (!metadata.description) {
        throw new Error('Skill metadata must include "description" field');
      }

      return metadata;
    } catch (error) {
      throw new Error(`Failed to parse YAML frontmatter: ${error}`);
    }
  }

  /**
   * Extract phases from markdown content
   */
  private extractPhases(content: string): PhaseDefinition[] {
    // Remove frontmatter for phase extraction
    const contentWithoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');

    // Find all phase headers: ## Phase N: Title
    const phaseRegex = /^## Phase (\d+): (.+)$/gm;
    const phaseMatches = Array.from(contentWithoutFrontmatter.matchAll(phaseRegex));

    if (phaseMatches.length === 0) {
      throw new Error('No phases found in skill file');
    }

    const phases: PhaseDefinition[] = [];

    for (let i = 0; i < phaseMatches.length; i++) {
      const match = phaseMatches[i];
      const phaseNumber = parseInt(match[1], 10);
      const title = match[2].trim();
      const startIndex = match.index!;

      // Extract content until next phase or end of file
      const nextPhaseMatch = phaseMatches[i + 1];
      const endIndex = nextPhaseMatch ? nextPhaseMatch.index! : contentWithoutFrontmatter.length;
      const phaseContent = contentWithoutFrontmatter.slice(startIndex, endIndex).trim();

      // Extract MCP operations from phase content
      const mcpOperations = this.extractMCPOperations(phaseContent);
      const requiresPermission = this.checkPermissionRequirement(phaseContent);

      phases.push({
        phaseNumber,
        title,
        content: phaseContent,
        mcpOperations,
        requiresPermission,
      });
    }

    // Sort by phase number
    phases.sort((a, b) => a.phaseNumber - b.phaseNumber);

    return phases;
  }

  /**
   * Extract MCP operations mentioned in phase content
   */
  private extractMCPOperations(phaseContent: string): string[] {
    const operations: string[] = [];

    // Look for patterns like:
    // - server-name.operation_name()
    // - `server-name.operation_name`
    // - "server-name.operation_name"
    const operationPatterns = [
      /([a-z-]+)-server\.([a-z_]+)\(/g,
      /`([a-z-]+)-server\.([a-z_]+)`/g,
      /"([a-z-]+)-server\.([a-z_]+)"/g,
    ];

    for (const pattern of operationPatterns) {
      const matches = Array.from(phaseContent.matchAll(pattern));
      for (const match of matches) {
        const server = match[1];
        const operation = match[2];
        const fullOperation = `${server}-server.${operation}`;
        if (!operations.includes(fullOperation)) {
          operations.push(fullOperation);
        }
      }
    }

    return operations;
  }

  /**
   * Check if phase requires user permission (write operations)
   */
  private checkPermissionRequirement(phaseContent: string): boolean {
    // Look for permission-related keywords
    const permissionKeywords = [
      'permission',
      'approval',
      'create_',
      'add_',
      'update_',
      'delete_',
      'modify_',
      'ALWAYS ASK PERMISSION',
      'Required Permission Flow',
    ];

    const contentLower = phaseContent.toLowerCase();

    return permissionKeywords.some((keyword) => contentLower.includes(keyword.toLowerCase()));
  }

  /**
   * Generate workflow template name from skill metadata
   */
  generateWorkflowName(metadata: SkillMetadata): string {
    // Convert skill name to title case
    // e.g., "book-planning-skill" -> "Book Planning"
    return metadata.name
      .replace(/-skill$/, '')
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Generate phase name for workflow step
   */
  generatePhaseName(phase: PhaseDefinition): string {
    return `Phase ${phase.phaseNumber}: ${phase.title}`;
  }

  /**
   * Extract dependencies between phases
   * (Phases are sequential by default, but this could be extended)
   */
  extractPhaseDependencies(phases: PhaseDefinition[]): Map<number, number[]> {
    const dependencies = new Map<number, number[]>();

    // By default, each phase depends on the previous phase
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      if (i > 0) {
        const previousPhase = phases[i - 1];
        dependencies.set(phase.phaseNumber, [previousPhase.phaseNumber]);
      } else {
        dependencies.set(phase.phaseNumber, []);
      }
    }

    return dependencies;
  }

  /**
   * Generate description for workflow template
   */
  generateWorkflowDescription(metadata: SkillMetadata, phases: PhaseDefinition[]): string {
    const phaseCount = phases.length;
    const phaseList = phases.map((p) => p.title).join(', ');

    return `${metadata.description}\n\nThis workflow contains ${phaseCount} phases: ${phaseList}.`;
  }
}
