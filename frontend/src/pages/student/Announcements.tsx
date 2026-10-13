import React, { useMemo, useState } from 'react';
import { Megaphone, Calendar, GraduationCap, Globe } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import { detectProgramFromTitle } from '../../lib/programs';
import {
  ANNOUNCEMENT_AUDIENCE_ALL_STUDENTS,
  isAnnouncementVisibleToStudent,
  getAnnouncementAudienceLabel
} from '../../lib/announcements';
import { formatAppDateTime } from '../../lib/datetime';

export function StudentAnnouncements() {
  const { announcements, applications, scholarships } = useData();
  const { user } = useAuth();
  if (!user) return null;
  const storageKey = `read-announcements:${user.id}`;
  const initialReadIds = useMemo(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }, [storageKey]);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<string[]>(initialReadIds);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
  // Scholarships this student is a beneficiary of
  const myBeneficiaryScholarshipIds = new Set(
    applications.
    filter((a) => a.studentId === user.id && a.status === 'Approved').
    map((a) => a.scholarshipId)
  );
  const myPrograms = new Set(
    scholarships
      .filter((s) => myBeneficiaryScholarshipIds.has(s.id))
      .map((s) => detectProgramFromTitle(s.title))
      .filter(Boolean) as string[]
  );
  const visible = announcements
    .filter((a) =>
      isAnnouncementVisibleToStudent(a, {
        beneficiaryScholarshipIds: myBeneficiaryScholarshipIds,
        beneficiaryPrograms: myPrograms
      })
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const selectedAnnouncement =
  selectedAnnouncementId ? visible.find((a) => a.id === selectedAnnouncementId) || null : null;
  const getAudienceLabel = (target: string) =>
    getAnnouncementAudienceLabel(target, scholarships);
  const markAnnouncementAsRead = (id: string) => {
    setReadAnnouncementIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };
  const handleOpenAnnouncement = (id: string) => {
    setSelectedAnnouncementId(id);
  };
  const handleBackFromAnnouncement = () => {
    setSelectedAnnouncementId(null);
  };

  const selectedIsRead = selectedAnnouncement
    ? readAnnouncementIds.includes(selectedAnnouncement.id)
    : false;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-600 mt-1">
          Campus-wide updates and announcements for your scholarship programs.
        </p>
      </div>

      {visible.length === 0 ?
      <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No announcements yet
          </h3>
          <p className="text-gray-500">
            Check back later for campus-wide updates and scholarship-specific
            news from administrators.
          </p>
        </Card> :

      <div className="space-y-4">
          {visible.map((a) => {
          const isAll =
            a.targetAudience === ANNOUNCEMENT_AUDIENCE_ALL_STUDENTS ||
            a.targetAudience === 'all';
          const isRead = readAnnouncementIds.includes(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => handleOpenAnnouncement(a.id)}
              className="w-full text-left">
              <Card className="p-6 hover:border-sky-300 transition-colors">
                <div className="flex justify-between items-start mb-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${isAll ? 'bg-blue-100 text-blue-600' : 'bg-sky-100 text-sky-600'}`}>
                    
                      {isAll ?
                    <Globe className="w-5 h-5" /> :

                    <GraduationCap className="w-5 h-5" />
                    }
                    </div>
                    <h3 className={`text-gray-900 ${isRead ? 'font-medium' : 'font-bold'}`}>
                      {a.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isRead && (
                      <Badge variant="warning">New</Badge>
                    )}
                    <Badge variant={isAll ? 'info' : 'success'}>
                      {getAudienceLabel(a.targetAudience)}
                    </Badge>
                  </div>
                </div>
                <p
                className="text-sm text-gray-600 whitespace-pre-wrap mb-4 pl-13"
                style={{
                  paddingLeft: '52px'
                }}>
                
                  {a.content}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatAppDateTime(a.date)}
                </div>
              </Card>
            </button>);

        })}
        </div>
      }
      <Modal
        isOpen={!!selectedAnnouncement}
        onClose={handleBackFromAnnouncement}
        title="Announcement"
        maxWidth="max-w-2xl"
        footer={
          selectedAnnouncement ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
              <p className="text-xs text-gray-500">
                {selectedIsRead
                  ? 'You have marked this announcement as read.'
                  : 'After reading, mark this announcement as read to remove it from your new items.'}
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleBackFromAnnouncement}>
                  Close
                </Button>
                {!selectedIsRead && (
                  <Button
                    onClick={() => {
                      markAnnouncementAsRead(selectedAnnouncement.id);
                    }}>
                    Mark as read
                  </Button>
                )}
              </div>
            </div>
          ) : undefined
        }>
        
        {selectedAnnouncement &&
        <div className="space-y-5">
            <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-sky-50 to-white p-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 break-words">
                    {selectedAnnouncement.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge
                    variant={
                    selectedAnnouncement.targetAudience ===
                      ANNOUNCEMENT_AUDIENCE_ALL_STUDENTS ||
                    selectedAnnouncement.targetAudience === 'all'
                      ? 'info'
                      : 'success'
                    }>
                      {getAudienceLabel(selectedAnnouncement.targetAudience)}
                    </Badge>
                    <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatAppDateTime(selectedAnnouncement.date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                {selectedAnnouncement.content}
              </p>
            </div>
          </div>
        }
      </Modal>
    </div>);

}