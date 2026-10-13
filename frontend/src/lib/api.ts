const API_BASE = (
  (import.meta as any).env?.VITE_API_BASE_URL?.toString?.() || '/api'
)
  .trim()
  .replace(/\/$/, '');

function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (/^https?:\/\//i.test(API_BASE)) {
    return `${API_BASE}${normalized}`;
  }
  return `${API_BASE}${normalized}`;
}

const AUTH_TOKEN_KEY = 'iskolarlink_api_token';

export function getApiToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setApiToken(token: string | null): void {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

async function jsonFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = getApiToken();
  const res = await fetch(apiUrl(path), {
    ...init,
    method: init?.method ?? 'GET',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (res.type === 'opaqueredirect' || (res.status >= 300 && res.status < 400)) {
    throw new Error(
      'API request was redirected. Use VITE_API_BASE_URL=/api (no trailing path).'
    );
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    let msg =
      (data && (data.error || data.message)) ||
      (typeof data === 'string' ? data : null) ||
      `Request failed (${res.status})`;

    if (data?.errors && typeof data.errors === 'object') {
      const firstField = Object.values(data.errors as Record<string, string[]>)[0];
      if (Array.isArray(firstField) && firstField[0]) {
        msg = firstField[0];
      }
    }

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
  const r = await jsonFetch<{ ok: boolean; user: ApiUser; token?: string }>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }
  );
  if (r.token) {
    setApiToken(r.token);
  }
  return r.user;
}

export async function apiLogout(): Promise<void> {
  try {
    await jsonFetch<{ ok: boolean }>('/auth/logout', { method: 'POST' });
  } finally {
    setApiToken(null);
  }
}

export async function apiRegister(
  name: string,
  email: string,
  password: string
): Promise<ApiUser> {
  const r = await jsonFetch<{ ok: boolean; user: ApiUser; token?: string }>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }
  );
  if (r.token) {
    setApiToken(r.token);
  }
  return r.user;
}

export async function apiGetUser(id: string): Promise<ApiUser> {
  const r = await jsonFetch<{ ok: boolean; user: ApiUser }>(
    `/users/show?id=${encodeURIComponent(id)}`
  );
  return r.user;
}

export async function apiListUsers(): Promise<ApiUser[]> {
  const r = await jsonFetch<{ ok: boolean; users: ApiUser[] }>('/users');
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
  const r = await jsonFetch<{ ok: boolean; user: ApiUser }>('/users/update', {
    method: 'POST',
    body: JSON.stringify({
      id,
      ...updates,
    }),
  });
  return r.user;
}

export async function apiListScholarships(): Promise<ApiScholarship[]> {
  const r = await jsonFetch<{ ok: boolean; scholarships: ApiScholarship[] }>('/scholarships');
  return r.scholarships;
}

export async function apiCreateScholarship(
  scholarship: Omit<ApiScholarship, 'id'>
): Promise<ApiScholarship> {
  const r = await jsonFetch<{ ok: boolean; scholarship: ApiScholarship }>('/scholarships', {
    method: 'POST',
    body: JSON.stringify(scholarship),
  });
  return r.scholarship;
}

export async function apiUpdateScholarship(
  id: string,
  updates: Partial<Omit<ApiScholarship, 'id'>>
): Promise<ApiScholarship> {
  const r = await jsonFetch<{ ok: boolean; scholarship: ApiScholarship }>('/scholarships/update', {
    method: 'POST',
    body: JSON.stringify({ id, ...updates }),
  });
  return r.scholarship;
}

export async function apiDeleteScholarship(id: string, adminId?: string): Promise<void> {
  await jsonFetch<{ ok: boolean }>('/scholarships/delete', {
    method: 'POST',
    body: JSON.stringify({ id, adminId }),
  });
}

export async function apiListScholarshipHistory(): Promise<ApiScholarshipHistory[]> {
  const r = await jsonFetch<{ ok: boolean; history: ApiScholarshipHistory[] }>('/scholarships/history');
  return r.history;
}

export async function apiListApplications(): Promise<ApiApplication[]> {
  const r = await jsonFetch<{ ok: boolean; applications: ApiApplication[] }>('/applications');
  return r.applications;
}

export async function apiListStudentApplicationHistory(studentId: string): Promise<ApiStudentApplicationHistory[]> {
  const r = await jsonFetch<{ ok: boolean; history: ApiStudentApplicationHistory[] }>(
    `/applications/history?studentId=${encodeURIComponent(studentId)}`
  );
  return r.history;
}

export async function apiCreateApplication(payload: {
  studentId: string;
  scholarshipId: string;
  documents: any[];
  answers: Record<string, string>;
}): Promise<ApiApplication> {
  const r = await jsonFetch<{ ok: boolean; application: ApiApplication }>('/applications', {
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
  const r = await jsonFetch<{ ok: boolean; application: ApiApplication }>('/applications/status', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return r.application;
}

export async function apiListAnnouncements(): Promise<ApiAnnouncement[]> {
  const r = await jsonFetch<{ ok: boolean; announcements: ApiAnnouncement[] }>('/announcements');
  return r.announcements;
}

export type ApiNotifyStats = {
  notifications?: number;
  emailsSent?: number;
  emailsFailed?: number;
};

export async function apiCreateAnnouncement(
  payload: Omit<ApiAnnouncement, 'id' | 'date'>
): Promise<{ announcement: ApiAnnouncement; notify?: ApiNotifyStats }> {
  const r = await jsonFetch<{ ok: boolean; announcement: ApiAnnouncement; notify?: ApiNotifyStats }>(
    '/announcements',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return { announcement: r.announcement, notify: r.notify };
}

export async function apiUpdateAnnouncement(payload: {
  id: string;
  title: string;
  content: string;
  targetAudience: string;
  category?: 'general';
}): Promise<ApiAnnouncement> {
  const r = await jsonFetch<{ ok: boolean; announcement: ApiAnnouncement }>('/announcements/update', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return r.announcement;
}

export async function apiDeleteAnnouncement(id: string): Promise<void> {
  await jsonFetch<{ ok: boolean }>('/announcements/delete', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

export async function apiListNotifications(): Promise<ApiNotification[]> {
  const r = await jsonFetch<{ ok: boolean; notifications: ApiNotification[] }>('/notifications');
  return r.notifications;
}

export async function apiCreateNotification(payload: Omit<ApiNotification, 'id' | 'date' | 'read'>): Promise<ApiNotification> {
  const r = await jsonFetch<{ ok: boolean; notification: ApiNotification }>('/notifications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return r.notification;
}

export async function apiMarkNotificationRead(id: string): Promise<void> {
  await jsonFetch<{ ok: boolean }>('/notifications/mark-read', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

export type ChatGroqMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function apiChatGroq(messages: ChatGroqMessage[]): Promise<string> {
  const r = await jsonFetch<{ ok: boolean; message: string }>('/chat/groq', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  });
  return r.message;
}

