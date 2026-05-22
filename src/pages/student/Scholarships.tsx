import React, { useMemo, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Button } from '../../components/ui';
import { ScholarshipCard, ScholarshipModal } from '../../components/scholarships';
import {
  SCHOLARSHIP_PROGRAM_CONTENT,
  ScholarshipProgramContent,
  resolveActiveScholarship,
  resolveActiveScholarshipId
} from '../../data/scholarshipPrograms';

export function Scholarships() {
  const { scholarships, applications } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] =
    useState<ScholarshipProgramContent | null>(null);

  const filteredPrograms = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return SCHOLARSHIP_PROGRAM_CONTENT;
    return SCHOLARSHIP_PROGRAM_CONTENT.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.shortDescription.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const selectedScholarshipId = selectedProgram
    ? resolveActiveScholarshipId(selectedProgram.programKey, scholarships)
    : null;

  const myApplications = applications.filter((a) => a.studentId === user?.id);
  const hasApplied = selectedScholarshipId
    ? myApplications.some((a) => a.scholarshipId === selectedScholarshipId)
    : false;

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
        {filteredPrograms.map((program) => {
          const activeRecord = resolveActiveScholarship(
            program.programKey,
            scholarships
          );
          const recordId = activeRecord?.id ?? null;
          const applied = recordId
            ? myApplications.some((a) => a.scholarshipId === recordId)
            : false;

          return (
            <ScholarshipCard
              key={program.id}
              program={program}
              deadline={activeRecord?.deadline}
              slots={activeRecord?.slots}
              hasApplied={applied}
              onClick={() => setSelectedProgram(program)}
            />
          );
        })}

        {filteredPrograms.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No scholarships match your search.
          </div>
        )}
      </div>

      <ScholarshipModal
        program={selectedProgram}
        isOpen={selectedProgram !== null}
        onClose={() => setSelectedProgram(null)}
        scholarshipId={selectedScholarshipId}
        hasApplied={hasApplied}
      />
    </div>
  );
}
