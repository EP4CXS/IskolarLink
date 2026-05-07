import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Users,
  Search,
  GraduationCap,
  BookOpen,
  Award,
  ArrowLeft } from
'lucide-react';
import { useData } from '../../context/DataContext';
import { Card, Button, Input, Textarea, Badge } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import { Scholarship } from '../../types';
import { toast } from 'sonner';
type ProgramType = 'CHED - TES' | 'CHED-CUSCHO' | 'CHED-TDP';
const PROGRAMS: {
  key: ProgramType;
  name: string;
  fullName: string;
  description: string;
  icon: React.ElementType;
  color: string;
}[] = [
{
  key: 'CHED - TES',
  name: 'CHED - TES',
  fullName: 'Tertiary Education Subsidy',
  description: 'Government subsidy for tertiary students under UniFAST.',
  icon: GraduationCap,
  color: 'bg-sky-50 text-sky-600 border-sky-200'
},
{
  key: 'CHED-CUSCHO',
  name: 'CHED-CUSCHO',
  fullName: 'CHED-CUSCHO Scholarship Program',
  description:
  'CHED-supported cooperative scholarship for qualified beneficiaries.',
  icon: Award,
  color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
},
{
  key: 'CHED-TDP',
  name: 'CHED-TDP',
  fullName: 'CHED-TDP (Tulong Dunong Program)',
  description:
  'CHED financial assistance grant for qualified college students.',
  icon: BookOpen,
  color: 'bg-cyan-50 text-cyan-600 border-cyan-200'
}];

interface FormState {
  programType: ProgramType | '';
  title: string;
  description: string;
  deadline: string;
  slots: number;
  benefits: string;
  status: 'Active' | 'Closed' | 'Draft';
}
const emptyForm: FormState = {
  programType: '',
  title: '',
  description: '',
  deadline: '',
  slots: 10,
  benefits: '',
  status: 'Active'
};
export function ManageScholarships() {
  const {
    scholarships,
    addScholarship,
    updateScholarship,
    deleteScholarship,
    applications,
    users
  } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<Scholarship | null>(null);
  const [isHistoryListOpen, setIsHistoryListOpen] = useState(false);
  const [historyScholarship, setHistoryScholarship] = useState<Scholarship | null>(null);
  const [historyYearFilter, setHistoryYearFilter] = useState<string>('all');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('all');
  const detectProgram = (title: string): ProgramType | '' => {
    const upper = title.toUpperCase();
    // Check longer keys first so CHED-CUSCHO matches before TES, etc.
    const sorted = [...PROGRAMS].sort((a, b) => b.key.length - a.key.length);
    const match = sorted.find((p) => upper.includes(p.key));
    return match?.key || '';
  };
  const activeScholarships = scholarships.filter((s) => s.status !== 'Closed');
  const endedScholarships = scholarships.filter((s) => s.status === 'Closed');
  const historyYears = Array.from(
    new Set(
      endedScholarships.map((s) => new Date(s.deadline).getFullYear().toString())
    )
  ).sort((a, b) => Number(b) - Number(a));
  const filteredEndedScholarships = endedScholarships.filter((s) => {
    const year = new Date(s.deadline).getFullYear().toString();
    const type = detectProgram(s.title) || 'Other';
    const matchesYear = historyYearFilter === 'all' || year === historyYearFilter;
    const matchesType = historyTypeFilter === 'all' || type === historyTypeFilter;
    return matchesYear && matchesType;
  });
  const filtered = activeScholarships.filter((s) =>
  s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };
  const openEdit = (s: Scholarship) => {
    setEditingId(s.id);
    setForm({
      programType: detectProgram(s.title),
      title: s.title,
      description: s.description,
      deadline: s.deadline.split('T')[0],
      slots: s.slots,
      benefits: s.benefits.join(', '),
      status: s.status
    });
    setIsModalOpen(true);
  };
  const selectProgram = (p: ProgramType) => {
    const program = PROGRAMS.find((x) => x.key === p)!;
    setForm((prev) => ({
      ...prev,
      programType: p,
      // Only pre-fill title/description if creating fresh
      title: prev.title || program.fullName,
      description: prev.description || program.description
    }));
  };
  const resetProgram = () => {
    setForm({
      ...emptyForm
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.programType) {
      toast.error('Please select a scholarship program');
      return;
    }
    if (!form.title || !form.description || !form.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }
    const payload: Omit<Scholarship, 'id'> = {
      title: form.title,
      description: form.description,
      deadline: new Date(form.deadline).toISOString(),
      slots: Number(form.slots),
      benefits: form.benefits.
      split(',').
      map((b) => b.trim()).
      filter(Boolean),
      criteria: {},
      status: form.status
    };
    try {
      if (editingId) {
        await updateScholarship(editingId, payload);
        toast.success('Scholarship updated');
      } else {
        await addScholarship(payload);
        toast.success('Scholarship created');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save scholarship');
    }
  };
  const handleDelete = async () => {
    if (confirmDelete) {
      try {
        await deleteScholarship(confirmDelete.id);
        setConfirmDelete(null);
        toast.success('Scholarship marked as ended');
      } catch (err: any) {
        toast.error(err?.message || 'Failed to end scholarship');
      }
    }
  };
  const getApplicantCount = (id: string) =>
  applications.filter((a) => a.scholarshipId === id).length;
  const historyApplicants = historyScholarship ?
  applications.
  filter((a) => a.scholarshipId === historyScholarship.id).
  sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()) :
  [];
  const grantedApplicants = historyApplicants.filter((a) => a.status === 'Approved');
  const grantedApplicantsCount = historyApplicants.filter((a) => a.status === 'Approved').length;
  const selectedProgram = PROGRAMS.find((p) => p.key === form.programType);
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Manage Scholarships
          </h1>
          <p className="text-slate-600 mt-1">
            Create and manage scholarship opportunities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsHistoryListOpen(true)}>
            View Scholarship History ({endedScholarships.length})
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> New Scholarship
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search scholarships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" />
          
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length === 0 ?
        <Card className="p-12 text-center col-span-full">
            <p className="text-slate-500">
              No scholarships yet. Click "New Scholarship" to create one.
            </p>
          </Card> :

        filtered.map((s) =>
        <Card key={s.id} className="flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <Badge
                variant={
                s.status === 'Active' ?
                'success' :
                s.status === 'Draft' ?
                'warning' :
                'default'
                }>
                
                    {s.status}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {getApplicantCount(s.id)} applicants
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                  {s.description}
                </p>
                <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{new Date(s.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{s.slots} slots</span>
                  </div>
                </div>
              </div>
              <div className="p-4 pt-0 flex gap-2">
                <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
              onClick={() => openEdit(s)}>
              
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50 gap-1"
              onClick={() => setConfirmDelete(s)}>
              
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </Card>
        )
        }
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Scholarship' : 'New Scholarship'}
        maxWidth="max-w-2xl">
        
        {/* STEP 1: Program selection — shown only when no program is chosen yet */}
        {!form.programType ?
        <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Select Scholarship Program
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Choose one of the four supported programs to begin.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROGRAMS.map((p) =>
            <button
              key={p.key}
              type="button"
              onClick={() => selectProgram(p.key)}
              className="text-left p-4 rounded-xl border-2 border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition-all group">
              
                  <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center border ${p.color} mb-3`}>
                
                    <p.icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-sky-700">
                    {p.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 mb-2">
                    {p.fullName}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {p.description}
                  </p>
                </button>
            )}
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}>
              
                Cancel
              </Button>
            </div>
          </div> /* STEP 2: Detail form — appears only after program is selected */ :

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selected program banner */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-sky-200 bg-sky-50">
              {selectedProgram &&
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center border ${selectedProgram.color}`}>
              
                  <selectedProgram.icon className="w-5 h-5" />
                </div>
            }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">
                  {selectedProgram?.name} —{' '}
                  <span className="font-medium text-slate-600">
                    {selectedProgram?.fullName}
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  Fill in the details for this program.
                </p>
              </div>
              {!editingId &&
            <button
              type="button"
              onClick={resetProgram}
              className="text-xs text-sky-700 hover:text-sky-900 font-medium flex items-center gap-1">
              
                  <ArrowLeft className="w-3.5 h-3.5" /> Change
                </button>
            }
            </div>

            <Input
            label="Title *"
            value={form.title}
            onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value
            })
            }
            placeholder="Scholarship title"
            required />
          
            <Textarea
            label="Description *"
            value={form.description}
            onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value
            })
            }
            rows={3}
            placeholder="Brief description of the scholarship..."
            required />
          

            <div className="grid grid-cols-2 gap-4">
              <Input
              label="Deadline *"
              type="date"
              value={form.deadline}
              onChange={(e) =>
              setForm({
                ...form,
                deadline: e.target.value
              })
              }
              required />
            
              <Input
              label="Slots *"
              type="number"
              min="1"
              value={form.slots}
              onChange={(e) =>
              setForm({
                ...form,
                slots: Number(e.target.value)
              })
              }
              required />
            
            </div>

            <Input
            label="Benefits (comma-separated)"
            value={form.benefits}
            onChange={(e) =>
            setForm({
              ...form,
              benefits: e.target.value
            })
            }
            placeholder="Full Tuition, ₱5,000 Monthly Stipend, Book Allowance" />
          

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
              value={form.status}
              onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as any
              })
              }
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}>
              
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingId ? 'Save Changes' : 'Create Scholarship'}
              </Button>
            </div>
          </form>
        }
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="End Scholarship"
        maxWidth="max-w-md">
        
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to end{' '}
          <span className="font-semibold text-slate-900">
            {confirmDelete?.title}
          </span>
          ? This will mark it as expired and keep application records.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setConfirmDelete(null)}>
            
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete}>
            End Scholarship
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isHistoryListOpen}
        onClose={() => setIsHistoryListOpen(false)}
        title="Ended Scholarship History"
        maxWidth="max-w-4xl">
        
        {endedScholarships.length > 0 ?
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Filter by Year
                </label>
                <select
                  value={historyYearFilter}
                  onChange={(e) => setHistoryYearFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="all">All Years</option>
                  {historyYears.map((year) =>
                  <option key={year} value={year}>
                      {year}
                    </option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Filter by Scholarship Type
                </label>
                <select
                  value={historyTypeFilter}
                  onChange={(e) => setHistoryTypeFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="all">All Types</option>
                  <option value="CHED - TES">TES</option>
                  <option value="CHED-CUSCHO">CUSCHO</option>
                  <option value="CHED-TDP">TDP</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            {filteredEndedScholarships.length > 0 ?
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredEndedScholarships.map((s) => {
            const grantedCount = applications.filter(
              (a) => a.scholarshipId === s.id && a.status === 'Approved'
            ).length;
            return (
              <div
                key={`history-list-${s.id}`}
                className="p-4 bg-white rounded-lg border border-slate-200">
                <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                  {s.title}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Total applicants: {getApplicantCount(s.id)}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Granted applicants: {grantedCount}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => {
                  setIsHistoryListOpen(false);
                  setHistoryScholarship(s);
                }}>
                  View Applicant History
                </Button>
              </div>);

          })}
              </div> :

            <p className="text-sm text-slate-500">
                No ended scholarships match the selected filters.
              </p>
            }
          </div> :

        <p className="text-sm text-slate-500">No ended scholarships yet.</p>
        }
      </Modal>

      <Modal
        isOpen={!!historyScholarship}
        onClose={() => setHistoryScholarship(null)}
        title="Scholarship Applicant History"
        maxWidth="max-w-3xl">
        
        {historyScholarship &&
        <div className="space-y-4">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-900">{historyScholarship.title}</h3>
              <p className="text-sm text-slate-600 mt-1">
                Total applicants: {historyApplicants.length}
              </p>
              <p className="text-sm text-green-700 mt-1">
                Granted applicants: {grantedApplicantsCount}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-green-200 bg-green-50">
              <h4 className="text-sm font-semibold text-green-800">
                Granted Applicant History
              </h4>
              {grantedApplicants.length === 0 ?
              <p className="text-sm text-green-700 mt-2">
                  No granted applicants yet.
                </p> :

              <div className="mt-3 space-y-2">
                  {grantedApplicants.map((app) => {
                  const student = users.find((u) => u.id === app.studentId);
                  const applicantName = app.answers?.fullName || student?.name || 'N/A';
                  return (
                    <div
                      key={`granted-${app.id}`}
                      className="p-3 rounded-lg bg-white border border-green-200 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {applicantName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {student?.email || app.answers?.email || 'No email'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Applied: {new Date(app.submissionDate).toLocaleDateString()} · ID: {app.id.toUpperCase()}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                        Granted
                      </span>
                    </div>);

                })}
                </div>
              }
            </div>
          </div>
        }
      </Modal>
    </div>);

}