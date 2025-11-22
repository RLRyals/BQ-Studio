export type ViolationSeverity = 'critical' | 'warning' | 'minor';

export interface NPEViolation {
  id: string;
  category: NPECategory;
  severity: ViolationSeverity;
  ruleId: string;
  description: string;
  location: {
    bookId?: string;
    chapterId?: string;
    sceneId?: string;
  };
}

export type NPECategory =
  | 'plot-mechanics'
  | 'character-logic'
  | 'scene-architecture'
  | 'dialogue-physics'
  | 'pacing'
  | 'pov-physics'
  | 'transitions'
  | 'information-economy'
  | 'stakes-pressure'
  | 'offstage-narrative';

export interface NPECategoryScore {
  category: NPECategory;
  displayName: string;
  score: number; // 0-100
  violations: number;
  criticalCount: number;
  warningCount: number;
  minorCount: number;
}

export interface NPEComplianceData {
  overallScore: number; // 0-100
  categories: NPECategoryScore[];
  totalViolations: number;
  criticalViolations: number;
  warningViolations: number;
  minorViolations: number;
  lastUpdated: Date;
  context?: {
    bookId?: string;
    bookTitle?: string;
    chapterId?: string;
    chapterTitle?: string;
  };
}

export const NPE_CATEGORY_DISPLAY_NAMES: Record<NPECategory, string> = {
  'plot-mechanics': 'Plot Mechanics',
  'character-logic': 'Character Logic',
  'scene-architecture': 'Scene Architecture',
  'dialogue-physics': 'Dialogue Physics',
  'pacing': 'Pacing',
  'pov-physics': 'POV Physics',
  'transitions': 'Transitions',
  'information-economy': 'Information Economy',
  'stakes-pressure': 'Stakes/Pressure',
  'offstage-narrative': 'Offstage Narrative',
};
