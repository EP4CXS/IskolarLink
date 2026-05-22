import React, { useEffect, useState } from 'react';
import {
  Search,
  Banknote,
  CheckCircle2,
  Send,
  Calendar,
  ArrowLeft,
  Users,
  ChevronRight } from
'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Input, Textarea, Badge } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import { Application, GrantDisbursement, Scholarship } from '../../types';
import { toast } from 'sonner';
interface FormState {
  amount: string;
  method: GrantDisbursement['method'];
  reference: string;
  note: string;
  date: string;
}
const emptyForm: FormState = {
  amount: '',
  method: 'Bank Transfer',
  reference: '',
  note: '',
  date: new Date().toISOString().split('T')[0]
};
export function ManageGrants() {
  const { applications, scholarships, users, disburseGrant } = useData();
  const { user: adminUser } = useAuth();
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<
    string | null>(
    null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'pending' | 'released' | 'all'>(
    'pending'
  );
  const [selected, setSelected] = useState<Application | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const getAnswer = (app: Application, key: string) =>
  (app.answers?.[key] || '').toString().trim();
  const getBeneficiaryName = (app: Application) => {
    const student = users.find((u) => u.id === app.studentId);
    return getAnswer(app, 'fullName') || student?.name || 'Unknown Beneficiary';
  };
  const getBeneficiaryEmail = (app: Application) => {
    const student = users.find((u) => u.id === app.studentId);
    return getAnswer(app, 'email') || student?.email || 'No email provided';
  };
  const getBeneficiaryCourseYear = (app: Application) => {
    const student = users.find((u) => u.id === app.studentId);
    const course =
    getAnswer(app, 'course') || student?.profile?.course || '';
    const year =
    getAnswer(app, 'yearLevel') ||
    (student?.profile?.yearLevel !== undefined ?
    String(student.profile.yearLevel) :
    '');
    if (!course && !year) return 'Course/Year not provided';
    if (course && year) return `${course} · Year ${year}`;
    return course || `Year ${year}`;
  };
  // Scholarships that have at least one approved application
  const scholarshipsWithApproved = scholarships.
  filter((s) => s.status !== 'Closed').
  map((s) => {
    const approved = applications.filter(
      (a) => a.scholarshipId === s.id && a.status === 'Approved'
    );
    const released = approved.filter(
      (a) => (a.grantTransactions?.length || 0) > 0 || !!a.grantDisbursement
    );
    return {
      scholarship: s,
      total: approved.length,
      released: released.length,
      pending: approved.length - released.length,
      totalAmount: approved.reduce(
        (sum, a) =>
        sum +
        (a.grantTransactions && a.grantTransactions.length > 0 ?
        a.grantTransactions.reduce((inner, tx) => inner + tx.amount, 0) :
        a.grantDisbursement?.amount || 0),
        0
      )
    };
  }).
  filter((x) => x.total > 0);
  const selectedScholarship = scholarships.find(
    (s) => s.id === selectedScholarshipId
  );
  useEffect(() => {
    if (!selectedScholarshipId) return;
    if (!selectedScholarship || selectedScholarship.status === 'Closed') {
      setSelectedScholarshipId(null);
      setSelected(null);
    }
  }, [selectedScholarshipId, selectedScholarship]);
  const beneficiaries = selectedScholarshipId ?
  applications.
  filter(
    (a) =>
    a.scholarshipId === selectedScholarshipId &&
    a.status === 'Approved'
  ).
  filter((app) => {
    const beneficiaryName = getBeneficiaryName(app);
    const beneficiaryEmail = getBeneficiaryEmail(app);
    const matchesSearch =
    !searchTerm ||
    beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiaryEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.id.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    const releaseCount = app.grantTransactions?.length || (app.grantDisbursement ? 1 : 0);
    if (filter === 'pending') return releaseCount === 0;
    if (filter === 'released') return releaseCount > 0;
    return true;
  }) :
  [];
  const openSendGrant = (app: Application) => {
    setSelected(app);
    setForm({
      ...emptyForm,
      reference: `GR-${Date.now().toString().slice(-8)}`
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!form.amount || !form.reference) {
      toast.error('Amount and reference number are required');
      return;
    }
    try {
      await disburseGrant(selected.id, {
        date: new Date(form.date).toISOString(),
        amount: Number(form.amount),
        method: form.method,
        reference: form.reference,
        note: form.note,
        releasedBy: adminUser?.name
      });
      setSelected(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to release grant');
    }
  };
  const handleBack = () => {
    setSelectedScholarshipId(null);
    setSearchTerm('');
    setFilter('pending');
  };
  // === Scholarship picker view ===
  if (!selectedScholarshipId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Grant Disbursement
          </h1>
          <p className="text-gray-600 mt-1">
            Choose a scholarship to view its beneficiaries and release grants.
          </p>
        </div>

        {scholarshipsWithApproved.length === 0 ?
        <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Banknote className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No approved beneficiaries yet
            </h3>
            <p className="text-gray-500">
              Once you approve applications, they'll appear here for grant
              disbursement.
            </p>
          </Card> :

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {scholarshipsWithApproved.map(
            ({ scholarship, total, released, pending, totalAmount }) =>
            <button
              key={scholarship.id}
              onClick={() => setSelectedScholarshipId(scholarship.id)}
              className="text-left">
              
                  <Card className="p-6 h-full hover:border-sky-300 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-sky-600 transition-colors" />
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {scholarship.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-5 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {total} approved
                      beneficiar
                      {total === 1 ? 'y' : 'ies'}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Pending</p>
                        <p className="text-lg font-bold text-yellow-600">
                          {pending}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Released</p>
                        <p className="text-lg font-bold text-sky-600">
                          {released}
                        </p>
                      </div>
                    </div>

                    {totalAmount > 0 &&
                <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Total Disbursed</p>
                        <p className="text-sm font-semibold text-gray-900">
                          ₱{totalAmount.toLocaleString()}
                        </p>
                      </div>
                }
                  </Card>
                </button>

          )}
          </div>
        }
      </div>);

  }
  // === Beneficiaries view ===
  return (
    <div className="space-y-6">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-sky-600">
        
        <ArrowLeft className="w-4 h-4" /> Back to scholarships
      </button>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-sky-600 mb-1">
          Grant Disbursement
        </p>
        <h1 className="text-2xl font-bold text-gray-900">
          {selectedScholarship?.title}
        </h1>
        <p className="text-gray-600 mt-1">
          Release scholarship grants to approved beneficiaries.
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search beneficiary name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" />
          
        </div>
        <div className="flex gap-2">
          {(['pending', 'released', 'all'] as const).map((f) =>
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-sm font-medium rounded-md border capitalize transition-colors ${filter === f ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            
              {f}
            </button>
          )}
        </div>
      </Card>

      {/* Beneficiaries Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Beneficiary</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Amount / Reference</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {beneficiaries.length === 0 ?
              <tr>
                  <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-gray-500">
                  
                    No beneficiaries match this filter.
                  </td>
                </tr> :

              beneficiaries.map((app) => {
                const beneficiaryName = getBeneficiaryName(app);
                const beneficiaryEmail = getBeneficiaryEmail(app);
                const beneficiaryCourseYear = getBeneficiaryCourseYear(app);
                const transactions =
                app.grantTransactions && app.grantTransactions.length > 0 ?
                app.grantTransactions :
                app.grantDisbursement ?
                [app.grantDisbursement] :
                [];
                const released = transactions.length > 0;
                const latestRelease = released ?
                [...transactions].sort(
                  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                )[0] :
                null;
                return (
                  <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                            {beneficiaryName.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {beneficiaryName}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {beneficiaryEmail}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {beneficiaryCourseYear}
                            </div>
                            <div className="text-gray-400 text-[11px]">
                              App ID: {app.id.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {released ?
                      <Badge variant="success">Released</Badge> :

                      <Badge variant="warning">Pending</Badge>
                      }
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {released && latestRelease ?
                      <div>
                            <div className="font-medium text-gray-900">
                              ₱{latestRelease.amount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {latestRelease.method} · {latestRelease.reference}
                            </div>
                            <div className="text-[11px] text-sky-700 mt-0.5">
                              {transactions.length} transaction
                              {transactions.length === 1 ? '' : 's'}
                            </div>
                          </div> :

                      <span className="text-gray-400">—</span>
                      }
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <Button
                            size="sm"
                            variant={released ? 'outline' : 'default'}
                            onClick={() => openSendGrant(app)}
                            className="gap-1.5">
                            <Send className="w-3.5 h-3.5" />{' '}
                            {released ? 'Send Next Grant' : 'Send Grant'}
                          </Button>
                          {latestRelease &&
                          <span className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                              <Calendar className="w-3.5 h-3.5" />
                              Last: {new Date(latestRelease.date).toLocaleDateString()}
                            </span>
                          }
                        </div>
                      </td>
                    </tr>);

              })
              }
            </tbody>
          </table>
        </div>
      </Card>

      {/* Send Grant Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Send Scholarship Grant"
        maxWidth="max-w-lg">
        
        {selected &&
        (() => {
          const beneficiaryName = getBeneficiaryName(selected);
          const beneficiaryEmail = getBeneficiaryEmail(selected);
          const beneficiaryCourseYear = getBeneficiaryCourseYear(selected);
          return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg">
                  <p className="text-xs text-sky-700 font-medium uppercase tracking-wide mb-1">
                    Beneficiary
                  </p>
                  <p className="font-semibold text-gray-900">{beneficiaryName}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{beneficiaryEmail}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {beneficiaryCourseYear}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {selectedScholarship?.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Application ID: {selected.id.toUpperCase()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                  label="Amount (₱) *"
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) =>
                  setForm({
                    ...form,
                    amount: e.target.value
                  })
                  }
                  placeholder="5000"
                  required />
                
                  <Input
                  label="Release Date *"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                  setForm({
                    ...form,
                    date: e.target.value
                  })
                  }
                  required />
                
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Disbursement Method *
                  </label>
                  <select
                  value={form.method}
                  onChange={(e) =>
                  setForm({
                    ...form,
                    method: e.target.value as any
                  })
                  }
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                  
                    <option>Bank Transfer</option>
                    <option>GCash</option>
                    <option>Cheque</option>
                    <option>Cash Pickup</option>
                  </select>
                </div>

                <Input
                label="Reference Number *"
                value={form.reference}
                onChange={(e) =>
                setForm({
                  ...form,
                  reference: e.target.value
                })
                }
                placeholder="GR-12345678"
                required />
              

                <Textarea
                label="Note to Beneficiary (optional)"
                value={form.note}
                onChange={(e) =>
                setForm({
                  ...form,
                  note: e.target.value
                })
                }
                rows={2}
                placeholder="e.g. Please confirm receipt within 3 working days." />
              

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 flex items-start gap-2">
                  <Send className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    The beneficiary will receive an in-app notification and an
                    email at their signup address immediately after release.
                  </span>
                </div>

                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelected(null)}>
                  
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 gap-2">
                    <Send className="w-4 h-4" /> Release Grant
                  </Button>
                </div>
              </form>);

        })()}
      </Modal>
    </div>);

}