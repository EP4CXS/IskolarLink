import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  Megaphone,
  Banknote,
  ClipboardCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
  Calendar,
  TrendingUp } from
'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell } from
'recharts';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button } from '../../components/ui';
export function AdminDashboard() {
  const { applications, scholarships, users } = useData();
  const { user } = useAuth();
  const stats = {
    total: applications.length,
    pending: applications.filter(
      (a) => a.status === 'Pending' || a.status === 'Under Review'
    ).length,
    approved: applications.filter((a) => a.status === 'Approved').length,
    rejected: applications.filter((a) => a.status === 'Rejected').length
  };
  const statusData = [
  {
    name: 'Approved',
    value: stats.approved,
    color: '#0ea5e9'
  },
  {
    name: 'Pending/Review',
    value: stats.pending,
    color: '#f59e0b'
  },
  {
    name: 'Rejected',
    value: stats.rejected,
    color: '#ef4444'
  }];

  const scholarshipData = scholarships.map((s) => ({
    name: s.title.length > 18 ? s.title.substring(0, 16) + '…' : s.title,
    applicants: applications.filter((a) => a.scholarshipId === s.id).length
  }));
  // Action items
  const pendingApps = applications.
  filter((a) => a.status === 'Pending' || a.status === 'Under Review').
  sort(
    (a, b) =>
    new Date(b.submissionDate).getTime() -
    new Date(a.submissionDate).getTime()
  ).
  slice(0, 5);
  const approvedAwaitingDisbursement = applications.filter(
    (a) =>
    a.status === 'Approved' &&
    (a.grantTransactions?.length || (a.grantDisbursement ? 1 : 0)) === 0
  );
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const closingSoon = scholarships.filter((s) => {
    const d = new Date(s.deadline);
    return s.status === 'Active' && d > now && d <= sevenDaysFromNow;
  });
  const findStudent = (id: string) => users.find((u) => u.id === id);
  const findScholarship = (id: string) => scholarships.find((s) => s.id === id);
  const quickActions = [
  {
    label: 'Review Applications',
    description: `${stats.pending} awaiting review`,
    icon: ClipboardCheck,
    to: '/admin/applications',
    color: 'bg-amber-50 text-amber-600 border-amber-200'
  },
  {
    label: 'New Scholarship',
    description: 'Add CHED - TES, CHED-CUSCHO or CHED-TDP',
    icon: Plus,
    to: '/admin/scholarships',
    color: 'bg-sky-50 text-sky-600 border-sky-200'
  },
  {
    label: 'Post Announcement',
    description: 'Notify applicants',
    icon: Megaphone,
    to: '/admin/announcements',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
  },
  {
    label: 'Disburse Grants',
    description: `${approvedAwaitingDisbursement.length} pending release`,
    icon: Banknote,
    to: '/admin/grants',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  }];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="text-slate-600 mt-1">
            Here's what's happening with the scholarship program today.
          </p>
        </div>
        <p className="text-sm text-slate-500 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Applicants
            </p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Review</p>
            <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Approved</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats.approved}
            </p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Rejected</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats.rejected}
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((a) =>
          <Link
            key={a.label}
            to={a.to}
            className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-sky-400 hover:shadow-md transition-all">
            
              <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center border ${a.color} mb-4`}>
              
                <a.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-900 group-hover:text-sky-700">
                {a.label}
              </p>
              <p className="text-xs text-slate-500 mt-1">{a.description}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-sky-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Go <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Action Center: Pending review + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Applications */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Applications Needing Review
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Most recent pending submissions
              </p>
            </div>
            <Link
              to="/admin/applications"
              className="text-sm font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1">
              
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {pendingApps.length === 0 ?
          <div className="text-center py-12">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-900">
                All caught up
              </p>
              <p className="text-xs text-slate-500 mt-1">
                No pending applications need your review.
              </p>
            </div> :

          <div className="divide-y divide-slate-100">
              {pendingApps.map((app) => {
              const student = findStudent(app.studentId);
              const scholarship = findScholarship(app.scholarshipId);
              return (
                <Link
                  key={app.id}
                  to="/admin/applications"
                  className="flex items-center gap-3 py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors">
                  
                    <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {student?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {student?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {scholarship?.title || 'Unknown scholarship'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <Badge
                      variant={app.status === 'Pending' ? 'warning' : 'info'}>
                      
                        {app.status}
                      </Badge>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(app.submissionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>);

            })}
            </div>
          }
        </Card>

        {/* Alerts / Action Center */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-900">
              Action Center
            </h3>
          </div>

          <div className="space-y-4">
            {/* Awaiting disbursement */}
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <div className="flex items-start gap-3">
                <Banknote className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {approvedAwaitingDisbursement.length} grant
                    {approvedAwaitingDisbursement.length === 1 ? '' : 's'}{' '}
                    pending release
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Approved beneficiaries waiting for disbursement.
                  </p>
                  {approvedAwaitingDisbursement.length > 0 &&
                  <Link
                    to="/admin/grants"
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 mt-2">
                    
                      Disburse now <ArrowRight className="w-3 h-3" />
                    </Link>
                  }
                </div>
              </div>
            </div>

            {/* Closing soon */}
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {closingSoon.length} scholarship
                    {closingSoon.length === 1 ? '' : 's'} closing this week
                  </p>
                  {closingSoon.length > 0 ?
                  <ul className="mt-2 space-y-1">
                      {closingSoon.slice(0, 3).map((s) =>
                    <li
                      key={s.id}
                      className="text-xs text-slate-700 flex justify-between gap-2">
                      
                          <span className="truncate">{s.title}</span>
                          <span className="text-amber-700 font-medium flex-shrink-0">
                            {new Date(s.deadline).toLocaleDateString(
                          undefined,
                          {
                            month: 'short',
                            day: 'numeric'
                          }
                        )}
                          </span>
                        </li>
                    )}
                    </ul> :

                  <p className="text-xs text-slate-600 mt-0.5">
                      No upcoming deadlines in the next 7 days.
                    </p>
                  }
                </div>
              </div>
            </div>

            {/* Approval rate */}
            <div className="p-3 rounded-lg bg-sky-50 border border-sky-100">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    Approval rate
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {stats.total > 0 ?
                    `${Math.round(stats.approved / stats.total * 100)}% of all applications approved` :
                    'No applications yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Applications per Scholarship
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={scholarshipData}
                margin={{
                  top: 5,
                  right: 20,
                  bottom: 25,
                  left: 0
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb" />
                
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 12
                  }}
                  angle={-45}
                  textAnchor="end" />
                
                <YAxis
                  tick={{
                    fontSize: 12
                  }} />
                
                <Tooltip
                  cursor={{
                    fill: '#f3f4f6'
                  }} />
                
                <Bar
                  dataKey="applicants"
                  fill="#0284c7"
                  radius={[4, 4, 0, 0]} />
                
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 relative">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Application Status Distribution
          </h3>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value">
                  
                  {statusData.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={entry.color} />
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 space-y-3">
              {statusData.map((item) =>
              <div key={item.name} className="flex items-center gap-2">
                  <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: item.color
                  }}>
                </div>
                  <span className="text-sm text-slate-600">{item.name}</span>
                  <span className="text-sm font-semibold text-slate-900 ml-auto pl-4">
                    {item.value}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>);

}