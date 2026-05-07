const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.toString?.() ||
  'http://localhost/IskolarLink/api';

async function jsonFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar?: string | null;
  profile?: any;
};

export type ApiScholarship = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  slots: number;
  benefits: string[];
  criteria: Record<string, any>;
  status: 'Active' | 'Closed' | 'Draft';
};

export type ApiApplication = {
  id: string;
  studentId: string;
  scholarshipId: string;
  status: 'Pending' | 'Under Review' | 'Screened' | 'Approved' | 'Rejected';
  submissionDate: string;
  timeline: any[];
  documents: any[];
  answers: Record<string, string>;
  rubricScore?: any;
  grantDisbursement?: any;
  grantTransactions?: any[];
};

export type ApiStudentApplicationHistory = {
  applicationId: string;
  studentId: string;
  scholarshipId: string;
  scholarshipTitle: string;
  programType: string;
  status: string;
  submissionDate: string | null;
  archivedAt: string;
  archivedReason: string;
};

export type ApiScholarshipHistoryApplicant = {
  applicationId: string;
  studentId: string;
  name: string;
  email: string;
  status: string;
  submissionDate: string | null;
};

export type ApiScholarshipHistory = {
  id: string;
  scholarshipId: string;
  title: string;
  programType: string;
  endedAt: string;
  endedBy: string;
  totalApplicants: number;
  grantedApplicants: number;
  applicants: ApiScholarshipHistoryApplicant[];
};

export type ApiAnnouncement = {
  id: string;
  title: string;
  content: string;
  date: string;
  authorId: string;
  targetAudience: string;
  category?: 'general' | 'grant-release';
  grantReleaseDate?: string | null;
};

export type ApiNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  date: string;
  link?: string | null;
};

export async function apiLogin(email: string, password: string): Promise<ApiUser> {
  const r = await jsonFetch<{ ok: boolean; user: ApiUser }>('/auth/login.php', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return r.user;
}

export async function apiRegister(
  name: string,
  email: string,
  password: string
): Promise<ApiUser> {
  const r = await jsonFetch<{ ok: boolean; user: ApiUser }>('/auth/register.php', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  return r.user;
}

export async function apiGetUser(id: string): Promise<ApiUser> {
  const r = await jsonFetch<{ ok: boolean; user: ApiUser }>(
    `/users/get.php?id=${encodeURIComponent(id)}`
  );
  return r.user;
}

export async function apiListUsers(): Promise<ApiUser[]> {
  const r = await jsonFetch<{ ok: boolean; users: ApiUser[] }>('/users/list.php');
  return r.users;
}

export async function apiUpdateUser(
  id: string,
  updates: {
    name?: string;
    avatar?: string | null;
    profile?: any;
  }
): Promise<ApiUser> {
  const r = await jsonFetch<{ ok: boolean; user: ApiUser }>('/users/update.php', {
    method: 'POST',
    body: JSON.stringify({
      id,
      ...updates,
    }),
  });
  return r.user;
}

export async function apiListScholarships(): Promise<ApiScholarship[]> {
  const r = await jsonFetch<{ ok: boolean; scholarships: ApiScholarship[] }>('/scholarships/list.php');
  return r.scholarships;
}

export async function apiCreateScholarship(
  scholarship: Omit<ApiScholarship, 'id'>
): Promise<ApiScholarship> {
  const r = await jsonFetch<{ ok: boolean; scholarship: ApiScholarship }>('/scholarships/create.php', {
    method: 'POST',
    body: JSON.stringify(scholarship),
  });
  return r.scholarship;
}

export async function apiUpdateScholarship(
  id: string,
  updates: Partial<Omit<ApiScholarship, 'id'>>
): Promise<ApiScholarship> {
  const r = await jsonFetch<{ ok: boolean; scholarship: ApiScholarship }>('/scholarships/update.php', {
    method: 'POST',
    body: JSON.stringify({ id, ...updates }),
  });
  return r.scholarship;
}

export async function apiDeleteScholarship(id: string, adminId?: string): Promise<void> {
  await jsonFetch<{ ok: boolean }>('/scholarships/delete.php', {
    method: 'POST',
    body: JSON.stringify({ id, adminId }),
  });
}

export async function apiListScholarshipHistory(): Promise<ApiScholarshipHistory[]> {
  const r = await jsonFetch<{ ok: boolean; history: ApiScholarshipHistory[] }>('/scholarships/history.php');
  return r.history;
}

export async function apiListApplications(): Promise<ApiApplication[]> {
  const r = await jsonFetch<{ ok: boolean; applications: ApiApplication[] }>('/applications/list.php');
  return r.applications;
}

export async function apiListStudentApplicationHistory(studentId: string): Promise<ApiStudentApplicationHistory[]> {
  const r = await jsonFetch<{ ok: boolean; history: ApiStudentApplicationHistory[] }>(
    `/applications/history.php?studentId=${encodeURIComponent(studentId)}`
  );
  return r.history;
}

export async function apiCreateApplication(payload: {
  studentId: string;
  scholarshipId: string;
  documents: any[];
  answers: Record<string, string>;
}): Promise<ApiApplication> {
  const r = await jsonFetch<{ ok: boolean; application: ApiApplication }>('/applications/create.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return r.application;
}

export async function apiUpdateApplicationStatus(payload: {
  id: string;
  status: ApiApplication['status'];
  note?: string;
  author?: string;
  rubric?: any;
}): Promise<ApiApplication> {
  const r = await jsonFetch<{ ok: boolean; application: ApiApplication }>('/applications/update_status.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return r.application;
}

export async function apiDisburseGrant(payload: {
  id: string;
  details: any;
}): Promise<ApiApplication> {
  const r = await jsonFetch<{ ok: boolean; application: ApiApplication }>('/applications/disburse.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return r.application;
}

export async function apiListAnnouncements(): Promise<ApiAnnouncement[]> {
  const r = await jsonFetch<{ ok: boolean; announcements: ApiAnnouncement[] }>('/announcements/list.php');
  return r.announcements;
}

export async function apiCreateAnnouncement(payload: Omit<ApiAnnouncement, 'id' | 'date'>): Promise<ApiAnnouncement> {
  const r = await jsonFetch<{ ok: boolean; announcement: ApiAnnouncement }>('/announcements/create.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return r.announcement;
}

export async function apiUpdateAnnouncement(payload: {
  id: string;
  title: string;
  content: string;
  targetAudience: string;
  category?: 'general' | 'grant-release';
  grantReleaseDate?: string | null;
}): Promise<ApiAnnouncement> {
  const r = await jsonFetch<{ ok: boolean; announcement: ApiAnnouncement }>('/announcements/update.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return r.announcement;
}

export async function apiDeleteAnnouncement(id: string): Promise<void> {
  await jsonFetch<{ ok: boolean }>('/announcements/delete.php', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

export async function apiListNotifications(): Promise<ApiNotification[]> {
  const r = await jsonFetch<{ ok: boolean; notifications: ApiNotification[] }>('/notifications/list.php');
  return r.notifications;
}

export async function apiCreateNotification(payload: Omit<ApiNotification, 'id' | 'date' | 'read'>): Promise<ApiNotification> {
  const r = await jsonFetch<{ ok: boolean; notification: ApiNotification }>('/notifications/create.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return r.notification;
}

export async function apiMarkNotificationRead(id: string): Promise<void> {
  await jsonFetch<{ ok: boolean }>('/notifications/mark_read.php', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

