import React, { useState } from 'react';
import {
  Megaphone,
  Send,
  Calendar,
  User as UserIcon,
  GraduationCap,
  Globe,
  Pencil,
  Trash2 } from
'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Input, Textarea, Badge } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import { SCHOLARSHIP_PROGRAMS } from '../../lib/programs';
import {
  ANNOUNCEMENT_AUDIENCE_ALL_BENEFICIARIES,
  ANNOUNCEMENT_AUDIENCE_ALL_STUDENTS,
  getAnnouncementAudienceLabel
} from '../../lib/announcements';
import { formatAppDateTime } from '../../lib/datetime';

export function AdminAnnouncements() {
  const {
    announcements,
    scholarships,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement } =
  useData();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<string>(ANNOUNCEMENT_AUDIENCE_ALL_STUDENTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isConfirmPostOpen, setIsConfirmPostOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setAudience(ANNOUNCEMENT_AUDIENCE_ALL_STUDENTS);
    setEditingId(null);
  };

  const submitAnnouncement = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsPosting(true);
    try {
      if (editingId) {
        await updateAnnouncement(editingId, {
          title,
          content,
          targetAudience: audience,
          category: 'general',
        });
      } else {
        await addAnnouncement({
          title,
          content,
          authorId: user?.id || 'a1',
          targetAudience: audience,
          category: 'general',
        });
      }
      resetForm();
      setIsConfirmPostOpen(false);
    } catch {
      // Reuse inline feedback already shown in DataContext toasts.
    } finally {
      setIsPosting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (editingId) {
      void submitAnnouncement();
      return;
    }
    setIsConfirmPostOpen(true);
  };

  const sortedAnnouncements = [...announcements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getAudienceLabel = (target: string) => {
    if (
      target === ANNOUNCEMENT_AUDIENCE_ALL_STUDENTS ||
      target === ANNOUNCEMENT_AUDIENCE_ALL_BENEFICIARIES
    ) {
      return getAnnouncementAudienceLabel(target, scholarships);
    }
    const program = SCHOLARSHIP_PROGRAMS.find((p) => p.key === target);
    if (program) return program.label;
    return getAnnouncementAudienceLabel(target, scholarships);
  };

  const startEdit = (id: string) => {
    const ann = announcements.find((a) => a.id === id);
    if (!ann) return;
    setEditingId(ann.id);
    setTitle(ann.title);
    setContent(ann.content);
    setAudience(ann.targetAudience || ANNOUNCEMENT_AUDIENCE_ALL_STUDENTS);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteAnnouncement(deletingId);
      if (editingId === deletingId) {
        setEditingId(null);
        setTitle('');
        setContent('');
        setAudience(ANNOUNCEMENT_AUDIENCE_ALL_STUDENTS);
      }
    } finally {
      setIsDeleteOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-600 mt-1">
          Post updates targeted to all applicants or to a specific scholarship's
          applicants.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-sky-600" />{' '}
            {editingId ? 'Edit Announcement' : 'New Announcement'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Application period extended..."
              required />

            <Textarea
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Write your announcement here..."
              required />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">

                <option value={ANNOUNCEMENT_AUDIENCE_ALL_STUDENTS}>
                  All Students
                </option>
                <option value={ANNOUNCEMENT_AUDIENCE_ALL_BENEFICIARIES}>
                  All Beneficiaries
                </option>
                {SCHOLARSHIP_PROGRAMS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label} (beneficiaries)
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1.5">
                {audience === ANNOUNCEMENT_AUDIENCE_ALL_STUDENTS
                  ? 'Visible to every registered student account. All students will receive an in-app notification and email.'
                  : audience === ANNOUNCEMENT_AUDIENCE_ALL_BENEFICIARIES
                    ? 'Visible to students with at least one approved scholarship application. They will receive an email at their signup address.'
                    : 'Visible to approved beneficiaries in this program only. They will receive an email at their signup address.'}
              </p>
            </div>
            <div className="flex gap-2">
              {editingId &&
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEditingId(null);
                  setTitle('');
                  setContent('');
                  setAudience(ANNOUNCEMENT_AUDIENCE_ALL_STUDENTS);
                }}>
                Cancel Edit
              </Button>
              }
              <Button type="submit" className="flex-1 gap-2">
                <Send className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Post Announcement'}
              </Button>
            </div>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-gray-900">
            Recent Announcements ({sortedAnnouncements.length})
          </h2>
          {sortedAnnouncements.length === 0 ?
          <Card className="p-12 text-center text-gray-500">
              No announcements yet.
            </Card> :

          sortedAnnouncements.map((a) => {
            const isAllStudents =
              a.targetAudience === ANNOUNCEMENT_AUDIENCE_ALL_STUDENTS;
            const isAllBeneficiaries =
              a.targetAudience === ANNOUNCEMENT_AUDIENCE_ALL_BENEFICIARIES;
            return (
              <Card key={a.id} className="p-6">
                  <div className="flex justify-between items-start mb-3 gap-4">
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          isAllStudents || isAllBeneficiaries
                              ? 'info'
                              : 'success'
                        }>
                        <span className="flex items-center gap-1">
                          {isAllStudents || isAllBeneficiaries ? (
                            <Globe className="w-3 h-3" />
                          ) : (
                            <GraduationCap className="w-3 h-3" />
                          )}
                          {getAudienceLabel(a.targetAudience)}
                        </span>
                      </Badge>
                      <button
                        type="button"
                        onClick={() => startEdit(a.id)}
                        className="p-1.5 text-gray-500 hover:text-sky-700 hover:bg-sky-50 rounded">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(a.id)}
                        className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">
                    {a.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatAppDateTime(a.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5" />
                      Admin
                    </span>
                  </div>
                </Card>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={isConfirmPostOpen}
        onClose={() => !isPosting && setIsConfirmPostOpen(false)}
        title="Post Announcement"
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsConfirmPostOpen(false)}
              disabled={isPosting}>
              Cancel
            </Button>
            <Button onClick={() => void submitAnnouncement()} disabled={isPosting} className="gap-2">
              <Send className="w-4 h-4" />
              {isPosting ? 'Posting...' : 'Yes, Post'}
            </Button>
          </div>
        }>
        <p className="text-sm text-gray-600">
          Are you sure you want to post this announcement? Students in the selected audience will
          receive in-app notifications and email alerts.
        </p>
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-3 whitespace-pre-wrap">{content}</p>
          <p className="text-xs text-sky-700 mt-2 font-medium">
            Audience: {getAudienceLabel(audience)}
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Announcement"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        }>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this announcement? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
