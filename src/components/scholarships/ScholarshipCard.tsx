import React from 'react';
import { Award, Calendar, Users } from 'lucide-react';
import { Card, Badge } from '../ui';
import { ScholarshipProgramContent } from '../../data/scholarshipPrograms';

interface ScholarshipCardProps {
  program: ScholarshipProgramContent;
  deadline?: string | null;
  slots?: number | null;
  hasApplied?: boolean;
  onClick: () => void;
}

export function ScholarshipCard({
  program,
  deadline,
  slots,
  hasApplied = false,
  onClick
}: ScholarshipCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const deadlineLabel = deadline
    ? new Date(deadline).toLocaleDateString()
    : 'TBA';
  const slotsLabel = slots != null ? String(slots) : 'TBA';

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
    >
      <div className="h-2 bg-sky-600" />
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex gap-2">
            <Badge variant="info">Open</Badge>
            {hasApplied && <Badge variant="success">Applied</Badge>}
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{program.title}</h3>
        <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-1">
          {program.shortDescription}
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Deadline:{' '}
              <span className="font-medium text-slate-900">{deadlineLabel}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Slots available:{' '}
              <span className="font-medium text-slate-900">{slotsLabel}</span>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
