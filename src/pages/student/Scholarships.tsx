import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, Users, Award } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Badge } from '../../components/ui';
export function Scholarships() {
  const { scholarships, applications } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const activeScholarships = scholarships.filter((s) => s.status === 'Active');
  const filteredScholarships = activeScholarships.filter(
    (s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const myApplications = applications.filter((a) => a.studentId === user?.id);
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Available Scholarships
          </h1>
          <p className="text-slate-600 mt-1">
            Discover and apply for financial assistance programs.
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search scholarships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" />
          
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" /> Filters
        </Button>
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredScholarships.map((scholarship) => {
          const hasApplied = myApplications.some(
            (a) => a.scholarshipId === scholarship.id
          );
          return (
            <Card
              key={scholarship.id}
              className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
              
              <div className="h-2 bg-sky-600"></div>
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="info">Open</Badge>
                    {hasApplied && <Badge variant="success">Applied</Badge>}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {scholarship.title}
                </h3>
                <p className="text-sm text-slate-600 mb-6 line-clamp-3">
                  {scholarship.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Deadline:{' '}
                    <span className="font-medium text-slate-900">
                      {new Date(scholarship.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" />
                    Slots available:{' '}
                    <span className="font-medium text-slate-900">
                      {scholarship.slots}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 mt-auto">
                {hasApplied ?
                <Link to={`/student/applications`} className="block">
                    <Button variant="outline" className="w-full">
                      View Application
                    </Button>
                  </Link> :

                <Link
                  to={`/student/apply/${scholarship.id}`}
                  className="block">
                  
                    <Button className="w-full">Apply Now</Button>
                  </Link>
                }
              </div>
            </Card>);

        })}

        {filteredScholarships.length === 0 &&
        <div className="col-span-full text-center py-12 text-slate-500">
            No scholarships match your search.
          </div>
        }
      </div>
    </div>);

}