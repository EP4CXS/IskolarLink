import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  Banknote,
  Activity } from
'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card, StatusBadge } from '../../components/ui';
import { ApplicationStatus } from '../../types';
import { detectProgramFromTitle } from '../../lib/programs';
interface ActivityItem {
  id: string;
  date: string;
  type: 'status' | 'grant' | 'submitted';
  title: string;
  subtitle: string;
  status?: ApplicationStatus;
  applicationId: string;
}
export function StudentDashboard() {
  const { user } = useAuth();
  const { applications, scholarships, announcements } = useData();
  if (!user) return null;
  const myApplications = applications.filter((app) => app.studentId === user.id);
  const myBeneficiaryScholarshipIds = new Set(
    myApplications.filter((a) => a.status === 'Approved').map((a) => a.scholarshipId)
  );
  const myPrograms = new Set(
    scholarships
      .filter((s) => myBeneficiaryScholarshipIds.has(s.id))
      .map((s) => detectProgramFromTitle(s.title))
      .filter(Boolean) as string[]
  );
  const visibleAnnouncements = announcements.
  filter(
    (a) =>
    a.targetAudience === 'all' ||
    myBeneficiaryScholarshipIds.has(a.targetAudience) ||
    myPrograms.has(a.targetAudience)
  ).
  sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const activeScholarships = scholarships.filter((s) => s.status === 'Active');
  const stats = {
    total: myApplications.length,
    pending: myApplications.filter(
      (a) => a.status === 'Pending' || a.status === 'Under Review'
    ).length,
    approved: myApplications.filter((a) => a.status === 'Approved').length
  };
  // Build activity feed: timeline events + grant disbursements
  const activities: ActivityItem[] = [];
  myApplications.forEach((app) => {
    const scholarship = scholarships.find((s) => s.id === app.scholarshipId);
    const title = scholarship?.title || 'Scholarship';
    app.timeline.forEach((ev) => {
      activities.push({
        id: `${app.id}-${ev.id}`,
        date: ev.date,
        type: ev.id === app.timeline[0]?.id ? 'submitted' : 'status',
        title,
        subtitle:
        ev.id === app.timeline[0]?.id ?
        'Application submitted' :
        `Status updated to ${ev.status}`,
        status: ev.status,
        applicationId: app.id
      });
    });
    const transactions =
    app.grantTransactions && app.grantTransactions.length > 0 ?
    app.grantTransactions :
    app.grantDisbursement ?
    [app.grantDisbursement] :
    [];
    transactions.forEach((tx, txIdx) => {
      activities.push({
        id: `${app.id}-grant-${txIdx}-${tx.reference}`,
        date: tx.date,
        type: 'grant',
        title,
        subtitle: `₱${tx.amount.toLocaleString()} sent via ${tx.method}`,
        applicationId: app.id
      });
    });
  });
  const recentActivities = activities.
  sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).
  slice(0, 5);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your scholarship applications.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Total Applications
            </p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-600" />
              Recent Activities
            </h2>
            <Link
              to="/student/applications"
              className="text-sm font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1">
              
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentActivities.length === 0 ?
          <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No activity yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start your journey by exploring available scholarships.
              </p>
              <Link
              to="/student/scholarships"
              className="inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
              
                Browse Scholarships
              </Link>
            </Card> :

          <Card className="divide-y divide-gray-100">
              {recentActivities.map((activity) =>
            <Link
              key={activity.id}
              to={`/student/applications/${activity.applicationId}`}
              className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors">
              
                  <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.type === 'grant' ? 'bg-sky-100 text-sky-600' : activity.type === 'submitted' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                
                    {activity.type === 'grant' ?
                <Banknote className="w-5 h-5" /> :
                activity.type === 'submitted' ?
                <FileText className="w-5 h-5" /> :

                <Clock className="w-5 h-5" />
                }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {activity.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {activity.subtitle}
                        </p>
                      </div>
                      {activity.type === 'grant' ?
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-sky-100 text-sky-800 flex-shrink-0">
                          Grant Released
                        </span> :

                  activity.status &&
                  <StatusBadge status={activity.status} />

                  }
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(activity.date).toLocaleString()}
                    </p>
                  </div>
                </Link>
            )}
            </Card>
          }
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Announcements */}
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-sky-600" />
              Announcements
            </h2>
            <div className="space-y-4">
              {visibleAnnouncements.slice(0, 2).map((ann) =>
              <div
                key={ann.id}
                className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                
                  <h4 className="font-medium text-sm text-gray-900">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {ann.content}
                  </p>
                  <span className="text-[10px] text-gray-400 mt-2 block">
                    {new Date(ann.date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" />
              Upcoming Deadlines
            </h2>
            <div className="space-y-4">
              {activeScholarships.slice(0, 3).map((s) =>
              <div key={s.id} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold">
                      {new Date(s.deadline).getDate()}
                    </span>
                    <span className="text-[10px] uppercase">
                      {new Date(s.deadline).toLocaleString('default', {
                      month: 'short'
                    })}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                      {s.title}
                    </h4>
                    <Link
                    to={`/student/scholarships`}
                    className="text-xs text-sky-600 hover:underline mt-1 inline-block">
                    
                      View Details
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>);

}