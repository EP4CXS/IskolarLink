import React, { useState } from 'react';
import { Search, Filter, Eye, Check, X, FileText } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, StatusBadge } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import { Application, User } from '../../types';
import { toast } from 'sonner';
export function ManageApplications() {
  const { applications, scholarships, users, updateApplicationStatus } =
  useData();
  const { user: adminUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const getAnswer = (app: Application, key: string) =>
  (app.answers?.[key] || '').toString().trim();
  const getApplicantName = (app: Application, student?: User) =>
  getAnswer(app, 'fullName') || student?.name || 'N/A';
  const getCourse = (app: Application, student?: User) =>
  getAnswer(app, 'course') || student?.profile?.course || 'N/A';
  const getGpa = (app: Application, student?: User) =>
  getAnswer(app, 'gpa') || student?.profile?.gpa?.toString() || 'N/A';
  const getFamilyIncome = (app: Application, student?: User) => {
    const raw =
    getAnswer(app, 'familyIncome') ||
    getAnswer(app, 'income') ||
    (student?.profile?.income !== undefined ? String(student.profile.income) : '');
    if (!raw) return 'N/A';
    if (raw.includes('-')) return raw;
    const numeric = Number(raw.toString().replace(/[^\d.]/g, ''));
    if (Number.isNaN(numeric)) return raw;
    return `₱${numeric.toLocaleString()}`;
  };
  const filteredApps = applications.filter((app) => {
    const student = users.find((u) => u.id === app.studentId);
    const scholarship = scholarships.find((s) => s.id === app.scholarshipId);
    if (!scholarship || scholarship.status === 'Closed') return false;
    const searchLower = searchTerm.toLowerCase();
    const applicantName = getApplicantName(app, student).toLowerCase();
    const scholarshipTitle = (scholarship?.title || '').toLowerCase();
    return (
      applicantName.includes(searchLower) ||
      scholarshipTitle.includes(searchLower) ||
      app.id.toLowerCase().includes(searchLower));

  });
  const handleOpenReview = (app: Application) => {
    setSelectedApp(app);
    setIsReviewModalOpen(true);
  };
  const handleAction = async (status: Application['status']) => {
    if (!selectedApp) return;
    try {
      await updateApplicationStatus(
        selectedApp.id,
        status,
        undefined,
        adminUser?.id
      );
      setIsReviewModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update application');
    }
  };
  const handleViewDocument = (doc: Application['documents'][number]) => {
    const url = (doc.url || '').trim();
    if (!url || url === '#') {
      toast.error('This attachment is from old mock data and has no real file link. Please re-upload via a new application.');
      return;
    }
    try {
      if (url.startsWith('data:')) {
        const [meta, dataPart = ''] = url.split(',', 2);
        const mime = meta.match(/^data:(.*?)(;|$)/)?.[1] || 'application/octet-stream';
        const isBase64 = /;base64/i.test(meta);
        let blob: Blob;
        if (isBase64) {
          const binary = atob(dataPart);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          blob = new Blob([bytes], { type: mime });
        } else {
          blob = new Blob([decodeURIComponent(dataPart)], { type: mime });
        }
        const blobUrl = URL.createObjectURL(blob);
        const opened = window.open(blobUrl, '_blank');
        if (!opened) toast.error('Popup blocked. Please allow popups for this site.');
        return;
      }
      const opened = window.open(url, '_blank');
      if (!opened) toast.error('Popup blocked. Please allow popups for this site.');
    } catch {
      toast.error('Failed to open this attachment.');
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Applications
          </h1>
          <p className="text-gray-600 mt-1">
            Review and evaluate student submissions.
          </p>
        </div>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name, scholarship, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" />
          
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" /> Filters
        </Button>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Applicant</th>
                <th className="px-6 py-4 font-medium">Scholarship</th>
                <th className="px-6 py-4 font-medium">Date Submitted</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApps.map((app) => {
                const student = users.find((u) => u.id === app.studentId);
                const scholarship = scholarships.find(
                  (s) => s.id === app.scholarshipId
                );
                return (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 transition-colors">
                    
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {getApplicantName(app, student)}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {student?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 line-clamp-1 max-w-xs">
                        {scholarship?.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(app.submissionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReview(app)}>
                        
                        Review
                      </Button>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Application Review"
        maxWidth="max-w-4xl">
        
        {selectedApp &&
        (() => {
          const student = users.find((u) => u.id === selectedApp.studentId);
          const scholarship = scholarships.find(
            (s) => s.id === selectedApp.scholarshipId
          );
          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Col: Applicant Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Applicant Profile
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name</span>
                        <span className="font-medium text-gray-900">
                          {getApplicantName(selectedApp, student)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Course</span>
                        <span className="font-medium text-gray-900">
                          {getCourse(selectedApp, student)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">GPA</span>
                        <span className="font-medium text-gray-900">
                          {getGpa(selectedApp, student)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Family Income</span>
                        <span className="font-medium text-gray-900">
                          {getFamilyIncome(selectedApp, student)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Documents
                    </h3>
                    <div className="space-y-2">
                      {selectedApp.documents.map((doc) =>
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-sky-600" />
                            <span className="text-sm text-gray-700">
                              {doc.name}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            type="button"
                            className="text-sky-700 hover:text-sky-800"
                            onClick={() => handleViewDocument(doc)}>
                            View
                          </Button>
                        </div>
                    )}
                    </div>
                  </div>

                </div>

                {/* Right Col: Review Actions */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Scholarship
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">Program</span>
                        <span className="font-medium text-gray-900 text-right">
                          {scholarship?.title || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">Current Status</span>
                        <span>
                          <StatusBadge status={selectedApp.status} />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Essay
                    </h3>
                    <div className="p-4 min-h-[140px] bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 italic whitespace-pre-wrap leading-relaxed">
                      "{selectedApp.answers.essay}"
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleAction('Approved')}>
                    
                      <Check className="w-4 h-4 mr-2" /> Approve Application
                    </Button>
                    <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => handleAction('Rejected')}>
                    
                      <X className="w-4 h-4 mr-2" /> Reject Application
                    </Button>
                  </div>
                </div>
              </div>);

        })()}
      </Modal>
    </div>);

}