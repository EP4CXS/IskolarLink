import React, { useMemo, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Button } from '../../components/ui';
import { ScholarshipCard, ScholarshipModal } from '../../components/scholarships';
import { Scholarship } from '../../types';

export function Scholarships() {
  const { scholarships, applications } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScholarship, setSelectedScholarship] =
    useState<Scholarship | null>(null);

  const activeScholarships = useMemo(
    () =>
      scholarships
        .filter((s) => s.status === 'Active')
        .sort(
          (a, b) =>
            new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
        ),
    [scholarships]
  );

  const filteredScholarships = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return activeScholarships;
    return activeScholarships.filter(
      (s) =>
        s.title.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term)
    );
  }, [activeScholarships, searchTerm]);

  const myApplications = applications.filter((a) => a.studentId === user?.id);
  const hasApplied = selectedScholarship
    ? myApplications.some((a) => a.scholarshipId === selectedScholarship.id)
    : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Available Scholarships
          </h1>
          <p className="text-slate-600 mt-1">
            Programs currently open for application ({activeScholarships.length}{' '}
            {activeScholarships.length === 1 ? 'program' : 'programs'}).
          </p>
        </div>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search scholarships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" /> Filters
        </Button>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredScholarships.map((scholarship) => {
          const applied = myApplications.some(
            (a) => a.scholarshipId === scholarship.id
          );

          return (
            <ScholarshipCard
              key={scholarship.id}
              scholarship={scholarship}
              hasApplied={applied}
              onClick={() => setSelectedScholarship(scholarship)}
            />
          );
        })}

        {filteredScholarships.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            {activeScholarships.length === 0
              ? 'No scholarship programs are open right now. Check back later or contact the scholarship office.'
              : 'No scholarships match your search.'}
          </div>
        )}
      </div>

      <ScholarshipModal
        scholarship={selectedScholarship}
        isOpen={selectedScholarship !== null}
        onClose={() => setSelectedScholarship(null)}
        hasApplied={hasApplied}
      />
    </div>
  );
}
