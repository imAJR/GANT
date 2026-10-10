/**
 * GANT — Authentic GanttProject Desktop Resources Dialog
 * Team roster and role assignment window with classic desktop styling.
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import React, { useState } from 'react';
import {
  X,
  Users,
  Plus,
  Trash2,
  Check,
  Briefcase,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

interface ResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResourcesModal: React.FC<ResourcesModalProps> = ({ isOpen, onClose }) => {
  const { state, addResource, updateResource, deleteResource } = useProject();

  const [newName, setNewName] = useState('');
  const [newRoleId, setNewRoleId] = useState(state.roles[0]?.id || '');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addResource(newName.trim(), newRoleId || state.roles[0]?.id || '');
    setNewName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Authentic Desktop Window Frame */}
      <div className="bg-[#ECEFF3] border border-[#718096] rounded-xs shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col text-[#1E293B] text-[12px] overflow-hidden">
        {/* Desktop Window Title Bar */}
        <div className="px-3 py-1.5 bg-[#DFE3E8] border-b border-[#CBD5E1] flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5 font-bold text-[#0F172A] text-xs">
            <Users className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>موارد المشروع وفريق العمل (Project Resources) — {state.resources.length} أعضاء</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center text-[#475569] hover:bg-[#EF4444] hover:text-white rounded-xs transition-colors cursor-pointer text-xs font-bold"
            title="إغلاق"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white space-y-3">
          <div className="border border-[#CBD5E1] rounded overflow-hidden max-h-72 overflow-y-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-[#475569] text-[11px] sticky top-0">
                <tr>
                  <th className="py-1.5 px-3 font-bold border-l border-[#CBD5E1]">اسم المورد (Member Name)</th>
                  <th className="py-1.5 px-3 font-bold border-l border-[#CBD5E1]">الدور الوظيفي (Role)</th>
                  <th className="py-1.5 px-2 text-center font-bold border-l border-[#CBD5E1] w-20">المهام</th>
                  <th className="py-1.5 px-2 text-center w-14 font-bold">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {state.resources.map((res) => {
                  const assignedCount = state.assignments.filter((a) => a.resourceId === res.id).length;
                  return (
                    <tr key={res.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-1.5 px-3 border-l border-[#E2E8F0]">
                        <input
                          type="text"
                          value={res.name}
                          onChange={(e) => updateResource(res.id, { name: e.target.value })}
                          className="bg-transparent border-0 text-xs w-full focus:outline-none font-medium text-[#0F172A]"
                        />
                      </td>
                      <td className="py-1.5 px-3 border-l border-[#E2E8F0]">
                        <select
                          value={res.roleId}
                          onChange={(e) => updateResource(res.id, { roleId: e.target.value })}
                          className="bg-transparent border border-[#CBD5E1] rounded px-1.5 py-0.5 text-xs text-[#334155] w-full"
                        >
                          {state.roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono text-[11px] border-l border-[#E2E8F0]">
                        {assignedCount}
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <button
                          onClick={() => deleteResource(res.id)}
                          className="text-[#64748B] hover:text-red-600 p-0.5 cursor-pointer"
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

          {/* Form to Add New Resource */}
          <form onSubmit={handleAdd} className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded space-y-2">
            <span className="font-bold text-xs text-[#0F172A] block">إضافة عضو جديد إلى الفريق:</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="اسم عضو الفريق..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <select
                  value={newRoleId}
                  onChange={(e) => setNewRoleId(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs text-[#334155]"
                >
                  {state.roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  className="w-full py-1 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white font-semibold rounded text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة مورد</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Desktop Bottom Action Button Bar */}
        <div className="px-3 py-2 bg-[#E2E6EA] border-t border-[#CBD5E1] flex items-center justify-end select-none">
          <button
            onClick={onClose}
            className="px-4 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#1D4ED8] rounded-xs font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>إغلاق (Close)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
