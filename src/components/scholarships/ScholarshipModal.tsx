import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ListChecks, GraduationCap, Info } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui';
import {
  ScholarshipProgramContent,
  PriorityProgramGroup,
  isPriorityProgramGroups,
  formatProgramList
} from '../../data/scholarshipPrograms';

interface ScholarshipModalProps {
  program: ScholarshipProgramContent | null;
  isOpen: boolean;
  onClose: () => void;
  scholarshipId: string | null;
  hasApplied: boolean;
}

function ModalSection({
  icon: Icon,
  title,
  children
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-100 bg-slate-50/60 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
          {title}
        </h3>
      </div>
      <div className="px-4 py-3 text-sm text-slate-600 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function PriorityProgramItem({ group }: { group: PriorityProgramGroup }) {
  return (
    <li className="rounded-md border border-slate-100 bg-white px-3 py-2.5 shadow-sm">
      <p className="leading-relaxed">
        <span className="font-bold text-slate-900">{group.category}:</span>{' '}
        <span>{formatProgramList(group.programs)}.</span>
      </p>
    </li>
  );
}

export function ScholarshipModal({
  program,
  isOpen,
  onClose,
  scholarshipId,
  hasApplied
}: ScholarshipModalProps) {
  const priorityPrograms = program?.priorityPrograms;
  const hasGroupedPrograms =
    priorityPrograms && isPriorityProgramGroups(priorityPrograms);
  const isLongList =
    priorityPrograms &&
    !hasGroupedPrograms &&
    (priorityPrograms as string[]).length > 10;

  const footer = (
    <div className="space-y-3">
      {hasApplied ? (
        <Link to="/student/applications" className="block" onClick={onClose}>
          <Button variant="outline" className="w-full">
            View Application
          </Button>
        </Link>
      ) : scholarshipId ? (
        <Link
          to={`/student/apply/${scholarshipId}`}
          className="block"
          onClick={onClose}
        >
          <Button className="w-full">Apply Now</Button>
        </Link>
      ) : (
        <>
          <Button className="w-full" disabled>
            Apply Now
          </Button>
          <p className="text-xs text-center text-slate-500">
            This program is not open for applications yet. Contact the
            scholarship office.
          </p>
        </>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen && program !== null}
      onClose={onClose}
      title={program?.title ?? ''}
      subtitle="Scholarship program details"
      maxWidth={isLongList ? 'max-w-3xl' : 'max-w-2xl'}
      footer={program ? footer : undefined}
    >
      {program && (
        <div className="space-y-4">
          <ModalSection icon={FileText} title="Description">
            <p>{program.fullDescription}</p>
          </ModalSection>

          <ModalSection icon={ListChecks} title="Eligibility Requirements">
            {program.eligibilityIntro && (
              <p className="mb-3 text-slate-700">{program.eligibilityIntro}</p>
            )}
            <ul className="list-disc pl-5 space-y-2 marker:text-sky-500">
              {program.eligibilityRequirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </ModalSection>

          {priorityPrograms && priorityPrograms.length > 0 && (
            <ModalSection
              icon={GraduationCap}
              title={
                hasGroupedPrograms
                  ? 'Priority Degree Programs'
                  : 'Priority Programs'
              }
            >
              {hasGroupedPrograms ? (
                <>
                  <p className="mb-4 text-slate-700">
                    National priority programs and courses include but are not
                    limited to:
                  </p>
                  <ul className="space-y-2.5">
                    {priorityPrograms.map((group) => (
                      <PriorityProgramItem key={group.category} group={group} />
                    ))}
                  </ul>
                </>
              ) : (
                <ol className="list-decimal pl-5 space-y-1.5 max-h-[min(50vh,320px)] overflow-y-auto pr-1">
                  {(priorityPrograms as string[]).map((p, i) => (
                    <li key={i} className="pl-1">
                      {p}
                    </li>
                  ))}
                </ol>
              )}
            </ModalSection>
          )}

          {program.additionalNotes && (
            <ModalSection icon={Info} title="Note">
              <p className="text-slate-700">{program.additionalNotes}</p>
            </ModalSection>
          )}
        </div>
      )}
    </Modal>
  );
}
