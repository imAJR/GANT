/**
 * GANT — Resources Workspace View (GanttProject Desktop Style)
 * Displays the team resources list and workload allocation timeline.
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Sliders,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { formatDisplayDate } from '../../utils/calendar';

export const ResourcesView: React.FC = () => {
  const { state, addResource, updateResource, deleteResource, computedTasks } = useProject();
  const [newName, setNewName] = useState('');
  const [newRoleId, setNewRoleId] = useState(state.roles[0]?.id || '');
  const [selectedResId, setSelectedResId] = useState<string | null>(state.resources[0]?.id || null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const id = addResource(newName.trim(), newRoleId || state.roles[0]?.id || '');
    setNewName('');
    setSelectedResId(id);
  };

  const selectedResource = state.resources.find((r) => r.id === selectedResId);
  const selectedAssignments = selectedResource
    ? state.assignments.filter((a) => a.resourceId === selectedResource.id)
    : [];

  return (
    <div className="h-full flex bg-[#F8FAFC] text-[#1E293B] text-xs select-none overflow-hidden">
      {/* Left Pane: Resources Table */}
      <div className="w-1/2 border-l border-[#CBD5E1] flex flex-col bg-white">
        {/* Table Title Bar */}
        <div className="p-2.5 bg-[#EAEEF2] border-b border-[#CBD5E1] flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[#0F172A]">
            <Users className="w-4 h-4 text-[#2563EB]" />
            <span>جدول الموارد وفريق العمل</span>
            <span className="text-neutral-500 font-normal">({state.resources.length})</span>
          </div>

          <form onSubmit={handleAdd} className="flex items-center gap-1.5">
            <input
              id="input-new-resource-name"
              type="text"
              placeholder="اسم مورد جديد..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 w-36"
            />
            <button
              id="btn-add-resource"
              type="submit"
              disabled={!newName.trim()}
              className="px-2 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded font-medium text-xs flex items-center gap-1 disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة</span>
            </button>
          </form>
        </div>

        {/* Resources Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-right border-collapse">
            <thead className="sticky top-0 bg-[#F1F5F9] border-b border-[#CBD5E1] text-[11px] text-[#475569]">
              <tr>
                <th className="py-2 px-3 font-semibold border-l border-[#E2E8F0]">اسم المورد</th>
                <th className="py-2 px-3 font-semibold border-l border-[#E2E8F0]">الدور الوظيفي</th>
                <th className="py-2 px-3 text-center font-semibold border-l border-[#E2E8F0]">عدد المهام</th>
                <th className="py-2 px-2 text-center w-16 font-semibold">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {state.resources.map((res) => {
                const isSelected = res.id === selectedResId;
                const role = state.roles.find((r) => r.id === res.roleId);
                const taskCount = state.assignments.filter((a) => a.resourceId === res.id).length;

                return (
                  <tr
                    key={res.id}
                    id={`res-row-${res.id}`}
                    onClick={() => setSelectedResId(res.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#DCEBFC] text-[#0F2F64] font-medium'
                        : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <td className="py-2 px-3 border-l border-[#E2E8F0]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                        <span>{res.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 border-l border-[#E2E8F0]">
                      <select
                        id={`res-role-select-${res.id}`}
                        value={res.roleId}
                        onChange={(e) => updateResource(res.id, { roleId: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent border-0 text-xs text-[#334155] focus:outline-none cursor-pointer w-full"
                      >
                        {state.roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3 text-center border-l border-[#E2E8F0] font-mono">
                      {taskCount}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteResource(res.id);
                        }}
                        className="p-1 text-[#64748B] hover:text-red-600 rounded transition-colors"
                        title="حذف المورد"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Pane: Assigned Tasks & Allocation Detail */}
      <div className="w-1/2 flex flex-col bg-[#F8FAFC]">
        <div className="p-2.5 bg-[#EAEEF2] border-b border-[#CBD5E1] font-bold text-[#0F172A] flex items-center justify-between">
          <span>المهام المخصصة للمورد: {selectedResource ? selectedResource.name : '—'}</span>
          {selectedResource && (
            <span className="text-[11px] text-[#475569] font-normal font-mono">
              {selectedAssignments.length} مهام مسندة
            </span>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {selectedResource && selectedAssignments.length > 0 ? (
            <div className="space-y-2">
              {selectedAssignments.map((asgn) => {
                const task = computedTasks.find((t) => t.id === asgn.taskId);
                if (!task) return null;

                return (
                  <div
                    key={asgn.id}
                    className="p-3 bg-white rounded border border-[#CBD5E1] shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-sm text-[#0F172A] block mb-1">
                        {task.name}
                      </strong>
                      <div className="text-[11px] text-[#64748B] flex items-center gap-3">
                        <span>البداية: <strong className="font-mono text-[#0F172A]">{task.startDate}</strong></span>
                        <span>·</span>
                        <span>النهاية: <strong className="font-mono text-[#059669]">{task.endDate}</strong></span>
                        <span>·</span>
                        <span>المدة: {task.duration} أيام</span>
                      </div>
                    </div>

                    <div className="text-left font-mono">
                      <span className="text-[10px] text-[#64748B] block">نسبة التخصيص</span>
                      <span className="text-xs font-bold text-[#2563EB]">
                        {asgn.unit.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#64748B] p-6">
              <Users className="w-10 h-10 text-[#94A3B8] mb-2" />
              <p className="font-medium text-xs">
                {selectedResource
                  ? `لم يتم تخصيص أي مهام للمورد "${selectedResource.name}" بعد.`
                  : 'حدد مورداً من الجدول لعرض المهام المسندة إليه.'}
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                يمكنك تخصيص الموارد لأي مهمة من نافذة خصائص المهمة في تبويب المخطط.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
