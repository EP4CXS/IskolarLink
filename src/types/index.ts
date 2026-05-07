export type Role = 'student' | 'admin';
export type ApplicationStatus =
'Pending' |
'Under Review' |
'Screened' |
'Approved' |
'Rejected';

export interface UserProfile {
  course?: string;
  yearLevel?: number;
  gpa?: number;
  income?: number;
  phone?: string;
  address?: string;
  credentials?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
  avatar?: string; // data URL
  profile?: UserProfile;
}

export interface Scholarship {
  id: string;
  title: string;
  description: string;
  deadline: string;
  slots: number;
  benefits: string[];
  criteria: {
    minGpa?: number;
    maxIncome?: number;
    requiredCourses?: string[];
  };
  status: 'Active' | 'Closed' | 'Draft';
}

export interface TimelineEvent {
  id: string;
  status: ApplicationStatus;
  date: string;
  note?: string;
  author?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string; // Mock URL
}

export interface RubricScore {
  academic: number; // 1-10
  financialNeed: number; // 1-10
  extracurricular: number; // 1-10
  essay: number; // 1-10
  total: number;
  notes: string;
}

export interface GrantDisbursement {
  date: string;
  amount: number;
  method: 'Bank Transfer' | 'GCash' | 'Cheque' | 'Cash Pickup';
  reference: string;
  note?: string;
  releasedBy?: string;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface Application {
  id: string;
  studentId: string;
  scholarshipId: string;
  status: ApplicationStatus;
  submissionDate: string;
  timeline: TimelineEvent[];
  documents: Document[];
  answers: Record<string, string>;
  rubricScore?: RubricScore;
  grantDisbursement?: GrantDisbursement;
  grantTransactions?: GrantDisbursement[];
  bankAccount?: BankAccount;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  authorId: string;
  // 'all' = visible to everyone; otherwise scholarship id
  targetAudience: 'all' | string;
  category?: 'general' | 'grant-release';
  grantReleaseDate?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  date: string;
  link?: string;
}