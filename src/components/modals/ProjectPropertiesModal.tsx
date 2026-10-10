/**
 * GANT — Authentic GanttProject Desktop Project Properties Dialog
 * Tabbed desktop dialog (General, Calendar, Roles) with classic styling.
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Calendar,
  Layers,
  Plus,
  Trash2,
  Check,
  Building,
  FileText,
  User,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { WEEKDAY_NAMES_AR } from '../../utils/calendar';

interface ProjectPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectPropertiesModal: React.FC<ProjectPropertiesModalProps> = ({ isOpen, onClose }) => {
  const { state, updateProjectMetadata, addRole, updateRole, deleteRole } = useProject();

  const [activeTab, setActiveTab] = useState<'general' | 'calendar' | 'roles'>('general');
  const [formName, setFormName] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formWeekendDays, setFormWeekendDays] = useState<number[]>([5, 6]);
  const [newRoleName, setNewRoleName] = useState('');

  const project = state.project;

  useEffect(() => {
    if (project) {
      setFormName(project.name);
      setFormOrg(project.organization);
      setFormDesc(project.description);
      setFormStartDate(project.startDate);
      setFormWeekendDays(project.weekendDays || [5, 6]);
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleToggleWeekendDay = (dayIndex: number) => {
    if (formWeekendDays.includes(dayIndex)) {
      setFormWeekendDays(formWeekendDays.filter((d) => d !== dayIndex));
    } else {
      setFormWeekendDays([...formWeekendDays, dayIndex]);
    }
  };

  const handleApplyChanges = () => {
    updateProjectMetadata({
      name: formName.trim() || project.name,
      organization: formOrg.trim(),
      description: formDesc.trim(),
      startDate: formStartDate,
      weekendDays: formWeekendDays,
    });
  };

  const handleSaveAndClose = (e: React.FormEvent) => {
    e.preventDefault();
    handleApplyChanges();
    onClose();
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    addRole(newRoleName.trim());
    setNewRoleName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Authentic Desktop Window Frame */}
      <div className="bg-[#ECEFF3] border border-[#718096] rounded-xs shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col text-[#1E293B] text-[12px] overflow-hidden">
        {/* Desktop Window Title Bar */}
        <div className="px-3 py-1.5 bg-[#DFE3E8] border-b border-[#CBD5E1] flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5 font-bold text-[#0F172A] text-xs">
            <Settings className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>خصائص المشروع (Project Properties) — {project.name}</span>
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
            <FileText className="w-3 h-3 text-[#7C3AED]" />
            <span>عام (General)</span>
          </button>

          <button
            id="tab-project-calendar"
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1 text-xs font-semibold rounded-t border-t border-x transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'bg-white border-[#CBD5E1] text-[#0F172A] shadow-xs'
                : 'bg-[#D2D7DE] border-transparent text-[#475569] hover:bg-[#EAECEF]'
            }`}
          >
            <Calendar className="w-3 h-3 text-[#7C3AED]" />
            <span>التقويم وعطلات نهاية الأسبوع (Calendar)</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3 py-1 text-xs font-semibold rounded-t border-t border-x transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'roles'
                ? 'bg-white border-[#CBD5E1] text-[#0F172A] shadow-xs'
                : 'bg-[#D2D7DE] border-transparent text-[#475569] hover:bg-[#EAECEF]'
            }`}
          >
            <Layers className="w-3 h-3 text-[#7C3AED]" />
            <span>أدوار الموارد ({state.roles.length})</span>
          </button>
        </div>

        {/* Dialog Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white space-y-3.5">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[#475569] font-semibold text-[11px] mb-1">اسم المشروع (Project Name):</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1 text-xs text-[#0F172A] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-semibold text-[11px] mb-1">المؤسسة / المنظمة (Organization):</label>
                <input
                  type="text"
                  value={formOrg}
                  onChange={(e) => setFormOrg(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1 text-xs text-[#0F172A] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-semibold text-[11px] mb-1">تاريخ انطلاق المشروع (Base Start Date):</label>
                <input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1 text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-semibold text-[11px] mb-1">وصف المشروع وملاحظات النطاق:</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1 text-xs text-[#0F172A] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[11px] text-[#475569] flex justify-between items-center">
                <span>المصمم والمالك: <strong className="text-[#0F172A]">علي بن حامد الجبرتي</strong> (2026)</span>
                <span className="text-purple-700 font-bold">التقنية الرقمية 3</span>
              </div>
            </div>
          )}

          {/* TAB 2: CALENDAR & WEEKEND DAYS */}
          {activeTab === 'calendar' && (
            <div className="space-y-3.5">
              <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[11px] text-[#334155] leading-relaxed">
                في برنامج جانت والمحاكي، تحدد أيام عطلة نهاية الأسبوع أيام الراحة التي تُستثنى من احتساب مدة عمل المهام.
                المقرر التعليمي يعتمد <strong>الجمعة والسبت</strong> كعطلة رسمية.
              </div>

              <div>
                <span className="block text-[#0F172A] font-bold text-xs mb-2">أيام عطلة نهاية الأسبوع (Weekend Days):</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {WEEKDAY_NAMES_AR.map((dayName, idx) => {
                    const isChecked = formWeekendDays.includes(idx);
                    const isOfficialSchoolWeekend = idx === 5 || idx === 6;

                    return (
                      <label
                        key={idx}
                        className={`p-2 rounded border cursor-pointer flex items-center gap-2 transition-colors ${
                          isChecked
                            ? 'bg-[#F5F3FF] border-[#7C3AED] text-[#5B21B6] font-bold'
                            : 'bg-white border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleWeekendDay(idx)}
                          className="w-4 h-4 text-[#7C3AED] rounded cursor-pointer"
                        />
                        <span className="text-xs">{dayName}</span>
                        {isOfficialSchoolWeekend && (
                          <span className="text-[9px] bg-purple-100 text-purple-700 px-1 rounded mr-auto">
                            منهجي
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                💡 <strong>ملاحظة للمتعلم:</strong> إذا بدأت مهمة مدتها 3 أيام يوم الخميس، ستتوقف يومي الجمعة والسبت، وتستأنف الأحد والإثنين.
              </div>
            </div>
          )}

          {/* TAB 3: ROLES */}
          {activeTab === 'roles' && (
            <div className="space-y-3">
              <div className="border border-[#CBD5E1] rounded overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-[#475569] text-[11px]">
                    <tr>
                      <th className="py-1.5 px-3 font-bold border-l border-[#CBD5E1]">اسم الدور الوظيفي (Role)</th>
                      <th className="py-1.5 px-2 text-center w-16 font-bold">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {state.roles.map((role) => (
                      <tr key={role.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-1.5 px-3 border-l border-[#E2E8F0]">
                          <input
                            type="text"
                            value={role.name}
                            onChange={(e) => updateRole(role.id, e.target.value)}
                            className="bg-transparent border-0 text-xs w-full focus:outline-none font-medium text-[#0F172A]"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <button
                            onClick={() => deleteRole(role.id)}
                            className="text-[#64748B] hover:text-red-600 p-0.5 cursor-pointer"
                            title="حذف الدور"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Form to Add New Role */}
              <form onSubmit={handleAddRole} className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded flex items-center gap-2">
                <input
                  type="text"
                  placeholder="اسم دور وظيفي جديد..."
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="flex-1 bg-white border border-[#CBD5E1] rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#7C3AED]"
                />
                <button
                  type="submit"
                  disabled={!newRoleName.trim()}
                  className="px-3 py-1 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 text-white font-semibold rounded text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة دور</span>
                </button>
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
            id="btn-save-project-props"
            onClick={handleSaveAndClose}
            className="px-4 py-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white border border-[#6D28D9] rounded-xs font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>موافق (OK)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
