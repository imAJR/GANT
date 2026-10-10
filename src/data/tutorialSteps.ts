/**
 * GANT — Educational Steps & Mastery Curriculum
 * Strictly follows Digital Technology 3 — Unit 1: Project Planning
 * Central Scenario: School Play Project (مشروع المسرحية المدرسية)
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import { ProjectState, ComputedTask } from '../types/project';
import { INITIAL_TASKS, createTutorialStartState } from './initialProject';

export interface TutorialStep {
  id: number;
  number: number;
  title: string;
  shortInstruction: string;
  description: string;
  mascotTip: string;
  hint: string;
  actionRequired: string;
  highlightTargetId: string; // DOM ID or target identifier for glow/highlight
  targetTaskId?: string; // Target task ID if applicable
  whatText: string;
  whereText: string;
  howText: string;
  validate: (state: ProjectState, computedTasks: ComputedTask[]) => boolean;
  getPedagogicalError?: (state: ProjectState, computedTasks: ComputedTask[]) => string | null;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    number: 1,
    title: 'تعيين خصائص المشروع والتقويم',
    shortInstruction: 'افتح خصائص المشروع واضبط عطلة نهاية الأسبوع لتكون يومي الجمعة والسبت [5, 6].',
    description: 'الخطوة الأولى في أي مشروع هي تعريف خصائصه الأساسية: الاسم والمؤسسة وأيام عطلة نهاية الأسبوع لكي يحسب البرنامج أيام العمل بدقة.',
    mascotTip: 'مرحبًا بك! أنا نحلة جانت. في برنامج جانت بروجكت والمحاكي، نبدأ دائمًا من "خصائص المشروع". انقر على زر "خصائص المشروع" المميز في شريط الأدوات، ثم تبويب "التقويم" وحدد يومي الجمعة والسبت كعطلة أسبوعية!',
    hint: 'انقر على زر "خصائص المشروع" في شريط الأدوات، ثم تبويب "التقويم"، وتأكد من تحديد يومي الجمعة والسبت وإلغاء تحديد الأحد ثم انقر "حفظ وتطبيق".',
    actionRequired: 'فتح خصائص المشروع وتحديد عطلة الجمعة والسبت واستبعاد الأحد.',
    highlightTargetId: 'btn-project-props',
    whatText: 'تعيين خصائص المشروع الأساسية وأيام العطلة الأسبوعية (الجمعة والسبت) لحساب أيام العمل بدقة.',
    whereText: 'زر "خصائص المشروع" في شريط الأدوات العلوي.',
    howText: 'انقر على "خصائص المشروع"، افتح تبويب "التقويم"، حدد يومي الجمعة والسبت [5, 6] وألغِ تحديد الأحد، ثم انقر تطبيق وحفظ.',
    validate: (state) => {
      const hasWeekend =
        state.project.weekendDays.includes(5) &&
        state.project.weekendDays.includes(6) &&
        !state.project.weekendDays.includes(0);
      return hasWeekend && state.project.name.length > 0;
    },
    getPedagogicalError: (state) => {
      if (!state.project.weekendDays.includes(5) || !state.project.weekendDays.includes(6) || state.project.weekendDays.includes(0)) {
        return 'لم يتم ضبط عطلة الجمعة والسبت بدقة بعد. افتح "خصائص المشروع" -> تبويب "التقويم" -> حدد الجمعة والسبت وألغِ تحديد الأحد.';
      }
      return null;
    },
  },
  {
    id: 2,
    number: 2,
    title: 'تحديد أولويات المهام ومددها',
    shortInstruction: 'اضبط مدة مهمة "السيناريو" وأولويتها وفق احتياجات التخطيط.',
    description: 'المهام هي الأنشطة المحددة للمشروع. يتيح برنامج جانت تعيين أولوية ومدة كل مهمة لتحديد مسار العمل الحرج.',
    mascotTip: 'حدد مهمة "السيناريو" في الجدول وافتح خصائص المهمة، واضبط المدة والأولوية بما يتناسب مع خطة المسرحية!',
    hint: 'حدد صف "السيناريو"، واضغط زر "خصائص المهمة" واضبط المدة والأولوية ثم احفظ.',
    actionRequired: 'ضبط مدة مهمة السيناريو وأولويتها.',
    highlightTargetId: 'btn-task-props',
    targetTaskId: 'task_script',
    whatText: 'ضبط مدة وأولوية مهمة "السيناريو".',
    whereText: 'صف مهمة "السيناريو" وزر خصائص المهمة.',
    howText: 'افتح خصائص مهمة السيناريو، ثم عدّل المدة والأولوية واحفظ التغييرات.',
    validate: (state) => {
      const script = state.tasks.find((t) => t.id === 'task_script');
      if (!script) return false;
      return script.duration !== 5 && script.priority !== 'Normal';
    },
    getPedagogicalError: () => 'لم تُكمل تعديل المهمة بعد. غيّر مدة «السيناريو» من 5 أيام، وعدّل أولويتها من «عادي» إلى أولوية مناسبة، ثم تحقق مجددًا.',
  },
  {
    id: 3,
    number: 3,
    title: 'إنشاء المهام الفرعية (Summary Task)',
    shortInstruction: 'اجعل مهمة "الإخراج" مهمة تلخيصية تحتوي على: الموسيقى، المشهد، الأزياء باستخدام زر تقديم المسافة البادئة (Indent).',
    description: 'المهمة التلخيصية (Summary Task) تجمع تحتها مهاماً فرعية مترابطة. في مسرحيتنا، يشرف الإخراج على ثلاثة جوانب فنية رئيسية.',
    mascotTip: 'حدد مهمة "الموسيقى" ثم انقر على زر "تقديم المسافة البادئة" المميز بالسهم، وكرر ذلك مع "المشهد" و"الأزياء" لتصبح مهاماً فرعية للإخراج!',
    hint: 'حدد مهمة الموسيقى ثم اضغط زر "تقديم المسافة البادئة" في شريط الأدوات، ثم كرر مع المشهد والأزياء.',
    actionRequired: 'تقديم المسافة البادئة لمهام الموسيقى والمشهد والأزياء لتصبح تحت الإخراج.',
    highlightTargetId: 'btn-indent',
    targetTaskId: 'task_music',
    whatText: 'إنشاء هيكل العمل (WBS) بتمييز مهام الموسيقى، المشهد، الأزياء كمهام فرعية تحت مهمة "الإخراج".',
    whereText: 'صفوف مهام (الموسيقى، المشهد، الأزياء) وزر تقديم المسافة البادئة (Indent) في شريط الأدوات.',
    howText: 'حدد مهمة الموسيقى ثم انقر زر Indent، وكرر مع المشهد والأزياء لتدخل تحت الإخراج.',
    validate: (_, computedTasks) => {
      const directing = computedTasks.find((t) => t.id === 'task_directing');
      if (!directing || !directing.hasChildren) return false;
      const childrenIds = directing.childrenIds;
      return (
        childrenIds.includes('task_music') &&
        childrenIds.includes('task_scenery') &&
        childrenIds.includes('task_costumes')
      );
    },
    getPedagogicalError: (_, computedTasks) => {
      const directing = computedTasks.find((t) => t.id === 'task_directing');
      const childrenIds = directing?.childrenIds ?? [];
      const missing = [
        ['task_music', 'الموسيقى'],
        ['task_scenery', 'المشهد'],
        ['task_costumes', 'الأزياء'],
      ].filter(([id]) => !childrenIds.includes(id)).map(([, name]) => name);
      if (missing.length > 0) {
        return `اجعل المهام التالية مهامًا فرعية تحت «الإخراج»: ${missing.join('، ')}. حدّد كل مهمة واستخدم زر تقديم المسافة البادئة (Indent).`;
      }
      return null;
    },
  },
  {
    id: 4,
    number: 4,
    title: 'إضافة معالم المشروع (Milestones)',
    shortInstruction: 'حول مهمة "بروفات اللباس" إلى معلم رئيسي (Milestone) بمدة 0 يوم ورمز المعين ◆ (اختيار تصميمي تعليمي في GANT).',
    description: 'المعلم الرئيسي يمثل حدثاً فاصلاً في المشروع بدون استغراق وقت (مدته 0 يوم). بروفات اللباس هي خيار تصميمي تعليمي في GANT لاختبار الجاهزية.',
    mascotTip: 'حدد مهمة "بروفات اللباس" في الجدول، ثم اضغط على زر المعين ◆ في شريط الأدوات.',
    hint: 'حدد صف "بروفات اللباس" ثم انقر على زر المعين ◆ في شريط الأدوات.',
    actionRequired: 'تحويل مهمة بروفات اللباس إلى معلم رئيسي (Milestone).',
    highlightTargetId: 'btn-milestone',
    targetTaskId: 'task_dress_rehearsal',
    whatText: 'تحويل مهمة "بروفات اللباس" إلى معلم رئيسي (Milestone) بمدة صفرية.',
    whereText: 'صف مهمة "بروفات اللباس" وزر المعين (◆) في شريط الأدوات.',
    howText: 'حدد صف "بروفات اللباس" وانقر فوق زر المعين ◆ في شريط الأدوات.',
    validate: (state) => {
      const dress = state.tasks.find((t) => t.id === 'task_dress_rehearsal');
      return !!(dress && dress.milestone && dress.duration === 0);
    },
    getPedagogicalError: (state) => {
      const dress = state.tasks.find((t) => t.id === 'task_dress_rehearsal');
      if (!dress?.milestone) {
        return 'مهمة «بروفات اللباس» لم تُحوّل إلى معلم رئيسي بعد. حدّدها واضغط زر المعين ◆.';
      }
      if (dress.duration !== 0) {
        return 'المعلم الرئيسي يجب أن تكون مدته صفر يوم. افتح خصائص «بروفات اللباس» وتأكد من تفعيل المعلم الرئيسي.';
      }
      return null;
    },
  },
  {
    id: 5,
    number: 5,
    title: 'تحديد مواعيد المهام والمدد النهائية',
    shortInstruction: 'اضبط مدد مهام "البروفات" و"الأضواء" بما يتناسب مع خطة المشروع.',
    description: 'كل مهمة تحتاج إلى مدة عمل محددة. في جانت، تاريخ الانتهاء يُحسب تلقائياً باستبعاد أيام العطل الأسبوعية.',
    mascotTip: 'في جدول المهام أو خصائص المهمة: اضبط مدد البروفات والأضواء بقيم صالحة.',
    hint: 'اضبط مدة مهمتي البروفات والأضواء إما في الجدول مباشرة أو عبر نافذة الخصائص.',
    actionRequired: 'ضبط مدد مهام البروفات والأضواء.',
    highlightTargetId: 'row-task_rehearsals',
    targetTaskId: 'task_rehearsals',
    whatText: 'ضبط مدة مهام البروفات والأضواء.',
    whereText: 'جدول المهام أو أشرطة مخطط جانت.',
    howText: 'تعديل مدة البروفات والأضواء في حقل المدة.',
    validate: (state) => {
      const reh = state.tasks.find((t) => t.id === 'task_rehearsals');
      const lights = state.tasks.find((t) => t.id === 'task_lights');
      if (!reh || !lights) return false;
      return reh.duration !== 4 && lights.duration !== 2;
    },
    getPedagogicalError: () => 'عدّل مدتي المهمتين معًا: «البروفات» من 4 أيام، و«الأضواء» من يومين، ثم تحقق مجددًا.',
  },
  {
    id: 6,
    number: 6,
    title: 'إضافة موارد المشروع (Resources)',
    shortInstruction: 'انتقل إلى تبويب "الموارد" وتأكد من تسجيل أعضاء فريق المسرحية.',
    description: 'الموارد هم الأشخاص المشاركون في تنفيذ أنشطة المشروع. يوفر جانت تبويباً مخصصاً لإدارة أسماء الموارد وأدوارهم.',
    mascotTip: 'انقر على تبويب "الموارد وفريق العمل (Resources)" بالأعلى، وتأكد من وجود موارد الفريق.',
    hint: 'انقر على تبويب [الموارد وفريق العمل] أعلى مساحة العمل.',
    actionRequired: 'التحقق من وجود موارد المشروع وأعضاء الفريق.',
    highlightTargetId: 'tab-resources',
    whatText: 'إدارة موارد وعمالة المشروع.',
    whereText: 'تبويب "الموارد وفريق العمل (Resources)".',
    howText: 'مراجعة وإضافة الموارد المرتبطة بالمسرحية.',
    validate: (state) => {
      return state.resources.length > 4 || state.resources.some((r) => !['res_mohammed', 'res_ahmed', 'res_bilal', 'res_saad'].includes(r.id));
    },
    getPedagogicalError: () => 'تأكد من إضافة موارد جديدة تزيد عن الموارد الاربع الابتدائية في تبويب الموارد.',
  },
  {
    id: 7,
    number: 7,
    title: 'تعيين أدوار الموارد ومدير المشروع',
    shortInstruction: 'في تبويب "الموارد"، عيّن دور "مدير المشروع" للعضو محمد.',
    description: 'تحديد دور كل فرد يضمن وضوح المسؤوليات وتوزيع مهام المسرحية وفق تخصص كل عضو.',
    mascotTip: 'في تبويب الموارد، افتح القائمة المنسدلة بجوار اسم "محمد" واختر دور "مدير المشروع"!',
    hint: 'في جدول الموارد، اختر دور "مدير المشروع" للعضو محمد من القائمة المنسدلة.',
    actionRequired: 'إسناد دور "مدير المشروع" للعضو محمد.',
    highlightTargetId: 'tab-resources',
    whatText: 'تعيين دور "مدير المشروع" للعضو محمد.',
    whereText: 'جدول الموارد في تبويب الموارد.',
    howText: 'بجوار اسم "محمد"، افتح القائمة المنسدلة للأدوار واختر "مدير المشروع".',
    validate: (state) => {
      const pmRole = state.roles.find((r) => r.name.includes('مدير المشروع') || r.id === 'role_pm');
      if (!pmRole) return false;
      const mohammed = state.resources.find((r) => r.id === 'res_mohammed' || r.name.includes('محمد'));
      return !!(mohammed && mohammed.roleId === pmRole.id);
    },
    getPedagogicalError: () => 'لم يتم إسناد دور "مدير المشروع" للعضو محمد بعد. في تبويب الموارد، اختر "مدير المشروع" بجوار اسمه.',
  },
  {
    id: 8,
    number: 8,
    title: 'تخصيص الموارد لمهام المشروع',
    shortInstruction: 'خصص الموارد لمهام المسرحية من نافذة خصائص المهمة أو تبويب الموارد.',
    description: 'تخصيص المورد يربط الشخص بالمهمة المسؤولة عنه.',
    mascotTip: 'حدد مهمة الإخراج أو السيناريو، وافتح خصائص المهمة، ثم خصص المورد المطلوب.',
    hint: 'افتح خصائص مهمة من شريط الأدوات وخصص المورد.',
    actionRequired: 'تخصيص موارد لمهام المشروع.',
    highlightTargetId: 'btn-task-props',
    targetTaskId: 'task_directing',
    whatText: 'تخصيص الموارد لمهام المشروع.',
    whereText: 'خصائص المهمة (تبويب الموارد).',
    howText: 'تخصيص مورد لمهمة في المشروع.',
    validate: (state) => {
      if (!state.assignments || state.assignments.length === 0) return false;
      return state.assignments.some((a) => {
        const taskExists = state.tasks.some((t) => t.id === a.taskId);
        const resourceExists = state.resources.some((r) => r.id === a.resourceId);
        const validUnit = typeof a.unit === 'number' && !isNaN(a.unit) && a.unit > 0;
        return taskExists && resourceExists && validUnit;
      });
    },
    getPedagogicalError: () => 'يجب تخصيص مورد صالح وموجود لمهمة موجودة في المشروع بنسبة تخصيص صحيحة.',
  },
  {
    id: 9,
    number: 9,
    title: 'إضافة علاقات المهام والاعتماديات (Dependencies)',
    shortInstruction: 'أنشئ التبعية التعليمية الأساسية: طاقم التمثيل ← قراءة السيناريو (Finish-to-Start FS - رابط قوي).',
    description: 'علاقة الانتهاء للبدء (FS) تعني أن قراءة السيناريو لا يمكن أن تبدأ حتى يكتمل اختيار طاقم التمثيل بالكامل.',
    mascotTip: 'في المخطط، اسحب نقطة الرابط الدائرية من نهاية شريط "طاقم التمثيل" إلى "قراءة السيناريو"، أو افتح خصائص قراءة السيناريو وأضفها من تبويب التبعيات!',
    hint: 'أنشئ رابطًا قويًا من نوع Finish-to-Start (FS) بين مهمة طاقم التمثيل ومهمة قراءة السيناريو.',
    actionRequired: 'إنشاء علاقة الانتهاء للبدء FS بين طاقم التمثيل وقراءة السيناريو.',
    highlightTargetId: 'row-task_cast',
    targetTaskId: 'task_script_reading',
    whatText: 'إنشاء علاقة اعتمادية الانتهاء للبدء (FS) بين طاقم التمثيل وقراءة السيناريو.',
    whereText: 'مخطط جانت أو تبويب التبعيات في خصائص قراءة السيناريو.',
    howText: 'اربط نهاية شريط "طاقم التمثيل" ببداية شريط "قراءة السيناريو"، واختر النوع FS وقوة الرابط "قوي".',
    validate: (state) => {
      return state.dependencies.some(
        (d) => d.predecessorId === 'task_cast' &&
          d.successorId === 'task_script_reading' &&
          d.type === 'FS' &&
          d.hardness === 'Strong'
      );
    },
    getPedagogicalError: () => 'التبعية المطلوبة غير مكتملة. أنشئ رابط FS قويًا من «طاقم التمثيل» إلى «قراءة السيناريو».',
  },
  {
    id: 10,
    number: 10,
    title: 'تغيير تواريخ المهام (Task Date Modification)',
    shortInstruction: 'قم بتغيير تاريخ بدء مهمة "السيناريو" فعليًا في جدول المهام أو نافذة الخصائص.',
    description: 'تغيير تواريخ المهام يعكس جدولة العمل الفعلي وتعديل المخطط الزمني.',
    mascotTip: 'افتح خصائص مهمة "السيناريو" أو غير تاريخ البدء (Start Date) لمهمة السيناريو لتنعكس على المخطط!',
    hint: 'غير تاريخ بدء مهمة السيناريو إلى تاريخ مختلف عن التاريخ الافتراضي.',
    actionRequired: 'تغيير تاريخ البدء الفعلي لمهمة السيناريو.',
    highlightTargetId: 'row-task_script',
    targetTaskId: 'task_script',
    whatText: 'تغيير تاريخ بدء مهمة "السيناريو".',
    whereText: 'خصائص المهمة أو جدول المهام.',
    howText: 'تعديل تاريخ البدء لمهمة السيناريو.',
    validate: (state) => {
      const script = state.tasks.find((t) => t.id === 'task_script');
      if (!script) return false;
      return script.startDate !== '2026-10-11';
    },
    getPedagogicalError: () => 'لم يتم تغيير تاريخ بدء مهمة "السيناريو" مقارنة بالوضع الابتدائي للدرس.',
  },
];

export const OFFICIAL_MASTERY_SKILLS = [
  {
    id: 'skill_1',
    number: 1,
    title: 'التمييز بين تخطيط المشروع وإدارته',
    description: 'فهم الفروق الجوهرية بين التخطيط المسبق (تحديد النطاق والجدول الزمني) والإدارة التنفيذية (متابعة الموارد والتقدم وحل التحديات).',
  },
  {
    id: 'skill_2',
    number: 2,
    title: 'تعيين أدوار العناصر المرتبطة بالمشروع',
    description: 'تحديد مهام مدير المشروع، إدارة الميزانية والتكاليف، وتعيين الموارد البشرية وتوزيع الأدوار الوظيفية بدقة.',
  },
  {
    id: 'skill_3',
    number: 3,
    title: 'محاكاة إنشاء وتخطيط المشروع باستخدام GANT',
    description: 'القدرة على استخدام بيئة المحاكاة المكتبية لإنشاء المشاريع، وضبط التقويم وعطلات نهاية الأسبوع، وتنظيم هيكل العمل (WBS).',
  },
  {
    id: 'skill_4',
    number: 4,
    title: 'تحديد أولويات المهام وفقًا للاحتياجات',
    description: 'ترتيب الأولويات (Normal, High, Highest) والتركيز على المهام الحرجة مثل كتابة السيناريو وبروفات الممثلين.',
  },
  {
    id: 'skill_5',
    number: 5,
    title: 'تحديد معالم المشروع ومواعيده النهائية',
    description: 'إنشاء المعالم الرئيسية (Milestones) بمدة صفرية كالبروفة النهائية، وحساب المواعيد النهائية (End Dates) تلقائياً.',
  },
  {
    id: 'skill_6',
    number: 6,
    title: 'تعيين المهام لأعضاء الفريق',
    description: 'إسناد الموارد للمهام بنسب التخصيص المناسبة (الوحدات 100.0) وإدارة العلاقات والاعتماديات (FS, SS, FF, SF) بين المهام.',
  },
];

export const STAGE_2_OBJECTIVES = [
  {
    id: 'obj_all_tasks',
    title: 'اكتمال قائمة مهام المسرحية المدرسية (12 مهمة)',
    check: (state: ProjectState) => state.tasks.length >= 12,
  },
  {
    id: 'obj_directing_subtasks',
    title: 'الإخراج مهمة تلخيصية تضم الموسيقى والمشهد والأزياء',
    check: (_: ProjectState, computed: ComputedTask[]) => {
      const directing = computed.find((t) => t.id === 'task_directing');
      if (!directing || !directing.hasChildren) return false;
      const ids = directing.childrenIds;
      return ids.includes('task_music') && ids.includes('task_scenery') && ids.includes('task_costumes');
    },
  },
  {
    id: 'obj_dress_milestone',
    title: 'تحديد بروفات اللباس كمعلم رئيسي (Milestone)',
    check: (state: ProjectState) => {
      const t = state.tasks.find((task) => task.id === 'task_dress_rehearsal');
      return !!(t && t.milestone && t.duration === 0);
    },
  },
  {
    id: 'obj_dependencies_core',
    title: 'إنشاء رابط تبعية قوي: طاقم التمثيل ← قراءة السيناريو (FS)',
    check: (state: ProjectState) => {
      return state.dependencies.some(
        (d) => d.predecessorId === 'task_cast' &&
          d.successorId === 'task_script_reading' &&
          d.type === 'FS' &&
          d.hardness === 'Strong'
      );
    },
  },
  {
    id: 'obj_rehearsals_dependency',
    title: 'إنشاء رابط التبعية بين بروفات اللباس والعرض الأول',
    check: (state: ProjectState) => {
      return state.dependencies.some(
        (d) => d.predecessorId === 'task_dress_rehearsal' && d.successorId === 'task_premiere'
      );
    },
  },
  {
    id: 'obj_assignments_complete',
    title: 'تخصيص الموارد لجميع المهام الأساسية (10 تخصيصات على الأقل)',
    check: (state: ProjectState) => state.assignments.length >= 10,
  },
];
