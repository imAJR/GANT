/**
 * GANT — Authentic GanttProject Desktop Task Properties Dialog
 * Tabbed desktop dialog (General, Predecessors, Resources),
 * Parent hierarchy assignment, and classic desktop styling.
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  GitBranch,
  Users,
  Calendar,
  Clock,
  Diamond,
  Plus,
  Trash2,
  Check,
  FolderTree,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { DependencyType, LinkHardness, PriorityLevel, Task } from '../../types/project';

interface TaskPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskPropertiesModal: React.FC<TaskPropertiesModalProps> = ({ isOpen, onClose }) => {
  const {
    state,
    computedTasks,
    viewSettings,
    updateTask,
    addDependency,
    removeDependency,
    updateDependency,
    assignResourceToTask,
    unassignResourceFromTask,
    updateAssignmentUnit,
    setTaskParent,
  } = useProject();

  const [activeTab, setActiveTab] = useState<'general' | 'dependencies' | 'resources'>('general');

  // Local editing copy of task fields
  const [formName, setFormName] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formDuration, setFormDuration] = useState(1);
  const [formPriority, setFormPriority] = useState<PriorityLevel>('Normal');
  const [formProgress, setFormProgress] = useState(0);
  const [formMilestone, setFormMilestone] = useState(false);
  const [formDeadline, setFormDeadline] = useState<string | null>(null);
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [formNotes, setFormNotes] = useState('');

  // Form states for new dependency
  const [newPredId, setNewPredId] = useState<string>('');
  const [newDepType, setNewDepType] = useState<DependencyType>('FS');
  const [newDepHardness, setNewDepHardness] = useState<LinkHardness>('Strong');
  const [newDepDelay, setNewDepDelay] = useState<number>(0);

  // Form states for new assignment
  const [newResourceId, setNewResourceId] = useState<string>('');
  const [newResourceUnit, setNewResourceUnit] = useState<number>(100.0);

  const selectedTaskId = viewSettings.selectedTaskId;
  const currentTask = computedTasks.find((t) => t.id === selectedTaskId);

  // Sync form when dialog opens or selected task changes
  useEffect(() => {
    if (currentTask) {
      setFormName(currentTask.name);
      setFormStartDate(currentTask.startDate);
      setFormDuration(currentTask.duration);
      setFormPriority(currentTask.priority);
      setFormProgress(currentTask.progress);
      setFormMilestone(currentTask.milestone);
      setFormDeadline(currentTask.deadline);
      setFormParentId(currentTask.parentId);
      setFormNotes(currentTask.notes || '');
    }
  }, [currentTask, isOpen]);

  if (!isOpen || !currentTask) return null;

  // Dependencies where this task is successor
  const currentDependencies = state.dependencies.filter((d) => d.successorId === currentTask.id);

  // Resources assigned to this task
  const currentAssignments = state.assignments.filter((a) => a.taskId === currentTask.id);

  // Candidate predecessors (cannot be self or children or already connected)
  const candidatePredecessors = state.tasks.filter((t) => {
    if (t.id === currentTask.id) return false;
    const isAlreadyDep = currentDependencies.some((d) => d.predecessorId === t.id);
    return !isAlreadyDep;
  });

  // Candidate parent tasks
  const candidateParents = state.tasks.filter((t) => t.id !== currentTask.id);

  // Candidate resources (not already assigned)
  const candidateResources = state.resources.filter(
    (r) => !currentAssignments.some((a) => a.resourceId === r.id)
  );

  const handleApplyChanges = () => {
    const dur = formMilestone ? 0 : Math.max(1, formDuration);
    updateTask(currentTask.id, {
      name: formName.trim() || currentTask.name,
      startDate: formStartDate,
      duration: dur,
      priority: formPriority,
      progress: formProgress,
      milestone: formMilestone,
      deadline: formDeadline,
      notes: formNotes,
    });

    if (formParentId !== currentTask.parentId) {
      setTaskParent(currentTask.id, formParentId);
    }
  };

  const handleSaveAndClose = (e: React.FormEvent) => {
    e.preventDefault();
    handleApplyChanges();
    onClose();
  };

  const handleAddDependency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPredId) return;
    const ok = addDependency(newPredId, currentTask.id, newDepType, newDepHardness, newDepDelay);
    if (ok) {
      setNewPredId('');
      setNewDepDelay(0);
    }
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceId) return;
    assignResourceToTask(currentTask.id, newResourceId, newResourceUnit);
    setNewResourceId('');
    setNewResourceUnit(100.0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Authentic Desktop Window Frame */}
      <div className="bg-[#ECEFF3] border border-[#718096] rounded-xs shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col text-[#1E293B] text-[12px] overflow-hidden">
        {/* Desktop Window Title Bar */}
        <div className="px-3 py-1.5 bg-[#DFE3E8] border-b border-[#CBD5E1] flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5 font-bold text-[#0F172A] text-xs">
            <Sliders className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>خصائص المهمة (Task Properties) — {currentTask.name}</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center text-[#475569] hover:bg-[#EF4444] hover:text-white rounded-xs transition-colors cursor-pointer text-xs font-bold"
            title="إغلاق"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Desktop Tabs Bar */}
        <div className="flex border-b border-[#CBD5E1] bg-[#E2E6EA] px-3 pt-1.5 gap-1 select-none">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1 text-xs font-semibold rounded-t border-t border-x transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-white border-[#CBD5E1] text-[#0F172A] shadow-xs'
                : 'bg-[#D2D7DE] border-transparent text-[#475569] hover:bg-[#EAECEF]'
            }`}
          >
            <Sliders className="w-3 h-3 text-[#2563EB]" />
            <span>عام (General)</span>
          </button>

          <button
            id="tab-task-dependencies"
            onClick={() => setActiveTab('dependencies')}
            className={`px-3 py-1 text-xs font-semibold rounded-t border-t border-x transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dependencies'
                ? 'bg-white border-[#CBD5E1] text-[#0F172A] shadow-xs'
                : 'bg-[#D2D7DE] border-transparent text-[#475569] hover:bg-[#EAECEF]'
            }`}
          >
            <GitBranch className="w-3 h-3 text-[#2563EB]" />
            <span>المهام السابقة ({currentDependencies.length})</span>
          </button>

          <button
            id="tab-task-resources"
            onClick={() => setActiveTab('resources')}
            className={`px-3 py-1 text-xs font-semibold rounded-t border-t border-x transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'resources'
                ? 'bg-white border-[#CBD5E1] text-[#0F172A] shadow-xs'
                : 'bg-[#D2D7DE] border-transparent text-[#475569] hover:bg-[#EAECEF]'
            }`}
          >
            <Users className="w-3 h-3 text-[#2563EB]" />
            <span>الموارد والمسؤولين ({currentAssignments.length})</span>
          </button>
        </div>

        {/* Dialog Content Area (White background) */}
        <div className="flex-1 overflow-y-auto p-4 bg-white space-y-3.5">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-3">
              {/* Task Name */}
              <div>
                <label className="block text-[#475569] font-semibold text-[11px] mb-1">
                  اسم المهمة (Task Name):
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              {/* Start Date & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#475569] font-semibold text-[11px] mb-1">
                    تاريخ البدء (Begin Date):
                  </label>
                  <input
                    id="input-task-start-date"
                    type="date"
                    value={formStartDate}
                    disabled={currentTask.hasChildren}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1 text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#2563EB] disabled:bg-[#F1F5F9] disabled:text-[#64748B]"
                  />
                  {currentTask.hasChildren && (
                    <span className="text-[10px] text-[#64748B] block mt-0.5">
                      يُحسب تلقائياً من بداية المهام الفرعية
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[#475569] font-semibold text-[11px] mb-1">
                    المدة بأيام العمل (Duration):
                  </label>
                  <input
                    id="input-task-duration"
                    type="number"
                    min={formMilestone ? 0 : 1}
                    value={formMilestone ? 0 : formDuration}
                    disabled={formMilestone || currentTask.hasChildren}
                    onChange={(e) => setFormDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1 text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#2563EB] disabled:bg-[#F1F5F9] disabled:text-[#64748B]"
                  />
                  {formMilestone && (
                    <span className="text-[10px] text-amber-700 block mt-0.5 font-medium">
                      المعلم الرئيسي مدته 0 يوم دائماً
                    </span>
                  )}
                  {currentTask.hasChildren && (
                    <span className="text-[10px] text-[#64748B] block mt-0.5">
                      تُحسب تلقائياً بين أول وآخر مهمة فرعية
                    </span>
                  )}
                </div>
              </div>

              {/* Milestone & Parent Hierarchy */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="chk-milestone"
                    checked={formMilestone}
                    disabled={currentTask.hasChildren}
                    onChange={(e) => {
                      const isMile = e.target.checked;
                      setFormMilestone(isMile);
                      if (isMile) setFormDuration(0);
                    }}
                    className="w-4 h-4 text-[#2563EB] rounded cursor-pointer"
                  />
                  <label htmlFor="chk-milestone" className="text-xs font-semibold text-[#0F172A] cursor-pointer flex items-center gap-1">
                    <Diamond className="w-3.5 h-3.5 text-black fill-black" />
                    <span>معلم رئيسي (Milestone)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-[#475569] font-semibold text-[11px] mb-1">
                    المهمة الرئيسية (Parent Task):
                  </label>
                  <select
                    value={formParentId || ''}
                    onChange={(e) => setFormParentId(e.target.value || null)}
                    className="w-full bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">مهمة رئيسية (Root - بدون أب)</option>
                    {candidateParents.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority & Progress */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[#475569] font-semibold text-[11px] mb-1">
                    الأولوية (Priority):
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as PriorityLevel)}
                    className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="Low">منخفضة (Low)</option>
                    <option value="Normal">عادية (Normal)</option>
                    <option value="High">عالية (High)</option>
                    <option value="Highest">قصوى (Highest)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#475569] font-semibold text-[11px] mb-1">
                    نسبة الإنجاز (Progress %): <strong className="text-[#2563EB]">{formProgress}%</strong>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={formProgress}
                      onChange={(e) => setFormProgress(parseInt(e.target.value))}
                      className="flex-1 cursor-pointer accent-[#2563EB]"
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formProgress}
                      onChange={(e) => setFormProgress(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-14 bg-white border border-[#CBD5E1] rounded px-1.5 py-0.5 text-center text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              {/* Notes */}
              <div>
                <label className="block text-[#475569] font-semibold text-[11px] mb-1">
                  الموعد النهائي (Deadline):
                </label>
                <input
                  type="date"
                  value={formDeadline || ''}
                  onChange={(e) => setFormDeadline(e.target.value || null)}
                  className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1 text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-[#475569] font-semibold text-[11px] mb-1">
                  ملاحظات المهمة (Notes):
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="أدخل أي ملاحظات فنية أو تعليمية..."
                  className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PREDECESSORS (DEPENDENCIES) */}
          {activeTab === 'dependencies' && (
            <div className="space-y-3">
              <div className="border border-[#CBD5E1] rounded overflow-hidden">
                <table className="w-full text-right border-collapse text-xs">
                  <thead className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-[#475569] text-[11px]">
                    <tr>
                      <th className="py-1.5 px-2.5 font-bold border-l border-[#CBD5E1]">المهمة السابقة (Predecessor)</th>
                      <th className="py-1.5 px-2 text-center font-bold border-l border-[#CBD5E1]">نوع التبعية</th>
                      <th className="py-1.5 px-2 text-center font-bold border-l border-[#CBD5E1]">الرابط</th>
                      <th className="py-1.5 px-2 text-center font-bold border-l border-[#CBD5E1]">التأخير</th>
                      <th className="py-1.5 px-2 text-center w-12 font-bold">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {currentDependencies.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-[#64748B]">
                          لا توجد تبعيات محددة لهذه المهمة حالياً.
                        </td>
                      </tr>
                    ) : (
                      currentDependencies.map((dep) => {
                        const pred = state.tasks.find((t) => t.id === dep.predecessorId);
                        return (
                          <tr key={dep.id} className="hover:bg-[#F8FAFC]">
                            <td className="py-1.5 px-2.5 font-medium border-l border-[#E2E8F0]">
                              {pred?.name || 'مهمة محذوفة'}
                            </td>
                            <td className="py-1.5 px-2 text-center border-l border-[#E2E8F0]">
                              <select
                                value={dep.type}
                                onChange={(e) => updateDependency(dep.id, { type: e.target.value as DependencyType })}
                                className="bg-transparent border border-[#CBD5E1] rounded px-1 text-[11px]"
                              >
                                <option value="FS">FS (الانتهاء للبدء)</option>
                                <option value="SS">SS (البدء للبدء)</option>
                                <option value="FF">FF (الانتهاء للانتهاء)</option>
                                <option value="SF">SF (البدء للانتهاء)</option>
                              </select>
                            </td>
                            <td className="py-1.5 px-2 text-center border-l border-[#E2E8F0]">
                              <select
                                value={dep.hardness}
                                onChange={(e) => updateDependency(dep.id, { hardness: e.target.value as LinkHardness })}
                                className="bg-transparent border border-[#CBD5E1] rounded px-1 text-[11px]"
                              >
                                <option value="Strong">قوي (Strong)</option>
                                <option value="Normal">عادي (Normal)</option>
                              </select>
                            </td>
                            <td className="py-1.5 px-2 text-center font-mono border-l border-[#E2E8F0]">
                              <input
                                type="number"
                                value={dep.delay}
                                onChange={(e) => updateDependency(dep.id, { delay: parseInt(e.target.value) || 0 })}
                                className="w-12 bg-white border border-[#CBD5E1] rounded text-center text-[11px]"
                              />
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <button
                                onClick={() => removeDependency(dep.id)}
                                className="text-red-600 hover:text-red-800 p-0.5"
                                title="حذف الرابط"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Form to Add New Predecessor */}
              <form onSubmit={handleAddDependency} className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded space-y-2">
                <span className="font-bold text-xs text-[#0F172A] block">إضافة مهمة سابقة جديدة (Add Predecessor):</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={newPredId}
                      onChange={(e) => setNewPredId(e.target.value)}
                      className="w-full bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs"
                    >
                      <option value="">اختر المهمة السابقة...</option>
                      {candidatePredecessors.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={newDepType}
                      onChange={(e) => setNewDepType(e.target.value as DependencyType)}
                      className="w-full bg-white border border-[#CBD5E1] rounded px-1 py-1 text-xs"
                    >
                      <option value="FS">FS (الانتهاء للبدء)</option>
                      <option value="SS">SS (البدء للبدء)</option>
                      <option value="FF">FF (الانتهاء للانتهاء)</option>
                      <option value="SF">SF (البدء للانتهاء)</option>
                    </select>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={!newPredId}
                      className="w-full py-1 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white font-semibold rounded text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة تبعية</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: RESOURCES ASSIGNMENT */}
          {activeTab === 'resources' && (
            <div className="space-y-3">
              <div className="border border-[#CBD5E1] rounded overflow-hidden">
                <table className="w-full text-right border-collapse text-xs">
                  <thead className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-[#475569] text-[11px]">
                    <tr>
                      <th className="py-1.5 px-2.5 font-bold border-l border-[#CBD5E1]">اسم المورد (Member)</th>
                      <th className="py-1.5 px-2.5 font-bold border-l border-[#CBD5E1]">الدور الوظيفي (Role)</th>
                      <th className="py-1.5 px-2 text-center font-bold border-l border-[#CBD5E1]">نسبة التخصيص (Unit)</th>
                      <th className="py-1.5 px-2 text-center w-12 font-bold">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {currentAssignments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-[#64748B]">
                          لم يتم تخصيص موارد لهذه المهمة بعد.
                        </td>
                      </tr>
                    ) : (
                      currentAssignments.map((asgn) => {
                        const res = state.resources.find((r) => r.id === asgn.resourceId);
                        const role = state.roles.find((r) => r.id === res?.roleId);
                        return (
                          <tr key={asgn.id} className="hover:bg-[#F8FAFC]">
                            <td className="py-1.5 px-2.5 font-medium border-l border-[#E2E8F0]">
                              {res?.name || 'مورد محذوف'}
                            </td>
                            <td className="py-1.5 px-2.5 text-[#64748B] border-l border-[#E2E8F0]">
                              {role?.name || 'غير محدد'}
                            </td>
                            <td className="py-1.5 px-2 text-center font-mono border-l border-[#E2E8F0]">
                              <input
                                type="number"
                                step={10}
                                min={10}
                                max={100}
                                value={asgn.unit}
                                onChange={(e) => updateAssignmentUnit(asgn.id, parseFloat(e.target.value) || 100)}
                                className="w-16 bg-white border border-[#CBD5E1] rounded text-center text-[11px]"
                              />
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <button
                                onClick={() => unassignResourceFromTask(currentTask.id, asgn.resourceId)}
                                className="text-red-600 hover:text-red-800 p-0.5 cursor-pointer"
                                title="إلغاء التخصيص"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Form to Assign New Resource */}
              <form onSubmit={handleAddAssignment} className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded space-y-2">
                <span className="font-bold text-xs text-[#0F172A] block">تخصيص عضو جديد للمهمة:</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={newResourceId}
                      onChange={(e) => setNewResourceId(e.target.value)}
                      className="w-full bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs"
                    >
                      <option value="">اختر المورد من الفريق...</option>
                      {candidateResources.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      step={10}
                      min={10}
                      max={100}
                      value={newResourceUnit}
                      onChange={(e) => setNewResourceUnit(parseFloat(e.target.value) || 100)}
                      className="w-full bg-white border border-[#CBD5E1] rounded px-2 py-1 text-center text-xs font-mono"
                      title="الوحدات (100.0 تفرغ كامل)"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={!newResourceId}
                      className="w-full py-1 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white font-semibold rounded text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>تخصيص</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Desktop Bottom Action Button Bar */}
        <div className="px-3 py-2 bg-[#E2E6EA] border-t border-[#CBD5E1] flex items-center justify-end gap-2 select-none">
          <button
            onClick={handleApplyChanges}
            className="px-3 py-1 bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] rounded-xs font-medium text-xs cursor-pointer shadow-2xs"
          >
            تطبيق (Apply)
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] rounded-xs font-medium text-xs cursor-pointer shadow-2xs"
          >
            إلغاء الأمر (Cancel)
          </button>

          <button
            id="btn-save-task-props"
            onClick={handleSaveAndClose}
            className="px-4 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#1D4ED8] rounded-xs font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>موافق (OK)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
