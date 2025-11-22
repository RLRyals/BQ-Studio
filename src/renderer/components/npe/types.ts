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

// Dialogue Physics Monitor types
export type DialogueViolationType = 'echolalia' | 'no-subtext' | 'cross-purpose';

export interface DialogueLine {
  id: string;
  sceneId: string;
  lineNumber: number;
  character: string;
  text: string;
  violations: DialogueViolationType[];
  hasSubtext: boolean;
  subtextSuggestion?: string;
  severity: ViolationSeverity | null;
}

export interface DialoguePhysicsData {
  sceneId: string;
  sceneTitle: string;
  lines: DialogueLine[];
  echolaliaCount: number;
  noSubtextCount: number;
  crossPurposeCount: number;
  overallScore: number; // 0-100
  lastUpdated: Date;
}

// Stakes/Pressure Gauge types
export type PressureThread = 'main' | 'subplot-a' | 'subplot-b' | 'romance' | 'character-arc';

export interface PressureCheckpoint {
  id: string;
  storyPosition: number; // 0-100 (percentage through story)
  title: string;
  description: string;
  thread: PressureThread;
}

export interface PressureDataPoint {
  storyPosition: number; // 0-100 (percentage through story)
  pressureLevel: number; // 0-100
  thread: PressureThread;
  hasViolation: boolean;
  violationMessage?: string;
}

export interface EscalationValidation {
  position: number;
  isValid: boolean;
  message: string;
  severity: ViolationSeverity;
}

export interface StakesPressureData {
  bookId: string;
  bookTitle: string;
  threads: PressureThread[];
  dataPoints: PressureDataPoint[];
  checkpoints: PressureCheckpoint[];
  escalationValidations: EscalationValidation[];
  totalViolations: number;
  lastUpdated: Date;
}

export const PRESSURE_THREAD_COLORS: Record<PressureThread, string> = {
  'main': '#3b82f6', // blue
  'subplot-a': '#10b981', // green
  'subplot-b': '#f59e0b', // amber
  'romance': '#ec4899', // pink
  'character-arc': '#8b5cf6', // purple
};

export const PRESSURE_THREAD_NAMES: Record<PressureThread, string> = {
  'main': 'Main Plot',
  'subplot-a': 'Subplot A',
  'subplot-b': 'Subplot B',
  'romance': 'Romance',
  'character-arc': 'Character Arc',
};

// Causality Chain Types
export type CausalityNodeType = 'decision' | 'consequence' | 'violation';
export type CausalityArrowType = 'direct' | 'delayed' | 'broken';

export interface CausalityNode {
  id: string;
  type: CausalityNodeType;
  label: string;
  description: string;
  characterId?: string;
  characterName?: string;
  chapterId?: string;
  sceneId?: string;
  x: number; // Position for layout
  y: number;
}

export interface CausalityLink {
  id: string;
  sourceId: string;
  targetId: string;
  type: CausalityArrowType;
  label?: string;
  strength?: number; // 0-100 for visualization
}

export interface CausalityChainData {
  nodes: CausalityNode[];
  links: CausalityLink[];
  filters: {
    characterIds?: string[];
    chapterIds?: string[];
    plotThreads?: string[];
  };
  lastUpdated: Date;
}

// Decision Tree Types
export type AlignmentType = 'goal' | 'fear' | 'wound' | 'value';

export interface AlignmentIndicator {
  type: AlignmentType;
  name: string;
  alignment: number; // -100 (against) to 100 (with)
  description: string;
}

export interface DecisionAlternative {
  id: string;
  label: string;
  description: string;
  plausibility: number; // 0-100
  alignments: AlignmentIndicator[];
  consequencePreview: string;
  chosen: boolean;
}

export interface DecisionNode {
  id: string;
  chapterId?: string;
  sceneId?: string;
  characterId: string;
  characterName: string;
  decisionPoint: string;
  context: string;
  alternatives: DecisionAlternative[];
  actualConsequence?: string;
  timestamp?: Date;
}

export interface DecisionTreeData {
  decisions: DecisionNode[];
  filters: {
    characterIds?: string[];
    chapterIds?: string[];
  };
  whatIfMode: boolean;
  lastUpdated: Date;
}

// ============================================================================
// Pacing Analyzer Types
// ============================================================================

export type SceneType = 'micro' | 'medium' | 'centerpiece';
export type TimeTreatment = 'expand' | 'compress' | 'neutral';

export interface ScenePacing {
  sceneId: string;
  sceneName: string;
  sceneNumber: number;
  wordCount: number;
  type: SceneType;
  timeTreatment: TimeTreatment;
  energyLevel: number; // 0-100
}

export interface EnergyModulation {
  sceneNumber: number;
  tension: number; // 0-100
  volume: number; // 0-100 (quiet to loud)
  conflict: number; // 0-100 (connection to conflict)
}

export interface PacingIssue {
  id: string;
  type: 'monotony' | 'imbalance' | 'warning';
  severity: ViolationSeverity;
  description: string;
  affectedScenes: number[];
}

export interface PacingRecommendation {
  id: string;
  sceneNumber: number;
  recommendation: string;
  reasoning: string;
}

export interface NPEPacingData {
  scenes: ScenePacing[];
  energyModulation: EnergyModulation[];
  issues: PacingIssue[];
  recommendations: PacingRecommendation[];
  lastUpdated: Date;
  context?: {
    bookId?: string;
    bookTitle?: string;
    chapterId?: string;
    chapterTitle?: string;
  };
}

// ============================================================================
// Information Flow Graph Types
// ============================================================================

export type ImpactLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface InformationReveal {
  id: string;
  sceneNumber: number;
  timestamp: number; // Percentage through story (0-100)
  information: string;
  impactLevel: ImpactLevel;
  changedBehavior: boolean; // Did this alter a character's choice?
  affectedCharacters: string[];
}

export interface CharacterKnowledge {
  characterName: string;
  knownInformation: string[];
  unknownCriticalInfo: string[];
}

export interface InformationIssue {
  id: string;
  type: 'premature-reveal' | 'missing-impact' | 'orphaned-reveal';
  severity: ViolationSeverity;
  description: string;
  revealId: string;
}

export interface NPEInformationFlowData {
  reveals: InformationReveal[];
  characterKnowledge: CharacterKnowledge[];
  issues: InformationIssue[];
  lastUpdated: Date;
  context?: {
    bookId?: string;
    bookTitle?: string;
    chapterId?: string;
    chapterTitle?: string;
  };
}

// Character State Tracker Types
export type CharacterVersionLabel = 'V1' | 'V2' | 'V3' | 'V4';

export type BehavioralPalette =
  | 'anxiety'
  | 'attraction'
  | 'anger'
  | 'fear'
  | 'shame'
  | 'joy'
  | 'grief'
  | 'contempt'
  | 'curiosity';

export type ContextState = 'baseline' | 'mild-stress' | 'moderate-stress' | 'extreme-stress';

export interface WoundHealing {
  woundName: string;
  healingProgress: number; // 0-100
  active: boolean;
}

export interface CharacterVersion {
  version: CharacterVersionLabel;
  storyPosition: number; // 0-100 (percentage through story)
  label: string; // e.g., "Beginning", "Midpoint", "Climax", "Aftermath"
  activeBehaviors: BehavioralPalette[];
  contextState: ContextState;
  wounds: WoundHealing[];
  transitionTrigger?: string; // What event caused the version change
}

export interface CharacterTimeline {
  characterId: string;
  characterName: string;
  color: string;
  versions: CharacterVersion[];
}

export interface CharacterStateData {
  timelines: CharacterTimeline[];
  lastUpdated: Date;
  context?: {
    bookId?: string;
    bookTitle?: string;
  };
}

// POV Bias Tracker Types
export type BiasLevel = 'objective' | 'mildly-biased' | 'strongly-biased' | 'unreliable';

export interface Misreading {
  event: string;
  povInterpretation: string;
  actualReality?: string;
  severity: 'minor' | 'moderate' | 'critical';
}

export interface SelectiveAttention {
  noticed: string[];
  ignored: string[];
  significance: string; // Why this pattern matters
}

export interface OperatingSystemReveal {
  worldviewElement: string;
  howItShapesPerception: string;
  example: string;
}

export interface ScenePOVState {
  sceneId: string;
  sceneTitle: string;
  povCharacter: string;
  biasLevel: BiasLevel;
  isSubjective: boolean;
  misreadings: Misreading[];
  selectiveAttention: SelectiveAttention;
  operatingSystemReveals: OperatingSystemReveal[];
  validationNotes?: string;
}

export interface POVBiasData {
  scenes: ScenePOVState[];
  overallSubjectivity: number; // 0-100 (higher = more subjective/biased)
  totalMisreadings: number;
  criticalMisreadings: number;
  lastUpdated: Date;
  context?: {
    bookId?: string;
    bookTitle?: string;
    chapterId?: string;
    chapterTitle?: string;
  };
}
