/**
 * GANT — Contextual AI & Pedagogical Assistant Service ("نحلة جانت")
 * Integrates official @google/genai SDK (gemini-3.8-flash) with rich project context injection,
 * interactive action generation, and an intelligent local curriculum fallback engine.
 * Designed for Digital Technology 3 (Unit 1: Project Planning)
 * By: Ali bin Hamed Al-Jabarti (2026)
 */

import { GoogleGenAI } from '@google/genai';
import { ProjectState, ComputedTask, StudentProfile } from '../types/project';
import { TUTORIAL_STEPS, STAGE_2_OBJECTIVES } from '../data/tutorialSteps';

export interface AssistantAction {
  id: string;
  label: string;
  actionType:
    | 'highlight'
    | 'open_task_props'
    | 'open_project_props'
    | 'open_resources'
    | 'open_step_modal'
    | 'select_task'
    | 'next_step';
  targetId?: string;
  taskId?: string;
  tooltip?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actions?: AssistantAction[];
  isError?: boolean;
}

export interface AssistantContext {
  profile: StudentProfile;
  state: ProjectState;
  computedTasks: ComputedTask[];
  selectedTask?: ComputedTask | null;
}

/**
 * Builds a structured, real-time context summary for the AI engine
 */
export function buildProjectContextSummary(context: AssistantContext): string {
  const { profile, state, computedTasks, selectedTask } = context;
  const currentStep = profile.currentStage === 1 ? TUTORIAL_STEPS[profile.tutorialStepIndex] : null;
  const isStepValid = currentStep ? currentStep.validate(state, computedTasks) : false;
  const stepError = currentStep && !isStepValid && currentStep.getPedagogicalError
    ? currentStep.getPedagogicalError(state, computedTasks)
    : null;

  const weekendNames = state.project.weekendDays.map((d) => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[d] || `${d}`;
  });

  const directingTask = computedTasks.find((t) => t.id === 'task_directing' || t.name.includes('الإخراج'));
  const hasDirectingSummary = directingTask?.hasChildren && directingTask?.summary;

  const contextData = {
    studentName: profile.studentName || 'الطالب',
    stage: profile.currentStage === 1
      ? `المرحلة 1: التدريب الموجّه (الخطوة ${profile.tutorialStepIndex + 1} من 10)`
      : profile.currentStage === 2
      ? 'المرحلة 2: التحدي المستقل'
      : 'المرحلة 3: الإدارة الحرة الكاملة',
    currentTutorialStep: currentStep
      ? {
          number: currentStep.number,
          title: currentStep.title,
          requiredAction: currentStep.actionRequired,
          isCompletedNow: isStepValid,
          missingReasonOrError: stepError,
          targetElementId: currentStep.highlightTargetId,
          targetTaskId: currentStep.targetTaskId,
        }
      : null,
    selectedTask: selectedTask
      ? {
          id: selectedTask.id,
          name: selectedTask.name,
          duration: `${selectedTask.duration} يوم`,
          startDate: selectedTask.startDate,
          endDate: selectedTask.endDate,
          priority: selectedTask.priority,
          progress: `${selectedTask.progress}%`,
          isMilestone: selectedTask.milestone,
          isSummary: selectedTask.summary,
          parentTaskId: selectedTask.parentId,
          assignedResources: state.assignments
            .filter((a) => a.taskId === selectedTask.id)
            .map((a) => state.resources.find((r) => r.id === a.resourceId)?.name)
            .filter(Boolean),
          predecessors: state.dependencies
            .filter((d) => d.successorId === selectedTask.id)
            .map((d) => {
              const pred = state.tasks.find((t) => t.id === d.predecessorId);
              return `${pred?.name || d.predecessorId} (${d.type})`;
            }),
        }
      : 'لم يتم تحديد أي مهمة حالياً',
    projectOverview: {
      name: state.project.name,
      startDate: state.project.startDate,
      weekendDays: weekendNames.join('، '),
      tasksCount: state.tasks.length,
      resourcesCount: state.resources.length,
      dependenciesCount: state.dependencies.length,
      isDirectingSummary: !!hasDirectingSummary,
    },
  };

  return JSON.stringify(contextData, null, 2);
}

/**
 * System prompt strictly defining the persona of "نحلة جانت"
 */
const SYSTEM_PROMPT = `
أنت "نحلة جانت" (GANT Bee) 🐝 — المساعد التعليمي الذكي والمدرّب التفاعلي لبرنامج ومحاكي جانت بروجكت (GANT).
أنت مصمم خصيصاً لمساعدة طلاب المرحلة الثانوية في مادة "التقنية الرقمية 3" (الوحدة الأولى: تخطيط المشروعات).

شخصيتك وأسلوبك:
- ودود، مشجع، علمي، وتستخدم لغة عربية فصيحة واضحة ومبسطة مع إيموجي خفيفة (🐝، 💡، 🎯، ⚙️).
- ملم بمنهج التقنية الرقمية 3 وتفاصيل برنامج GanttProject وسيناريو "مشروع المسرحية المدرسية".
- إجاباتك دقيقة ومباشرة، لا تتجاوز 2-4 فقرات أو نقاط سريعة، حتى لا ترهق الطالب.
- تربط إجاباتك فوراً بما هو موجود على شاشة الطالب وحالة مشروعه الحالية المرفقة في السياق.
- إذا سأل الطالب عن زر أو أداة أو إجراء، اشرح له مكانه في شريط الأدوات (Toolbar) أو القوائم العلوية (TopMenu) أو نافذة الخصائص.

المفاهيم المحورية في المنهج:
1. المهام التلخيصية (Summary Tasks): مهمة تجمع تحتها مهام فرعية، مثل مهمة "الإخراج" التي تجمع (الموسيقى، المشهد، الأزياء) عبر زر تقديم المسافة البادئة (Indent). لا تُدخل مدتها يدوياً، بل تُحسب تلقائياً من أول مهمة فرعية لآخرها.
2. المعالم الرئيسية (Milestones): حدث ذو أهمية خاصة مدته 0 يوم ورمزه معين ◆، مثل مهمة "بروفات اللباس".
3. التبعيات الأربعة (Dependencies):
   - FS (Finish-to-Start / الانتهاء للبدء): لا تبدأ المهمة اللاحقة حتى تنتهي السابقة (مثل: طاقم التمثيل -> قراءة السيناريو).
   - SS (Start-to-Start / البدء للبدء): تبدأ المهمتان معاً.
   - FF (Finish-to-Finish / الانتهاء للانتهاء): تنتهي المهمتان معاً.
   - SF (Start-to-Finish / البدء للانتهاء): تنتهي اللاحقة عند بدء السابقة.
4. الموارد (Resources): فريق العمل المكلف بالمهام، التخصيص الافتراضي 100.0 (تفرغ كامل).
5. التقويم وعطلة نهاية الأسبوع: استبعاد الجمعة والسبت من أيام العمل، مما يؤثر تلقائياً على تاريخ الانتهاء عند تغيير المدة.

أوامر التوجيه التفاعلي:
يمكنك في نهاية ردك تضمين إشارات التوجيه التفاعلي بهذا الشكل لتتحول إلى أزرار تفاعلية فورية للطالب:
[ACTION:highlight:btn-task-props:أرني زر خصائص المهمة ⚙️]
[ACTION:highlight:btn-project-props:أرني زر خصائص المشروع 📅]
[ACTION:highlight:btn-indent:أرني زر تقديم المسافة البادئة ➡️]
[ACTION:highlight:btn-new-task:أرني زر مهمة جديدة ➕]
[ACTION:highlight:btn-milestone:أرني زر المعلم الرئيسي 💎]
[ACTION:highlight:tab-resources:أرني تبويب الموارد 👥]
[ACTION:open_task_props:فتح خصائص المهمة مباشرة]
[ACTION:open_project_props:فتح خصائص المشروع والتقويم]
[ACTION:open_step_modal:عرض الدليل المفصل للخطوة الحالية 🧭]
`;

/**
 * Extracts action tags from AI response
 */
function extractActions(responseText: string): { cleanText: string; actions: AssistantAction[] } {
  const actions: AssistantAction[] = [];
  const actionRegex = /\[ACTION:([a-zA-Z0-9_-]+)(?::([a-zA-Z0-9_-]+))?(?::([^\]]+))?\]/g;

  let cleanText = responseText;
  let match: RegExpExecArray | null;

  while ((match = actionRegex.exec(responseText)) !== null) {
    const rawActionType = match[1];
    const targetIdOrParam = match[2];
    const label = match[3] || 'تنفيذ الإجراء';

    let actionType: AssistantAction['actionType'] = 'highlight';
    let targetId = targetIdOrParam;

    if (rawActionType === 'highlight') {
      actionType = 'highlight';
      targetId = targetIdOrParam;
    } else if (rawActionType === 'open_task_props') {
      actionType = 'open_task_props';
      targetId = 'btn-task-props';
    } else if (rawActionType === 'open_project_props') {
      actionType = 'open_project_props';
      targetId = 'btn-project-props';
    } else if (rawActionType === 'open_resources') {
      actionType = 'open_resources';
      targetId = 'tab-resources';
    } else if (rawActionType === 'open_step_modal') {
      actionType = 'open_step_modal';
    } else if (rawActionType === 'next_step') {
      actionType = 'next_step';
    }

    actions.push({
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      label,
      actionType,
      targetId,
    });
  }

  // Remove the action tags from display text
  cleanText = cleanText.replace(actionRegex, '').trim();

  return { cleanText, actions };
}

/**
 * Comprehensive Local Pedagogical Engine for instant or offline responses
 */
export function generateLocalPedagogicalAnswer(
  userQuery: string,
  context: AssistantContext
): { text: string; actions: AssistantAction[] } {
  const q = userQuery.trim().toLowerCase();
  const { profile, state, computedTasks, selectedTask } = context;
  const currentStep = profile.currentStage === 1 ? TUTORIAL_STEPS[profile.tutorialStepIndex] : null;
  const isStepValid = currentStep ? currentStep.validate(state, computedTasks) : false;
  const stepError = currentStep && !isStepValid && currentStep.getPedagogicalError
    ? currentStep.getPedagogicalError(state, computedTasks)
    : null;

  // 1. How to add a new task?
  if (q.includes('مهمة جديدة') || q.includes('اضيف مهمة') || q.includes('إضافة مهمة') || q.includes('كيف اضيف')) {
    return {
      text: `لإضافة مهمة جديدة في محاكي GANT:\n\n1. انقر على زر **مهمة جديدة (+)** الموجود في شريط الأدوات العلوي، أو استخدم اختصار لوحة المفاتيح **Ctrl+N**.\n2. ستظهر مهمة جديدة أسفل المهمة المحددة حالياً.\n3. يمكنك النقر نقراً مزدوجاً على اسمها في الجدول لتغييره أو فتح نافذة **خصائص المهمة** لضبط المدة والأولوية والتواريخ.`,
      actions: [
        {
          id: 'act-new-task',
          label: 'أرني زر مهمة جديدة ➕',
          actionType: 'highlight',
          targetId: 'btn-new-task',
        },
      ],
    };
  }

  // 2. Why did the end date change?
  if (q.includes('تاريخ انتهاء') || q.includes('نهاية المهمة') || q.includes('تغير تاريخ') || q.includes('تغير التاريخ')) {
    const weekendFriSat = state.project.weekendDays.includes(5) && state.project.weekendDays.includes(6);
    return {
      text: `يتغير تاريخ انتهاء المهمة تلقائياً في برنامج جانت للأسباب التالية:\n\n1. **تقويم أيام العطلة الأسبوعية**: عند تفعيل عطلة الجمعة والسبت، يستبعد محرك الجدولة هذه الأيام من مدة العمل، فيمتد تاريخ الانتهاء تلقائياً لتعويض أيام العطلة.\n2. **تعديل مدة المهمة**: تاريخ الانتهاء = تاريخ البدء + مدة أيام العمل الفعلية.\n3. **علاقات التبعية (Dependencies)**: إذا كانت المهمة مرتبطة بمهمة سابقة بنوع FS وتأخرت المهمة السابقة، تزحف هذه المهمة تلقائياً للأمام.\n\n${
        weekendFriSat
          ? '💡 تقويم مشروعك الحالي يستبعد يومي الجمعة والسبت بدقة وفق المنهج الدراسي.'
          : '⚠️ لاحظ أن إعدادات تقويم مشروعك قد تحتاج مراجعة في خصائص المشروع.'
      }`,
      actions: [
        {
          id: 'act-proj-props',
          label: 'فحص تقويم المشروع 📅',
          actionType: 'open_project_props',
          targetId: 'btn-project-props',
        },
      ],
    };
  }

  // 3. How to make a subtask under a summary task?
  if (q.includes('فرعية') || q.includes('تلخيصية') || q.includes('مسافة بادئة') || q.includes('indent') || q.includes('تابعة')) {
    return {
      text: `لتحويل مهمة إلى مهمة فرعية تابعة لمهمة رئيسية (Summary Task):\n\n1. حدد صف المهمة التي تريد جعلها فرعية في جدول المهام الأيسر.\n2. تأكد من أن المهمة الرئيسية تقع مباشرة فوقها في الترتيب.\n3. انقر على زر **تقديم المسافة البادئة (Indent ➡️)** في شريط الأدوات العلوي.\n4. ستتحول المهمة التي تعلوها فوراً إلى مهمة تلخيصية بشريط أسود مميز ومثلث لطي وفرز المهام.\n\n🎯 في مشروع المسرحية، نطبق ذلك على مهام (الموسيقى، المشهد، الأزياء) لتصبح تحت "الإخراج".`,
      actions: [
        {
          id: 'act-indent',
          label: 'أرني زر تقديم المسافة (Indent) ➡️',
          actionType: 'highlight',
          targetId: 'btn-indent',
        },
      ],
    };
  }

  // 4. Differences between FS, SS, FF, SF dependencies?
  if (q.includes('fs') || q.includes('ss') || q.includes('ff') || q.includes('sf') || q.includes('علاقات') || q.includes('تبعيات') || q.includes('التبعية')) {
    return {
      text: `في منهج التقنية الرقمية 3 وبرنامج جانت بروجكت، توجد 4 أنواع لعلاقات التبعية بين المهام:\n\n* **FS (Finish-to-Start / الانتهاء للبدء)**: الأكثر استخداماً. لا تبدأ المهمة اللاحقة حتى تكتمل المهمة السابقة تماماً (مثل: الانتهاء من "طاقم التمثيل" لبدء "قراءة السيناريو").\n* **SS (Start-to-Start / البدء للبدء)**: تبدأ المهمتان معاً في نفس الوقت.\n* **FF (Finish-to-Finish / الانتهاء للانتهاء)**: تنتهي المهمتان معاً في نفس الوقت.\n* **SF (Start-to-Finish / البدء للانتهاء)**: نادرة الاستخدام، لا يمكن أن تنتهي المهمة اللاحقة حتى تبدأ المهمة السابقة.\n\n💡 لربط مهمتين، اسحب بسهم الماوس من نهاية شريط المهمة الأولى إلى بداية المهمة الثانية في المخطط الزمني، أو من تبويب التبعيات في خصائص المهمة.`,
      actions: [
        {
          id: 'act-task-props',
          label: 'فتح خصائص المهمة لضبط التبعيات ⚙️',
          actionType: 'open_task_props',
          targetId: 'btn-task-props',
        },
      ],
    };
  }

  // 5. How to assign a resource?
  if (q.includes('مورد') || q.includes('تخصيص') || q.includes('فريق') || q.includes('موارد') || q.includes('شخص')) {
    return {
      text: `لتخصيص مورد بشري لمهمة معينة:\n\n1. أولاً: تأكد من إضافة الشخص في تبويب **الموارد وفريق العمل (Resources)**.\n2. ثانياً: حدد المهمة المطلوبة في الجدول وافتح نافذة **خصائص المهمة**.\n3. انتقِل إلى تبويب **الموارد (Resources)** داخل نافذة الخصائص.\n4. انقر "إضافة مورد" واختر اسم الشخص، وحدد نسبة التخصيص (الافتراضي 100.0% أي تفرغ كامل للمهمة)، ثم انقر "موافق".`,
      actions: [
        {
          id: 'act-resources-tab',
          label: 'عرض تبويب الموارد 👥',
          actionType: 'open_resources',
          targetId: 'tab-resources',
        },
        {
          id: 'act-task-props-res',
          label: 'فتح خصائص المهمة ⚙️',
          actionType: 'open_task_props',
          targetId: 'btn-task-props',
        },
      ],
    };
  }

  // 6. What is required to complete the current stage?
  if (q.includes('المرحلة الحالية') || q.includes('اكمال المرحلة') || q.includes('إكمال المرحلة') || q.includes('المطلوب مني') || q.includes('متطلبات')) {
    if (profile.currentStage === 1) {
      const remainingCount = 10 - profile.completedTutorialSteps.length;
      return {
        text: `أنت حالياً في **المرحلة 1: التدريب الموجّه** 🎓\n\n- الخطوة الحالية: **الخطوة ${profile.tutorialStepIndex + 1}: ${currentStep?.title}**.\n- المطلوب في هذه الخطوة: ${currentStep?.actionRequired}\n- الحالة الآن: ${isStepValid ? '✅ مستوفاة وجاهزة للانتقال!' : '⏳ قيد التنفيذ.'}\n- المتبقي لإكمال المرحلة الأولى: ${remainingCount} خطوات من أصل 10.\n\nبمجرد إنجاز الخطوة العاشرة سيفتح لك زر إكمال المرحلة والانتقال للتحدي المستقل!`,
        actions: [
          {
            id: 'act-step-guide',
            label: 'عرض الدليل المفصل للخطوة 🧭',
            actionType: 'open_step_modal',
          },
        ],
      };
    } else if (profile.currentStage === 2) {
      const stage2Results = STAGE_2_OBJECTIVES.map((obj) => ({
        title: obj.title,
        met: obj.check(state, computedTasks),
      }));
      const metCount = stage2Results.filter((r) => r.met).length;
      return {
        text: `أنت حالياً في **المرحلة 2: التحدي المستقل** 🏆\n\nأنجزت ${metCount} من أصل 6 معايير:\n${stage2Results
          .map((r) => `${r.met ? '✅' : '⭕'} ${r.title}`)
          .join('\n')}\n\nعند استيفاء جميع المعايير الستة، ستحصل على وسام الإتقان ويُفتح لك وضع الإدارة الحرة الكاملة!`,
        actions: [],
      };
    } else {
      return {
        text: `أنت في **المرحلة 3: الإدارة الحرة** 🚀\nلقد أتممت جميع مراحل التدريب والتحدي بنجاح! يمكنك الآن إدارة مشروعك بالكامل وإضافة مهام وحفظ واستيراد وتصدير ملفات المشاريع دون قيود.`,
        actions: [],
      };
    }
  }

  // 7. Why is the tutorial step not considered complete?
  if (q.includes('لم يعتبر') || q.includes('غير مكتملة') || q.includes('لماذا لم') || q.includes('ليش مو مكتمل') || q.includes('خطأ')) {
    if (profile.currentStage === 1 && currentStep) {
      if (isStepValid) {
        return {
          text: `🎉 رائع! الخطوة الحالية (**${currentStep.title}**) مكتملة ومستوفاة بالفعل! يمكنك الآن الضغط على زر **الخطوة التالية** في اللوحة السفلية لمتابعة التقدم.`,
          actions: [
            {
              id: 'act-next',
              label: 'الانتقال للخطوة التالية ➡️',
              actionType: 'next_step',
            },
          ],
        };
      } else {
        return {
          text: `🔍 فحصت حالة مشروعك بالنسبة للخطوة (${currentStep.number}: ${currentStep.title}):\n\n**السبب**: ${stepError || 'لم يتم تطبيق الإجراء المطلوب بدقة بعد.'}\n\n**المطلوب بالتحديد**:\n${currentStep.howText}\n\n💡 الموقع: ${currentStep.whereText}`,
          actions: [
            {
              id: 'act-step-guide',
              label: 'عرض الدليل المفصل 🧭',
              actionType: 'open_step_modal',
            },
            {
              id: 'act-highlight-target',
              label: 'أرني موقع الأداة 📍',
              actionType: 'highlight',
              targetId: currentStep.highlightTargetId,
            },
          ],
        };
      }
    } else {
      return {
        text: `أنت لست في مسار الخطوات التعليمية حالياً، بل في وضع التحدي أو الإدارة الحرة. يمكنك استخدام تبويب "فحص المشروع" في لوحتي لمشاهدة التحقق التلقائي من المعايير!`,
        actions: [],
      };
    }
  }

  // 8. Where is the tool I need?
  if (q.includes('اين') || q.includes('أين أجد') || q.includes('مكان') || q.includes('وين الزر') || q.includes('موقع')) {
    if (selectedTask) {
      return {
        text: `المهمة المحددة حالياً هي **"${selectedTask.name}"**.\n\nتجد جميع أدوات التحكم بها في **شريط الأدوات العلوي**:\n- **خصائص المهمة**: زر المسننات/المنزلقات (Sliders).\n- **تقديم المسافة البادئة**: سهم Indent لجعلها فرعية.\n- **المعلم الرئيسي**: رمز المعين ◆ لتحويلها لمعلم مدته 0.\n- **حذف المهمة**: أيقونة سلة المهملات الحمراء.`,
        actions: [
          {
            id: 'act-props',
            label: 'أرني زر خصائص المهمة ⚙️',
            actionType: 'highlight',
            targetId: 'btn-task-props',
          },
        ],
      };
    }
    return {
      text: `تتوزع أدوات التحكم في واجهة جانت كالتالي:\n\n1. **شريط الأدوات العلوي (Toolbar)**: يضم الحفظ، التراجع، إضافة مهمة جديدة، المسافة البادئة، المعلم الرئيسي، وخصائص المشروع.\n2. **شريط القوائم (TopMenu)**: يضم قوائم (المشروع، المهام، عرض، المساعدة).\n3. **تبويبات مساحة العمل**: للتبديل بين "مخطط جانت والمهام" و"الموارد وفريق العمل".\n4. **لوحة نحلة جانت السفلية**: لمتابعة خطواتك التعليمية ونسبة تقدمك.`,
      actions: [
        {
          id: 'act-highlight-proj',
          label: 'أرني زر خصائص المشروع 📅',
          actionType: 'highlight',
          targetId: 'btn-project-props',
        },
      ],
    };
  }

  // 9. Selected Task specific question
  if (selectedTask && (q.includes('هذه المهمة') || q.includes(selectedTask.name.toLowerCase()))) {
    return {
      text: `معلومات المهمة المحددة حالياً **"${selectedTask.name}"**:\n\n- المدة: ${selectedTask.duration} يوم.\n- تاريخ البدء: ${selectedTask.startDate} حتى ${selectedTask.endDate}.\n- الأولوية: ${selectedTask.priority} | نسبة الإنجاز: ${selectedTask.progress}%.\n- معلم رئيسي: ${selectedTask.milestone ? 'نعم ◆' : 'لا'}.\n- مهمة تلخيصية: ${selectedTask.summary ? 'نعم (تضم مهاماً فرعية)' : 'لا'}.\n\nهل ترغب في فتح نافذة الخصائص لتعديل أي من هذه الحقول؟`,
      actions: [
        {
          id: 'act-open-task-props',
          label: 'فتح خصائص المهمة ⚙️',
          actionType: 'open_task_props',
          targetId: 'btn-task-props',
        },
      ],
    };
  }

  // Default intelligent contextual answer
  return {
    text: `أهلاً بك يا ${profile.studentName || 'صديقي'}! 🐝\n\nأنا نحلة جانت، رفيقتك في تعلم مهارات إدارة المشروعات وفق منهج التقنية الرقمية 3.\n\nمشروعك الحالي هو **${state.project.name}** ويحتوي على **${state.tasks.length} مهام** و**${state.resources.length} موارد**.\n\nيمكنك سؤالي عن أي مفهوم في المنهج (مثل المهام التلخيصية، المعالم الرئيسية، علاقات التبعية FS/SS، تقويم العطلة، أو كيفية حل الخطوة الحالية). كيف يمكنني مساعدتك؟`,
    actions: currentStep
      ? [
          {
            id: 'act-show-step',
            label: `المطلوب في الخطوة ${currentStep.number} 🧭`,
            actionType: 'open_step_modal',
          },
        ]
      : [],
  };
}

export type AssistantConnectionStatus = 'checking' | 'cloud_connected' | 'local_fallback' | 'cloud_error';

/**
 * Main query function: Attempts Gemini 3.8 Flash with full context,
 * falling back transparently to the robust local pedagogical engine.
 */
export async function askGanttBeeAssistant(
  userQuery: string,
  history: Array<{ role: 'user' | 'assistant'; text: string }>,
  context: AssistantContext
): Promise<{ text: string; actions: AssistantAction[]; source: 'cloud' | 'fallback' }> {
  const contextSummary = buildProjectContextSummary(context);

  // Check for API key in environment
  const apiKey =
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    '';

  if (!apiKey) {
    // Return high-quality local contextual response immediately
    const local = generateLocalPedagogicalAnswer(userQuery, context);
    return { ...local, source: 'fallback' };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Format chat history for context
    const recentHistory = history.slice(-6).map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.text }],
    }));

    const promptMessage = `
[سياق مشروع الطالب الحالي في التطبيق]
${contextSummary}

[سؤال الطالب]
${userQuery}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        ...recentHistory,
        {
          role: 'user',
          parts: [{ text: promptMessage }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.4,
        maxOutputTokens: 800,
      },
    });

    const responseText = response.text || '';
    if (!responseText.trim()) {
      const local = generateLocalPedagogicalAnswer(userQuery, context);
      return { ...local, source: 'fallback' };
    }

    const { cleanText, actions } = extractActions(responseText);

    // If Gemini didn't attach any actions, generate contextual fallback actions
    if (actions.length === 0) {
      const localResult = generateLocalPedagogicalAnswer(userQuery, context);
      return { text: cleanText, actions: localResult.actions, source: 'cloud' };
    }

    return { text: cleanText, actions, source: 'cloud' };
  } catch (error) {
    console.warn('[GANT Bee Assistant] Gemini API error, falling back to local engine:', error);
    const local = generateLocalPedagogicalAnswer(userQuery, context);
    return { ...local, source: 'fallback' };
  }
}
