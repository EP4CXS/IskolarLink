import React, { useState } from 'react';
import {
  Download,
  Filter,
  FileText,
  TrendingUp,
  Award,
  XCircle } from
'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line } from
'recharts';
import { useData } from '../../context/DataContext';
import { Card, Button, StatusBadge } from '../../components/ui';
import { toast } from 'sonner';
import {
  detectProgramFromTitle,
  SCHOLARSHIP_PROGRAM_CHART_LABELS
} from '../../lib/programs';
export function Reports() {
  const { applications, scholarships, users } = useData();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterScholarship, setFilterScholarship] = useState<string>('all');
  const escapeCsv = (value: unknown) => {
    const text = String(value ?? '');
    const escaped = text.replace(/"/g, '""');
    return `"${escaped}"`;
  };
  const filtered = applications.filter((a) => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (filterScholarship !== 'all' && a.scholarshipId !== filterScholarship)
    return false;
    return true;
  });
  const stats = {
    total: filtered.length,
    approved: filtered.filter((a) => a.status === 'Approved').length,
    rejected: filtered.filter((a) => a.status === 'Rejected').length,
    approvalRate: filtered.length ?
    Math.round(
      filtered.filter((a) => a.status === 'Approved').length /
      filtered.length *
      100
    ) :
    0
  };
  const applicationMatchesProgram = (
    scholarshipId: string,
    programKey: (typeof SCHOLARSHIP_PROGRAM_CHART_LABELS)[number]['key']
  ) => {
    const scholarship = scholarships.find((s) => s.id === scholarshipId);
    if (!scholarship) return false;
    return detectProgramFromTitle(scholarship.title) === programKey;
  };

  const byScholarship = SCHOLARSHIP_PROGRAM_CHART_LABELS.map(
    ({ key, abbreviation }) => {
      const programApps = filtered.filter((a) =>
        applicationMatchesProgram(a.scholarshipId, key)
      );
      return {
        name: abbreviation,
        programKey: key,
        approved: programApps.filter((a) => a.status === 'Approved').length,
        rejected: programApps.filter((a) => a.status === 'Rejected').length,
        pending: programApps.filter(
          (a) =>
            a.status === 'Pending' ||
            a.status === 'Under Review' ||
            a.status === 'Screened'
        ).length
      };
    }
  );
  // Applications over time (group by month)
  const overTime = (() => {
    const map = new Map<string, number>();
    filtered.forEach((a) => {
      const d = new Date(a.submissionDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).
    sort(([a], [b]) => a.localeCompare(b)).
    map(([month, count]) => ({
      month,
      count
    }));
  })();
  const handleExport = () => {
    const headers = [
      'Application ID',
      'Applicant Name',
      'Applicant Email',
      'Scholarship',
      'Status',
      'Beneficiary',
      'Date Submitted',
      'Course / Program',
      'Year Level',
      'GPA',
      'Family Income'
    ];
    const rows = filtered.map((a) => {
      const student = users.find((u) => u.id === a.studentId);
      const scholarship = scholarships.find((s) => s.id === a.scholarshipId);
      const answers = a.answers || {};
      const applicantName = (answers.fullName || student?.name || '').toString();
      const applicantEmail = (answers.email || student?.email || '').toString();
      const scholarshipTitle = scholarship?.title || '';
      const status = a.status;
      const beneficiary = a.status === 'Approved' ? 'Yes' : 'No';
      const dateSubmitted = new Date(a.submissionDate).toLocaleDateString();
      const course = (answers.course || student?.profile?.course || '').toString();
      const yearLevel = (answers.yearLevel || student?.profile?.yearLevel || '').toString();
      const gpa = (answers.gpa || student?.profile?.gpa || '').toString();
      const familyIncome = (answers.familyIncome || answers.income || student?.profile?.income || '').toString();
      return [
        a.id,
        applicantName,
        applicantEmail,
        scholarshipTitle,
        status,
        beneficiary,
        dateSubmitted,
        course,
        yearLevel,
        gpa,
        familyIncome
      ];
    });
    const csv = [
    headers.map(escapeCsv).join(','),
    ...rows.map((r) => r.map(escapeCsv).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    link.href = url;
    link.download = `applicant-beneficiary-report-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully', {
      description: `${filtered.length} records exported to CSV.`
    });
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Insights into scholarship application performance.
          </p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" /> Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter className="w-4 h-4" /> Filter by:
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-sky-500 outline-none">
            
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Screened">Screened</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select
            value={filterScholarship}
            onChange={(e) => setFilterScholarship(e.target.value)}
            className="h-10 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-sky-500 outline-none">
            
            <option value="all">All Scholarships</option>
            {scholarships.map((s) =>
            <option key={s.id} value={s.id}>
                {s.title}
              </option>
            )}
          </select>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Rejected</p>
            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Approval Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.approvalRate}%
            </p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-6">
            Applications Over Time
          </h3>
          <div className="h-64">
            {overTime.length === 0 ?
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No data for selected filters
              </div> :

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overTime}>
                  <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb" />
                
                  <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 12
                  }} />
                
                  <YAxis
                  tick={{
                    fontSize: 12
                  }} />
                
                  <Tooltip />
                  <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{
                    r: 4
                  }} />
                
                </LineChart>
              </ResponsiveContainer>
            }
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-6">
            Outcomes per Scholarship
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byScholarship}
                margin={{
                  top: 5,
                  right: 10,
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
                  interval={0}
                />
                <YAxis
                  tick={{
                    fontSize: 12
                  }}
                  allowDecimals={false}
                />
                <Tooltip
                  labelFormatter={(label) => label}
                  formatter={(value: number, key: string) => {
                    const labels: Record<string, string> = {
                      approved: 'Approved',
                      pending: 'Pending',
                      rejected: 'Rejected'
                    };
                    return [value, labels[key] ?? key];
                  }}
                />
                <Bar dataKey="approved" stackId="a" fill="#0ea5e9" />
                <Bar dataKey="pending" stackId="a" fill="#f59e0b" />
                <Bar dataKey="rejected" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-gray-600 justify-center">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500"></span>{' '}
              Approved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>{' '}
              Pending
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span>{' '}
              Rejected
            </span>
          </div>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Application Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Applicant</th>
                <th className="px-6 py-3 font-medium">Scholarship</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ?
              <tr>
                  <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-gray-500">
                  
                    No applications match the current filters.
                  </td>
                </tr> :

              filtered.map((a) => {
                const student = users.find((u) => u.id === a.studentId);
                const scholarship = scholarships.find(
                  (s) => s.id === a.scholarshipId
                );
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {student?.name || '—'}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {scholarship?.title || '—'}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {new Date(a.submissionDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-6 py-3 text-gray-900 font-medium">
                        {a.rubricScore ? `${a.rubricScore.total}/40` : '—'}
                      </td>
                    </tr>);

              })
              }
            </tbody>
          </table>
        </div>
      </Card>
    </div>);

}