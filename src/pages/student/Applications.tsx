import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Calendar } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card, StatusBadge } from '../../components/ui';
export function Applications() {
  const { applications, scholarships } = useData();
  const { user } = useAuth();
  const myApplications = applications.
  filter((a) => a.studentId === user?.id).
  sort(
    (a, b) =>
    new Date(b.submissionDate).getTime() -
    new Date(a.submissionDate).getTime()
  );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-1">
          Track the status of your scholarship applications.
        </p>
      </div>

      {myApplications.length === 0 ?
      <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No applications found
          </h3>
          <p className="text-gray-500 mb-6">
            You haven't applied to any scholarships yet.
          </p>
          <Link
          to="/student/scholarships"
          className="inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
          
            Browse Scholarships
          </Link>
        </Card> :

      <div className="grid gap-4">
          {myApplications.map((app) => {
          const scholarship = scholarships.find(
            (s) => s.id === app.scholarshipId
          );
          const isExpired = !scholarship || scholarship.status === 'Closed';
          return (
            <Card
              key={app.id}
              className="p-6 hover:shadow-md transition-shadow">
              
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {scholarship?.title || 'Scholarship (Ended)'}
                      </h3>
                      <StatusBadge status={isExpired ? 'Expired' : app.status} />
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {scholarship?.description || 'This scholarship has ended.'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied:{' '}
                        {new Date(app.submissionDate).toLocaleDateString()}
                      </span>
                      <span>ID: {app.id.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Link to={`/student/applications/${app.id}`}>
                      <button className="w-full md:w-auto px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 font-medium text-sm transition-colors flex items-center justify-center gap-2">
                        Track Status <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </Card>);

        })}
        </div>
      }
    </div>);

}