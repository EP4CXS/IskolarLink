import { Announcement } from '../types';

export const ANNOUNCEMENT_AUDIENCE_ALL_STUDENTS = 'all-students';
export const ANNOUNCEMENT_AUDIENCE_ALL_BENEFICIARIES = 'all';

export function isAnnouncementVisibleToStudent(
  announcement: Pick<Announcement, 'targetAudience'>,
  ctx: {
    beneficiaryScholarshipIds: Set<string>;
    beneficiaryPrograms: Set<string>;
  }
): boolean {
  const target = announcement.targetAudience;
  if (target === ANNOUNCEMENT_AUDIENCE_ALL_STUDENTS) {
    return true;
  }
  if (target === ANNOUNCEMENT_AUDIENCE_ALL_BENEFICIARIES) {
    return (
      ctx.beneficiaryScholarshipIds.size > 0 ||
      ctx.beneficiaryPrograms.size > 0
    );
  }
  return (
    ctx.beneficiaryScholarshipIds.has(target) ||
    ctx.beneficiaryPrograms.has(target)
  );
}

export function getAnnouncementAudienceLabel(
  target: string,
  scholarships: { id: string; title: string }[]
): string {
  if (target === ANNOUNCEMENT_AUDIENCE_ALL_STUDENTS) {
    return 'All Students';
  }
  if (target === ANNOUNCEMENT_AUDIENCE_ALL_BENEFICIARIES) {
    return 'All Beneficiaries';
  }
  const scholarship = scholarships.find((s) => s.id === target);
  return scholarship?.title || target;
}
