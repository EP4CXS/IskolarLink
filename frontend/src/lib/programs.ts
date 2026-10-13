export type ScholarshipProgramKey = 'CHED - TES' | 'CHED-CUSCHO' | 'CHED-TDP';

export const SCHOLARSHIP_PROGRAMS: {
  key: ScholarshipProgramKey;
  label: string;
}[] = [
  { key: 'CHED - TES', label: 'CHED - TES' },
  { key: 'CHED-CUSCHO', label: 'CHED Coconut Scholarship (COSCHO)' },
  { key: 'CHED-TDP', label: 'CHED-TDP' },
];

/** Fixed chart/report labels for the three CHED programs */
export const SCHOLARSHIP_PROGRAM_CHART_LABELS: {
  key: ScholarshipProgramKey;
  abbreviation: string;
}[] = [
  { key: 'CHED - TES', abbreviation: 'TES' },
  { key: 'CHED-TDP', abbreviation: 'TDP' },
  { key: 'CHED-CUSCHO', abbreviation: 'COSCHO' }
];

export function getProgramAbbreviation(
  programKey: ScholarshipProgramKey | null
): string {
  if (!programKey) return 'Other';
  return (
    SCHOLARSHIP_PROGRAM_CHART_LABELS.find((p) => p.key === programKey)
      ?.abbreviation ?? 'Other'
  );
}

export function detectProgramFromTitle(title: string): ScholarshipProgramKey | null {
  const upper = (title || '').toUpperCase();
  if (
    upper.includes('CHED-CUSCHO') ||
    upper.includes('CUSCHO') ||
    upper.includes('COSCHO') ||
    upper.includes('COCONUT SCHOLARSHIP')
  ) {
    return 'CHED-CUSCHO';
  }
  if (upper.includes('CHED-TDP') || upper.includes('TULONG DUNONG')) {
    return 'CHED-TDP';
  }
  if (
    upper.includes('CHED - TES') ||
    upper.includes('CHED-TES') ||
    upper.includes('TERTIARY EDUCATION SUBSIDY')
  ) {
    return 'CHED - TES';
  }
  if (/\bTES\b/.test(upper)) {
    return 'CHED - TES';
  }
  if (/\bTDP\b/.test(upper)) {
    return 'CHED-TDP';
  }
  return null;
}

