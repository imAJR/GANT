/**
 * GANT — Central Educational Scenario
 * "مشروع المسرحية المدرسية" (School Play Project)
 * Curriculum: Digital Technology 3 — Unit 1: Project Planning
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import { ProjectState, ProjectMetadata, Role, Resource, Task, Assignment, Dependency } from '../types/project';

export const INITIAL_PROJECT_METADATA: ProjectMetadata = {
  id: 'proj_school_play_2026',
  name: 'مشروع المسرحية المدرسية',
  organization: 'التقنية الرقمية 3 — وزارة التعليم',
  description: 'المشروع التعليمي التطبيقي للوحدة الأولى: تخطيط المشروعات في مقرر التقنية الرقمية 3. يهدف إلى التخطيط المتكامل لمسرحية مدرسية تشمل كتابة السيناريو، طاقم التمثيل، الإخراج، المشاهد، والأزياء والعرض الأول.',
  webLink: 'https://al-jabarti.gant.edu.sa',
  startDate: '2026-10-11', // Sunday (first working day of the week)
  weekendDays: [5, 6], // الجمعة (5) والسبت (6) عطلة نهاية الأسبوع
  designer: 'علي بن حامد الجبرتي — Ali bin Hamed Al-Jabarti',
  year: 2026,
};

export const INITIAL_ROLES: Role[] = [
  { id: 'role_pm', name: 'مدير المشروع' },
  { id: 'role_prod', name: 'مدير الإنتاج' },
  { id: 'role_script', name: 'كاتب السيناريو' },
  { id: 'role_casting', name: 'مدير طاقم الممثلين' },
  { id: 'role_director', name: 'المخرج' },
  { id: 'role_actor', name: 'الممثل' },
  { id: 'role_music', name: 'مدير الموسيقى (الملحن)' },
  { id: 'role_scenic', name: 'فنان المشهد' },
  { id: 'role_costume', name: 'مصمم الأزياء' },
  { id: 'role_stage', name: 'مدير المسرح' },
  { id: 'role_lighting', name: 'مصمم الإضاءة' },
];

export const INITIAL_RESOURCES: Resource[] = [
  { id: 'res_mohammed', name: 'محمد', roleId: 'role_pm' },
  { id: 'res_ahmed', name: 'أحمد', roleId: 'role_prod' },
  { id: 'res_bilal', name: 'بلال', roleId: 'role_script' },
  { id: 'res_yahya', name: 'يحيى', roleId: 'role_casting' },
  { id: 'res_saad', name: 'سعد', roleId: 'role_director' },
  { id: 'res_waleed', name: 'وليد', roleId: 'role_actor' },
  { id: 'res_saud', name: 'سعود', roleId: 'role_actor' },
  { id: 'res_sultan', name: 'سلطان', roleId: 'role_actor' },
  { id: 'res_salman', name: 'سلمان', roleId: 'role_music' },
  { id: 'res_ali', name: 'علي', roleId: 'role_scenic' },
  { id: 'res_abdullah', name: 'عبد الله', roleId: 'role_costume' },
  { id: 'res_fahad', name: 'فهد', roleId: 'role_stage' },
  { id: 'res_khaled', name: 'خالد', roleId: 'role_lighting' },
];

/**
 * Tasks of the School Play Project
 * Structure strictly follows prompt requirement:
 * 1. الإنتاج
 * 2. السيناريو
 * 3. طاقم التمثيل
 * 4. قراءة السيناريو
 * 5. الإخراج (Summary Task)
 *    - الموسيقى (child)
 *    - المشهد (child)
 *    - الأزياء (child)
 * 6. البروفات (standalone)
 * 7. الأضواء (standalone)
 * 8. بروفات اللباس (standalone - Milestone)
 * 9. العرض الأول (standalone)
 */
export const INITIAL_TASKS: Task[] = [
  {
    id: 'task_production',
    name: 'الإنتاج',
    parentId: null,
    startDate: '2026-10-11',
    duration: 5,
    priority: 'Normal',
    progress: 75,
    milestone: false,
    summary: false,
    notes: 'التخطيط العام والميزانية واجتماعات إدارة الإنتاج',
  },
  {
    id: 'task_script',
    name: 'السيناريو',
    parentId: null,
    startDate: '2026-10-11',
    duration: 8,
    priority: 'Highest',
    progress: 90,
    milestone: false,
    summary: false,
    notes: 'صياغة النص المسرحي ومراجعته وتجهيز الحوارات',
  },
  {
    id: 'task_cast',
    name: 'طاقم التمثيل',
    parentId: null,
    startDate: '2026-10-18',
    duration: 4,
    priority: 'High',
    progress: 60,
    milestone: false,
    summary: false,
    notes: 'اختيار وتجارب أداء الممثلين واعتماد الأدوار',
  },
  {
    id: 'task_script_reading',
    name: 'قراءة السيناريو',
    parentId: null,
    startDate: '2026-10-22',
    duration: 3,
    priority: 'Normal',
    progress: 30,
    milestone: false,
    summary: false,
    notes: 'جلسة قراءة جماعية لطاقم التمثيل والمخرج',
  },
  {
    id: 'task_directing',
    name: 'الإخراج',
    parentId: null,
    startDate: '2026-10-25',
    duration: 10,
    priority: 'Highest',
    progress: 45,
    milestone: false,
    summary: true, // Summary Task containing Music, Scenery, and Costumes
    notes: 'مهمة تلخيصية تشمل الموسيقى والمشهد وتصميم الأزياء',
  },
  {
    id: 'task_music',
    name: 'الموسيقى',
    parentId: 'task_directing',
    startDate: '2026-10-25',
    duration: 6,
    priority: 'Normal',
    progress: 50,
    milestone: false,
    summary: false,
    notes: 'تأليف المؤثرات الصوتية والمقطوعات المرافقة للعرض',
  },
  {
    id: 'task_scenery',
    name: 'المشهد',
    parentId: 'task_directing',
    startDate: '2026-10-27',
    duration: 7,
    priority: 'High',
    progress: 40,
    milestone: false,
    summary: false,
    notes: 'تصميم وتنفيذ ديكورات خشبة المسرح والخلفيات',
  },
  {
    id: 'task_costumes',
    name: 'الأزياء',
    parentId: 'task_directing',
    startDate: '2026-10-28',
    duration: 5,
    priority: 'Normal',
    progress: 35,
    milestone: false,
    summary: false,
    notes: 'تفصيل وتجهيز أزياء الممثلين والإكسسوارات',
  },
  {
    id: 'task_rehearsals',
    name: 'البروفات',
    parentId: null,
    startDate: '2026-11-04',
    duration: 8,
    priority: 'Highest',
    progress: 20,
    milestone: false,
    summary: false,
    notes: 'البروفات الحية وتدريب الممثلين على الحركة المسرحية',
  },
  {
    id: 'task_lights',
    name: 'الأضواء',
    parentId: null,
    startDate: '2026-11-08',
    duration: 4,
    priority: 'Normal',
    progress: 10,
    milestone: false,
    summary: false,
    notes: 'ضبط وتوجيه الإضاءة المسرحية والتأثيرات الضوئية',
  },
  {
    id: 'task_dress_rehearsal',
    name: 'بروفات اللباس',
    parentId: null,
    startDate: '2026-11-15',
    duration: 0,
    priority: 'Highest',
    progress: 0,
    milestone: true, // Milestone Diamond
    summary: false,
    notes: 'معلم رئيسي: التجربة الشاملة الكاملة بالأزياء والديكور والإضاءة',
  },
  {
    id: 'task_premiere',
    name: 'العرض الأول',
    parentId: null,
    startDate: '2026-11-16',
    duration: 2,
    priority: 'Highest',
    progress: 0,
    milestone: false,
    summary: false,
    notes: 'يوم الافتتاح والعرض المسرحي أمام الجمهور واللجنة المدرسية',
  },
];

/**
 * Verified Educational Dependency:
 * طاقم التمثيل → قراءة السيناريو (Finish-to-Start FS, Link Hardness: Strong)
 */
export const INITIAL_DEPENDENCIES: Dependency[] = [
  {
    id: 'dep_cast_to_reading',
    predecessorId: 'task_cast',
    successorId: 'task_script_reading',
    type: 'FS',
    hardness: 'Strong',
    delay: 0,
  },
  {
    id: 'dep_reading_to_rehearsals',
    predecessorId: 'task_script_reading',
    successorId: 'task_rehearsals',
    type: 'FS',
    hardness: 'Normal',
    delay: 0,
  },
  {
    id: 'dep_rehearsals_to_dress',
    predecessorId: 'task_rehearsals',
    successorId: 'task_dress_rehearsal',
    type: 'FS',
    hardness: 'Strong',
    delay: 0,
  },
  {
    id: 'dep_dress_to_premiere',
    predecessorId: 'task_dress_rehearsal',
    successorId: 'task_premiere',
    type: 'FS',
    hardness: 'Strong',
    delay: 0,
  },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  { id: 'asgn_1', taskId: 'task_production', resourceId: 'res_ahmed', unit: 100.0 },
  { id: 'asgn_2', taskId: 'task_script', resourceId: 'res_bilal', unit: 100.0 },
  { id: 'asgn_3', taskId: 'task_cast', resourceId: 'res_yahya', unit: 100.0 },
  { id: 'asgn_4', taskId: 'task_cast', resourceId: 'res_waleed', unit: 100.0 },
  { id: 'asgn_5', taskId: 'task_script_reading', resourceId: 'res_saad', unit: 100.0 },
  { id: 'asgn_6', taskId: 'task_script_reading', resourceId: 'res_waleed', unit: 100.0 },
  { id: 'asgn_7', taskId: 'task_directing', resourceId: 'res_saad', unit: 100.0 },
  { id: 'asgn_8', taskId: 'task_music', resourceId: 'res_salman', unit: 100.0 },
  { id: 'asgn_9', taskId: 'task_scenery', resourceId: 'res_ali', unit: 100.0 },
  { id: 'asgn_10', taskId: 'task_costumes', resourceId: 'res_abdullah', unit: 100.0 },
  { id: 'asgn_11', taskId: 'task_rehearsals', resourceId: 'res_saad', unit: 100.0 },
  { id: 'asgn_12', taskId: 'task_rehearsals', resourceId: 'res_fahad', unit: 100.0 },
  { id: 'asgn_13', taskId: 'task_lights', resourceId: 'res_khaled', unit: 100.0 },
  { id: 'asgn_14', taskId: 'task_dress_rehearsal', resourceId: 'res_mohammed', unit: 100.0 },
  { id: 'asgn_15', taskId: 'task_premiere', resourceId: 'res_mohammed', unit: 100.0 },
];

export function createInitialProjectState(): ProjectState {
  return {
    project: { ...INITIAL_PROJECT_METADATA },
    tasks: JSON.parse(JSON.stringify(INITIAL_TASKS)),
    roles: JSON.parse(JSON.stringify(INITIAL_ROLES)),
    resources: JSON.parse(JSON.stringify(INITIAL_RESOURCES)),
    assignments: JSON.parse(JSON.stringify(INITIAL_ASSIGNMENTS)),
    dependencies: JSON.parse(JSON.stringify(INITIAL_DEPENDENCIES)),
  };
}

/**
 * Starting state for Stage 1 (Guided Tutorial)
 * Starts with baseline tasks so the student actively learns:
 * Indenting subtasks under Directing, turning dress rehearsal into milestone,
 * creating dependencies, assigning resources, and tracking progress.
 */
export function createTutorialStartState(): ProjectState {
  const baselineTasks: Task[] = [
    {
      id: 'task_production',
      name: 'الإنتاج',
      parentId: null,
      startDate: '2026-10-11',
      duration: 5,
      priority: 'Normal',
      progress: 0,
      milestone: false,
      summary: false,
      notes: 'التخطيط العام والميزانية واجتماعات إدارة الإنتاج',
    },
    {
      id: 'task_script',
      name: 'السيناريو',
      parentId: null,
      startDate: '2026-10-11',
      duration: 5, // Will be set to 8 and Highest priority in Step 2!
      priority: 'Normal', // Will be set to Highest in Step 2!
      progress: 0,
      milestone: false,
      summary: false,
      notes: 'صياغة النص المسرحي ومراجعته وتجهيز الحوارات',
    },
    {
      id: 'task_cast',
      name: 'طاقم التمثيل',
      parentId: null,
      startDate: '2026-10-18',
      duration: 4,
      priority: 'High',
      progress: 0,
      milestone: false,
      summary: false,
      notes: 'اختيار وتجارب أداء الممثلين واعتماد الأدوار',
    },
    {
      id: 'task_script_reading',
      name: 'قراءة السيناريو',
      parentId: null,
      startDate: '2026-10-22',
      duration: 3,
      priority: 'Normal',
      progress: 0,
      milestone: false,
      summary: false,
      notes: 'جلسة قراءة جماعية لطاقم التمثيل والمخرج',
    },
    {
      id: 'task_directing',
      name: 'الإخراج',
      parentId: null,
      startDate: '2026-10-25',
      duration: 10,
      priority: 'Highest',
      progress: 0,
      milestone: false,
      summary: false,
      notes: 'الإشراف الإخراجي على الموسيقى والمشهد والأزياء',
    },
    {
      id: 'task_music',
      name: 'الموسيقى',
      parentId: null, // Will be indented in Step 3!
      startDate: '2026-10-25',
      duration: 6,
      priority: 'Normal',
      progress: 0,
      milestone: false,
      summary: false,
      notes: 'تأليف المؤثرات الصوتية والمقطوعات المرافقة للعرض',
    },
    {
      id: 'task_scenery',
      name: 'المشهد',
      parentId: null, // Will be indented in Step 3!
      startDate: '2026-10-27',
      duration: 7,
      priority: 'High',
      progress: 0,
      milestone: false,
      summary: false,
      notes: 'تصميم وتنفيذ ديكورات خشبة المسرح والخلفيات',
    },
    {
      id: 'task_costumes',
      name: 'الأزياء',
      parentId: null, // Will be indented in Step 3!
      startDate: '2026-10-28',
      duration: 5,
      priority: 'Normal',
      progress: 0,
      milestone: false,
      summary: false,
      notes: 'تفصيل وتجهيز أزياء الممثلين والإكسسوارات',
    },
    {
      id: 'task_rehearsals',
      name: 'البروفات',
      parentId: null,
      startDate: '2026-11-04',
      duration: 4, // Will be adjusted to 8 in Step 5!
      priority: 'Highest',
      progress: 0,
      milestone: false,
      summary: false,
      notes: 'البروفات الحية وتدريب الممثلين على الحركة المسرحية',
    },
    {
      id: 'task_lights',
      name: 'الأضواء',
      parentId: null,
      startDate: '2026-11-08',
      duration: 2, // Will be adjusted to 4 in Step 5!
      priority: 'Normal',
      progress: 0,
      milestone: false,
      summary: false,
      notes: 'ضبط وتوجيه الإضاءة المسرحية والتأثيرات الضوئية',
    },
    {
      id: 'task_dress_rehearsal',
      name: 'بروفات اللباس',
      parentId: null,
      startDate: '2026-11-15',
      duration: 2, // Will be turned into Milestone in Step 4!
      priority: 'Highest',
      progress: 0,
      milestone: false,
      summary: false,
      notes: 'التجربة الشاملة الكاملة بالأزياء والديكور والإضاءة',
    },
    {
      id: 'task_premiere',
      name: 'العرض الأول',
      parentId: null,
      startDate: '2026-11-16',
      duration: 2,
      priority: 'Highest',
      progress: 0,
      milestone: false,
      summary: false,
      notes: 'يوم الافتتاح والعرض المسرحي أمام الجمهور واللجنة المدرسية',
    },
  ];

  // Resources starting with 4 members, Mohammed starts as actor so student sets him to Project Manager in Step 7
  const baselineResources: Resource[] = [
    { id: 'res_mohammed', name: 'محمد', roleId: 'role_actor' }, // Will be assigned role_pm in Step 7!
    { id: 'res_ahmed', name: 'أحمد', roleId: 'role_prod' },
    { id: 'res_bilal', name: 'بلال', roleId: 'role_script' },
    { id: 'res_saad', name: 'سعد', roleId: 'role_director' },
  ];

  return {
    project: {
      ...INITIAL_PROJECT_METADATA,
      weekendDays: [0, 6], // Starts with standard weekend (Sun/Sat) so student sets Friday & Saturday [5, 6] in Step 1!
    },
    tasks: baselineTasks,
    roles: JSON.parse(JSON.stringify(INITIAL_ROLES)),
    resources: baselineResources,
    assignments: [],
    dependencies: [],
  };
}

