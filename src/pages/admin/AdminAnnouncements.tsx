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
  const [audience, setAudience] = useState<string>('all'); // 'all' or scholarship id
  const [category, setCategory] = useState<'general' | 'grant-release'>('general');
  const [grantReleaseDate, setGrantReleaseDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    try {
      if (editingId) {
        await updateAnnouncement(editingId, {
          title,
          content,
          targetAudience: audience,
          category,
          grantReleaseDate:
          category === 'grant-release' && grantReleaseDate ?
          new Date(grantReleaseDate).toISOString() :
          undefined
        });
      } else {
        await addAnnouncement({
          title,
          content,
          authorId: user?.id || 'a1',
          targetAudience: audience,
          category,
          grantReleaseDate:
          category === 'grant-release' && grantReleaseDate ?
          new Date(grantReleaseDate).toISOString() :
          undefined
        });
      }
      setTitle('');
      setContent('');
      setAudience('all');
      setCategory('general');
      setGrantReleaseDate('');
      setEditingId(null);
    } catch {
      // Reuse inline feedback already shown in DataContext toasts.
    }
  };
  const sortedAnnouncements = [...announcements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const getAudienceLabel = (target: string) => {
    if (target === 'all') return 'All Scholarships';
    const scholarship = scholarships.find((s) => s.id === target);
    return scholarship?.title || target;

  };
  const startEdit = (id: string) => {
    const ann = announcements.find((a) => a.id === id);
    if (!ann) return;
    setEditingId(ann.id);
    setTitle(ann.title);
    setContent(ann.content);
    setAudience(ann.targetAudience || 'all');
    setCategory(ann.category || 'general');
    setGrantReleaseDate(
      ann.grantReleaseDate ? new Date(ann.grantReleaseDate).toISOString().split('T')[0] : ''
    );
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
        setAudience('all');
        setCategory('general');
        setGrantReleaseDate('');
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
        {/* Compose */}
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
                Announcement Type
              </label>
              <select
                value={category}
                onChange={(e) =>
                setCategory(e.target.value as 'general' | 'grant-release')
                }
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="general">General Update</option>
                <option value="grant-release">Grant Release Schedule</option>
              </select>
            </div>

            {category === 'grant-release' &&
            <Input
              label="Next Grant Release Date"
              type="date"
              value={grantReleaseDate}
              onChange={(e) => setGrantReleaseDate(e.target.value)}
              required />
            }

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                
                <option value="all">All Beneficiaries</option>
                {scholarships.map((s) =>
                <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1.5">
                {audience === 'all' ?
                'This announcement will be visible to all beneficiaries.' :
                'Only beneficiaries of this scholarship will see this announcement.'}
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
                  setAudience('all');
                  setCategory('general');
                  setGrantReleaseDate('');
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

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-gray-900">
            Recent Announcements ({sortedAnnouncements.length})
          </h2>
          {sortedAnnouncements.length === 0 ?
          <Card className="p-12 text-center text-gray-500">
              No announcements yet.
            </Card> :

          sortedAnnouncements.map((a) => {
            const isAll = a.targetAudience === 'all';
            const isGrantRelease = a.category === 'grant-release';
            return (
              <Card key={a.id} className="p-6">
                  <div className="flex justify-between items-start mb-3 gap-4">
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                        isGrantRelease ? 'warning' : isAll ?
                        'info' :
                        'success'
                        }>
                        <span className="flex items-center gap-1">
                          {isAll ?
                        <Globe className="w-3 h-3" /> :

                        <GraduationCap className="w-3 h-3" />
                        }
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
                  {a.category === 'grant-release' && a.grantReleaseDate &&
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5 inline-block mb-3">
                      Next release: {new Date(a.grantReleaseDate).toLocaleDateString()}
                    </p>
                  }
                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(a.date).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5" />
                      Admin
                    </span>
                  </div>
                </Card>);

          })
          }
        </div>
      </div>
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Announcement"
        maxWidth="max-w-md">
        
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this announcement?
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>);

}