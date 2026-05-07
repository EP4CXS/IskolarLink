export type ScholarshipProgramKey = 'CHED - TES' | 'CHED-CUSCHO' | 'CHED-TDP';

export const SCHOLARSHIP_PROGRAMS: {
  key: ScholarshipProgramKey;
  label: string;
}[] = [
  { key: 'CHED - TES', label: 'CHED - TES' },
  { key: 'CHED-CUSCHO', label: 'CHED-CUSCHO' },
  { key: 'CHED-TDP', label: 'CHED-TDP' },
];

export function detectProgramFromTitle(title: string): ScholarshipProgramKey | null {
  const upper = (title || '').toUpperCase();
  if (upper.includes('CHED-CUSCHO') || upper.includes('CUSCHO')) return 'CHED-CUSCHO';
  if (
    upper.includes('CHED - TES') ||
    upper.includes('CHED-TES') ||
    upper.includes('TERTIARY EDUCATION SUBSIDY') ||
    upper.includes('TES')
  ) {
    return 'CHED - TES';
  }
  if (upper.includes('CHED-TDP') || upper.includes('TULONG DUNONG') || upper.includes('TDP')) {
    return 'CHED-TDP';
  }
  return null;
}

