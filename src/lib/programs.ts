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
  // longer keys first
  const keys: ScholarshipProgramKey[] = ['CHED-CUSCHO', 'CHED - TES', 'CHED-TDP'];
  return (keys.find((k) => upper.includes(k)) as ScholarshipProgramKey | undefined) ?? null;
}

