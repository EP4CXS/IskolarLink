import {
  detectProgramFromTitle,
  ScholarshipProgramKey
} from '../lib/programs';
import { Scholarship } from '../types';

export type ScholarshipProgramId = 'tes' | 'tdp' | 'coscho';

export interface PriorityProgramGroup {
  category: string;
  programs: string[];
}

export interface ScholarshipProgramContent {
  id: ScholarshipProgramId;
  programKey: ScholarshipProgramKey;
  title: string;
  shortDescription: string;
  fullDescription: string;
  eligibilityIntro?: string;
  eligibilityRequirements: string[];
  priorityPrograms?: PriorityProgramGroup[] | string[];
  additionalNotes?: string;
}

export const SCHOLARSHIP_PROGRAM_CONTENT: ScholarshipProgramContent[] = [
  {
    id: 'tes',
    programKey: 'CHED - TES',
    title: 'CHED Tertiary Education Subsidy (TES)',
    shortDescription:
      'The Commission on Higher Education (CHED) Tertiary Education Subsidy (TES) is a grant-in-aid program designed to support the educational costs of priority Filipino undergraduate students enrolled in State Universities and Colleges (SUCs), CHED-recognized Local Universities and Colleges (LUCs), and private Higher Education Institutions (HEIs).',
    fullDescription:
      'The Commission on Higher Education (CHED) Tertiary Education Subsidy (TES) is a grant-in-aid program designed to support the educational costs of priority Filipino undergraduate students enrolled in State Universities and Colleges (SUCs), CHED-recognized Local Universities and Colleges (LUCs), and private Higher Education Institutions (HEIs).',
    eligibilityIntro:
      'To qualify, a student must meet the following criteria:',
    eligibilityRequirements: [
      'Must be a Filipino citizen.',
      'Enrolled in a first undergraduate degree program.',
      'Combined household gross income does not exceed ₱400,000.',
      'Not a beneficiary of other national government-funded scholarship programs (like CSPs or TDP).'
    ],
    priorityPrograms: [
      {
        category: 'Science & Mathematics',
        programs: [
          'Biology',
          'Chemistry',
          'Mathematics',
          'Physics',
          'Marine Science'
        ]
      },
      {
        category: 'Information Technology',
        programs: [
          'Computer Science',
          'Cybersecurity',
          'Information Technology',
          'Library Science'
        ]
      },
      {
        category: 'Engineering & Technology',
        programs: [
          'Civil Engineering',
          'Mechanical Engineering',
          'Electrical Engineering',
          'Chemical Engineering',
          'Agricultural and Biosystems Engineering'
        ]
      },
      {
        category: 'Business & Management',
        programs: ['Accountancy', 'Business Analytics']
      },
      {
        category: 'Health Professions',
        programs: ['Nursing', 'Medical Technology/Science']
      },
      {
        category: 'Education',
        programs: ['Secondary Education major in Science or Math']
      },
      {
        category: 'Agriculture & Forestry',
        programs: ['Veterinary Medicine', 'Forestry', 'Agro-Forestry']
      }
    ]
  },
  {
    id: 'tdp',
    programKey: 'CHED-TDP',
    title: 'CHED Tulong Dunong Program (TDP)',
    shortDescription:
      'The CHED Tulong Dunong Program (TDP) is one of the flagship financial assistance programs offered by the Commission on Higher Education (CHED) for Filipino students. It is designed to help economically disadvantaged but deserving learners pursue higher education in public and private colleges or universities.',
    fullDescription:
      'The CHED Tulong Dunong Program (TDP) is one of the flagship financial assistance programs offered by the Commission on Higher Education (CHED) for Filipino students. It is designed to help economically disadvantaged but deserving learners pursue higher education in public and private colleges or universities.',
    eligibilityIntro:
      'To qualify for the CHED Tulong Dunong Program 2026, applicants must meet the following criteria:',
    eligibilityRequirements: [
      'Citizenship – Must be a Filipino citizen.',
      'Academic Standing – High school graduate or currently enrolled in any CHED-recognized Higher Education Institution (HEI). A minimum passing grade is required.',
      'Income Requirement – Must belong to a household with an annual gross income not exceeding ₱400,000. Special consideration may be given to those slightly above the limit with proper justification.',
      'Good Moral Character – Must provide certification from the school or barangay.',
      'No Existing Scholarship – Applicants cannot be recipients of other full government scholarships.'
    ]
  },
  {
    id: 'coscho',
    programKey: 'CHED-CUSCHO',
    title: 'CHED Coconut Scholarship Program (COSCHO)',
    shortDescription:
      'The CHED Coconut Scholarship Program (COSCHO) is a scholarship grant intended for qualified Filipino students who are duly registered coconut farmers in the National Coconut Farmers Registry System (NCFRS) or their dependents. It supports eligible students pursuing identified priority degree programs in recognized higher education institutions.',
    fullDescription:
      'The CHED Coconut Scholarship Program (COSCHO) is a scholarship grant intended for qualified Filipino students who are duly registered coconut farmers in the National Coconut Farmers Registry System (NCFRS) or their dependents. It supports eligible students pursuing identified priority degree programs in recognized higher education institutions.',
    eligibilityIntro:
      'A student-applicant must comply with the following qualifications to avail of the scholarship grant:',
    eligibilityRequirements: [
      'Must be a Filipino citizen.',
      'Must be a graduating high school student, high school graduate, or college student with earned academic units relevant to the degree programs identified by PCA.',
      'Must have a general weighted average (GWA) of 80% or its equivalent.',
      'Must pass the entry-level requirements of identified State Universities and Colleges (SUCs).',
      'Must not be a recipient of any government-funded financial assistance program.',
      'For qualified applicants with a privately funded scholarship grant covering only tuition fees, the applicant must pass the entry-level requirement of the private higher education institution (HEI).',
      'Must be a duly registered coconut farmer in the NCFRS or a dependent of one.',
      'Must have a combined annual gross income of parents not exceeding ₱300,000.00.'
    ],
    priorityPrograms: [
      'Bachelor of Science in Agriculture',
      'Bachelor of Science in Agricultural Biotechnology',
      'Bachelor of Science in Agricultural and Biosystems Engineering',
      'Bachelor of Science in Agribusiness/Agribusiness Management',
      'Bachelor of Science in Agricultural Economics',
      'Bachelor of Science in Agricultural Chemistry',
      'Bachelor of Science in Agricultural Entrepreneurship',
      'Bachelor of Science in Agricultural Engineering',
      'Bachelor of Science in Agricultural Extension Education',
      'Bachelor of Science in Agricultural Technology',
      'Bachelor of Science in Agri-fisheries',
      'Bachelor of Science in Agroforestry',
      'Bachelor of Science in Architectural Engineering',
      'Bachelor of Science in Biology',
      'Bachelor of Science in Biochemistry',
      'Bachelor of Science in Business Administration',
      'Bachelor of Science in Dairy Technology',
      'Bachelor of Science in Development',
      'Bachelor of Science in Development Communication',
      'Bachelor of Science in Economics/Bachelor of Arts in Economics',
      'Bachelor of Science in Environmental Engineering',
      'Bachelor of Science in Environmental Science',
      'Bachelor of Science in Fisheries',
      'Bachelor of Science in Food Engineering',
      'Bachelor of Science in Food Science and Technology',
      'Bachelor of Science in Forestry',
      'Bachelor of Science in Manufacturing Engineering/Manufacturing Technology Engineering',
      'Bachelor of Science in Marine Biology',
      'Bachelor of Science in Microbiology',
      'Bachelor of Science in Political Science',
      'Bachelor of Science in Physics',
      'Bachelor of Science in Psychology',
      'Bachelor of Science in Public Administration',
      'Bachelor of Science in Rural Development',
      'Bachelor of Science in Social Work',
      'Bachelor of Science in Statistics',
      'Bachelor of Science in Tourism'
    ],
    additionalNotes:
      'In highly exceptional cases where the income exceeds ₱300,000.00, the concerned CHED Regional Office (CHEDRO) shall determine the merits of the application. Cases such as family members with medical issues or families with two or more dependents enrolled in college may be considered meritorious.'
  }
];

export function getScholarshipProgramById(
  id: ScholarshipProgramId
): ScholarshipProgramContent | undefined {
  return SCHOLARSHIP_PROGRAM_CONTENT.find((p) => p.id === id);
}

export function resolveActiveScholarship(
  programKey: ScholarshipProgramKey,
  scholarships: Scholarship[]
): Scholarship | null {
  return (
    scholarships.find(
      (s) =>
        s.status === 'Active' &&
        detectProgramFromTitle(s.title) === programKey
    ) ?? null
  );
}

export function resolveActiveScholarshipId(
  programKey: ScholarshipProgramKey,
  scholarships: Scholarship[]
): string | null {
  return resolveActiveScholarship(programKey, scholarships)?.id ?? null;
}

export function isPriorityProgramGroups(
  programs: PriorityProgramGroup[] | string[]
): programs is PriorityProgramGroup[] {
  return (
    programs.length > 0 &&
    typeof programs[0] === 'object' &&
    'category' in programs[0]
  );
}

export function formatProgramList(programs: string[]): string {
  if (programs.length === 0) return '';
  if (programs.length === 1) return programs[0];
  if (programs.length === 2) return `${programs[0]} and ${programs[1]}`;
  return `${programs.slice(0, -1).join(', ')}, and ${programs[programs.length - 1]}`;
}
