/**
 * GANT — Interactive Project Planning Simulator
 * Data Models & Types
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

export type PriorityLevel = 'Low' | 'Normal' | 'High' | 'Highest';

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';
// FS: Finish-to-Start (الانتهاء للبدء)
// SS: Start-to-Start (البدء للبدء)
// FF: Finish-to-Finish (الانتهاء للانتهاء)
// SF: Start-to-Finish (البدء للانتهاء)

export type LinkHardness = 'Strong' | 'Normal';

export interface Role {
  id: string;
  name: string;
}

export interface Resource {
  id: string;
  name: string;
  roleId: string;
}

export interface Assignment {
  id: string;
  taskId: string;
  resourceId: string;
  unit: number; // default 100.0 (not a percentage string)
}

export interface Dependency {
  id: string;
  predecessorId: string;
  successorId: string;
  type: DependencyType;
  hardness: LinkHardness;
  delay: number; // in days (lag)
}

export interface Task {
  id: string;
  name: string;
  parentId: string | null;
  startDate: string; // YYYY-MM-DD
  duration: number; // working days (0 for milestone)
  priority: PriorityLevel;
  progress: number; // 0 to 100
  milestone: boolean;
  summary?: boolean; // computed or explicit
  color?: string; // optional visual accent
  notes?: string;
  deadline?: string | null; // YYYY-MM-DD
}

export interface ComputedTask extends Task {
  endDate: string; // YYYY-MM-DD (calculated by scheduling engine)
  level: number; // indentation depth (0 = root)
  hasChildren: boolean;
  childrenIds: string[];
  isExpanded?: boolean;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  organization: string;
  description: string;
  webLink: string;
  startDate: string; // Project base start date (YYYY-MM-DD)
  weekendDays: number[]; // Day of week (0=Sunday, 1=Monday, ..., 5=Friday, 6=Saturday)
  designer: string;
  year: number;
}

export interface ProjectState {
  project: ProjectMetadata;
  tasks: Task[];
  roles: Role[];
  resources: Resource[];
  assignments: Assignment[];
  dependencies: Dependency[];
}

export type AppScreen = 'welcome' | 'name_input' | 'stage_select' | 'workspace';
export type WorkspaceTab = 'gantt' | 'resources';

export type TutorialStepStatus = 'not_started' | 'in_progress' | 'needs_correction' | 'completed';

export interface StudentProfile {
  studentName: string;
  currentStage: 1 | 2 | 3;
  unlockedStages: number[];
  tutorialStepIndex: number; // 0 to 9 for the 10 tutorial steps
  completedTutorialSteps: number[];
  stage2Completed: boolean;
  stage3Completed: boolean;
  appScreen: AppScreen;
  activeWorkspaceTab: WorkspaceTab;
  stepStatus?: TutorialStepStatus;
  highlightTargetId?: string | null;
}

export interface MasterySkill {
  id: string;
  number: number;
  title: string;
  description: string;
  isMastered: boolean;
  score: number; // 0 to 100
}

export interface ViewSettings {
  showEnglishTerms: boolean;
  language?: 'ar' | 'en';
  showTodayLine: boolean;
  showDependencies: boolean;
  showWeekendHighlight: boolean;
  zoomLevel: 'day' | 'week' | 'month';
  tableWidthPercent: number; // Splitter position
  selectedTaskId: string | null;
  collapsedTaskIds: string[];
}
