import React, { useEffect, useState, createContext, useContext } from 'react';
import {
  User,
  Scholarship,
  Application,
  Announcement,
  Notification,
  GrantDisbursement } from
'../types';
import { toast } from 'sonner';
import {
  apiDeleteAnnouncement,
  apiCreateAnnouncement,
  apiCreateApplication,
  apiCreateNotification,
  apiCreateScholarship,
  apiDeleteScholarship,
  apiDisburseGrant,
  apiListAnnouncements,
  apiListApplications,
  apiListNotifications,
  apiListScholarships,
  apiListUsers,
  apiMarkNotificationRead,
  apiUpdateApplicationStatus,
  apiUpdateAnnouncement,
  apiUpdateScholarship,
  apiUpdateUser
} from '../lib/api';
interface DataContextType {
  users: User[];
  scholarships: Scholarship[];
  applications: Application[];
  announcements: Announcement[];
  notifications: Notification[];
  // Actions
  addApplication: (
  app: Omit<Application, 'id' | 'status' | 'submissionDate' | 'timeline'>)
  => Promise<void>;
  updateApplicationStatus: (
  id: string,
  status: Application['status'],
  note?: string,
  author?: string,
  rubric?: Application['rubricScore'])
  => Promise<void>;
  addScholarship: (scholarship: Omit<Scholarship, 'id'>) => Promise<void>;
  updateScholarship: (id: string, scholarship: Partial<Scholarship>) => Promise<void>;
  deleteScholarship: (id: string, adminId?: string) => Promise<void>;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => Promise<void>;
  updateAnnouncement: (id: string, announcement: Omit<Announcement, 'id' | 'date' | 'authorId'>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  addNotification: (
  notification: Omit<Notification, 'id' | 'date' | 'read'>)
  => Promise<void>;
  updateUserProfile: (userId: string, profile: any) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => User;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  disburseGrant: (applicationId: string, details: GrantDisbursement) => Promise<void>;
}
const DataContext = createContext<DataContextType | undefined>(undefined);
export function DataProvider({ children }: {children: ReactNode;}) {
  const [users, setUsers] = useState<User[]>([]);
  const [scholarships, setScholarships] =
  useState<Scholarship[]>([]);
  const [applications, setApplications] =
  useState<Application[]>([]);
  const [announcements, setAnnouncements] =
  useState<Announcement[]>([]);
  const [notifications, setNotifications] =
  useState<Notification[]>([]);

  const hydrateAll = async (cancelledRef?: {cancelled: boolean;}) => {
    const [usersRes, scholarshipsRes, applicationsRes, announcementsRes, notificationsRes] =
    await Promise.allSettled([
      apiListUsers(),
      apiListScholarships(),
      apiListApplications(),
      apiListAnnouncements(),
      apiListNotifications()
    ]);
    if (cancelledRef?.cancelled) return;
    if (usersRes.status === 'fulfilled') setUsers(usersRes.value as any);
    if (scholarshipsRes.status === 'fulfilled') setScholarships(scholarshipsRes.value as any);
    if (applicationsRes.status === 'fulfilled') {
      const apps = applicationsRes.value as any[];
      setApplications(apps as any);
    }
    if (announcementsRes.status === 'fulfilled') setAnnouncements(announcementsRes.value as any);
    if (notificationsRes.status === 'fulfilled') setNotifications(notificationsRes.value as any);
  };

  useEffect(() => {
    const state = {
      cancelled: false
    };
    (async () => {
      try {
        await hydrateAll(state);
      } catch {
        // Keep empty state if API/database isn't ready.
      }
    })();
    return () => {
      state.cancelled = true;
    };
  }, []);
  const addApplication = async (
  appData: Omit<Application, 'id' | 'status' | 'submissionDate' | 'timeline'>) =>
  {
    const created = await apiCreateApplication({
      studentId: appData.studentId,
      scholarshipId: appData.scholarshipId,
      documents: appData.documents,
      answers: appData.answers
    });
    setApplications((prev) => [created as any, ...prev]);
    toast.success('Application submitted successfully!');
  };
  const updateApplicationStatus = async (
  id: string,
  status: Application['status'],
  note?: string,
  author?: string,
  rubric?: Application['rubricScore']) =>
  {
    const saved = await apiUpdateApplicationStatus({
      id,
      status,
      note,
      author,
      rubric
    });
    setApplications((prev) =>
    prev.map((app) => {
      if (app.id === id) {
        return saved as any;
      }
      return app;
    })
    );
    const app = saved as any;
    await addNotification({
      userId: app.studentId,
      title: 'Application Status Updated',
      message: `Your application status has been changed to ${status}.`,
      link: `/student/applications/${app.id}`
    });
    toast.success(`Application marked as ${status}`);
  };
  const addScholarship = async (scholarship: Omit<Scholarship, 'id'>) => {
    const created = await apiCreateScholarship(scholarship as any);
    setScholarships((prev) => [...prev, created as any]);
    toast.success('Scholarship created successfully');
  };
  const updateScholarship = async (id: string, updates: Partial<Scholarship>) => {
    const saved = await apiUpdateScholarship(id, updates as any);
    setScholarships((prev) =>
    prev.map((s) =>
    s.id === id ?
    saved as any :
    s
    )
    );
    if (updates.status === 'Closed') {
      setApplications((prev) =>
      prev.map((app) =>
      app.scholarshipId === id ?
      {
        ...app,
        grantDisbursement: undefined,
        grantTransactions: []
      } :
      app
      )
      );
    }
    toast.success('Scholarship updated successfully');
  };
  const deleteScholarship = async (id: string, adminId?: string) => {
    await apiDeleteScholarship(id, adminId);
    setScholarships((prev) =>
    prev.map((s) =>
    s.id === id ?
    {
      ...s,
      status: 'Closed'
    } :
    s
    )
    );
    setApplications((prev) =>
    prev.map((app) =>
    app.scholarshipId === id ?
    {
      ...app,
      grantDisbursement: undefined,
      grantTransactions: []
    } :
    app
    )
    );
    toast.success('Scholarship marked as ended');
  };
  const addAnnouncement = async (announcement: Omit<Announcement, 'id' | 'date'>) => {
    const { announcement: created, notify } = await apiCreateAnnouncement(announcement as any);
    setAnnouncements((prev) => [created as any, ...prev]);
    const notifs = await apiListNotifications();
    setNotifications(notifs);
    if (notify?.emailsSent && notify.emailsSent > 0) {
      toast.success(
        `Announcement posted. ${notify.emailsSent} email${notify.emailsSent === 1 ? '' : 's'} sent to beneficiaries.`
      );
    } else if (notify?.notifications && notify.notifications > 0) {
      toast.success('Announcement posted. Beneficiaries notified in-app.');
    } else {
      toast.success('Announcement posted');
    }
    if (notify?.emailsFailed && notify.emailsFailed > 0) {
      toast.warning(
        `${notify.emailsFailed} email${notify.emailsFailed === 1 ? '' : 's'} could not be sent. Check MAIL_* settings in .env.`
      );
    }
  };
  const updateAnnouncement = async (
  id: string,
  announcement: Omit<Announcement, 'id' | 'date' | 'authorId'>) => {
    const updated = await apiUpdateAnnouncement({
      id,
      title: announcement.title,
      content: announcement.content,
      targetAudience: announcement.targetAudience,
      category: announcement.category,
      grantReleaseDate: announcement.grantReleaseDate || null
    });
    setAnnouncements((prev) =>
    prev.map((ann) => ann.id === id ? updated as any : ann)
    );
    toast.success('Announcement updated');
  };
  const deleteAnnouncement = async (id: string) => {
    await apiDeleteAnnouncement(id);
    setAnnouncements((prev) => prev.filter((ann) => ann.id !== id));
    toast.success('Announcement deleted');
  };
  const markNotificationRead = async (id: string) => {
    await apiMarkNotificationRead(id);
    setNotifications((prev) =>
    prev.map((n) =>
    n.id === id ?
    {
      ...n,
      read: true
    } :
    n
    )
    );
  };
  const addNotification = async (
  notification: Omit<Notification, 'id' | 'date' | 'read'>) =>
  {
    const created = await apiCreateNotification(notification as any);
    setNotifications((prev) => [created as any, ...prev]);
  };
  const updateUserProfile = async (userId: string, profileUpdates: any) => {
    const current = users.find((u) => u.id === userId);
    if (!current) {
      throw new Error('User not found');
    }
    const mergedProfile = {
      ...(current.profile || {}),
      ...profileUpdates
    };
    const saved = await apiUpdateUser(userId, { profile: mergedProfile });
    setUsers((prev) => prev.map((u) => (u.id === userId ? (saved as any) : u)));
    toast.success('Profile updated successfully');
  };
  const addUser = (userData: Omit<User, 'id'>): User => {
    const newUser: User = {
      ...userData,
      id: `u${Date.now()}`
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };
  const updateUser = async (id: string, updates: Partial<User>) => {
    const payload: { name?: string; avatar?: string | null; profile?: any } = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.avatar !== undefined) payload.avatar = updates.avatar ?? null;
    if ((updates as any).profile !== undefined) payload.profile = (updates as any).profile;
    const saved = await apiUpdateUser(id, payload);
    setUsers((prev) => prev.map((u) => (u.id === id ? (saved as any) : u)));
  };
  const disburseGrant = async (applicationId: string, details: GrantDisbursement) => {
    const { application: saved, notify } = await apiDisburseGrant({
      id: applicationId,
      details
    });
    setApplications((prev) =>
    prev.map((app) => {
      if (app.id !== applicationId) return app;
      return saved as any;
    })
    );
    const notifs = await apiListNotifications();
    setNotifications(notifs);
    if (notify?.emailSent) {
      toast.success('Grant released. Beneficiary notified by email and in-app.');
    } else if (notify?.notification) {
      toast.success('Grant released. Beneficiary notified in-app (email not sent — check MAIL_* in .env).');
    } else {
      toast.success('Grant disbursement recorded');
      toast.warning('Could not notify beneficiary. Ensure they have a signup email and MAIL_* is configured.');
    }
  };
  return (
    <DataContext.Provider
      value={{
        users,
        scholarships,
        applications,
        announcements,
        notifications,
        addApplication,
        updateApplicationStatus,
        addScholarship,
        updateScholarship,
        deleteScholarship,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        markNotificationRead,
        addNotification,
        updateUserProfile,
        addUser,
        updateUser,
        disburseGrant
      }}>
      
      {children}
    </DataContext.Provider>);

}
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};