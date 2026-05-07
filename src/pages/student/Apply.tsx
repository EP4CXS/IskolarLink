import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  Upload,
  FileText,
  AlertCircle,
  X,
  CheckCircle2 } from
'lucide-react';
import { toast } from 'sonner';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Input, Textarea } from '../../components/ui';
const STEPS = ['Personal Info', 'Academic Info', 'Documents', 'Review'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const COURSE_OPTIONS = [
  'College of Law',
  'Bachelor of Secondary Education major in Science',
  'Bachelor of Secondary Education major in Filipino',
  'Bachelor of Secondary Education major in English',
  'Bachelor of Physical Education',
  'Bachelor of Elementary Education',
  'Bachelor of Early Childhood Education',
  'Batsilyer sa Sining ng Filipino',
  'Bachelor of Science in Midwifery',
  'Bachelor of Science in Mathematics',
  'Bachelor of Science in Environmental Science',
  'Bachelor of Science in Biology',
  'Bachelor of Public Administration',
  'Bachelor of Arts in Political Science',
  'Bachelor of Arts in English',
  'Bachelor of Arts in Economics',
  'Bachelor of Science in Hospitality Management',
  'Bachelor of Science in Business Administration major in Marketing Management',
  'Bachelor of Science in Business Administration major in Human Resource Management',
  'Bachelor of Science in Business Administration major in Financial Management',
  'Bachelor of Science in Computer Science',
  'Bachelor of Science in Civil Engineering'
];
const FAMILY_INCOME_RANGES = [
  '₱5,000 - ₱10,000',
  '₱20,000 - ₱30,000',
  '₱40,000 - ₱50,000',
  '₱60,000 - ₱100,000'
];
const REQUIRED_DOCS = [
{
  key: 'cor',
  label: 'Certificate of Registration (COR)',
  description: 'Official enrollment record for the current semester'
},
{
  key: 'studentId',
  label: 'Student ID',
  description: 'Photo of your valid NEMSU student ID'
},
{
  key: 'prospectus',
  label: 'Prospectus',
  description: 'Course curriculum / program prospectus'
},
{
  key: 'indigency',
  label: 'Certificate of Indigency',
  description: 'Issued by your barangay'
}] as
const;
type DocKey = (typeof REQUIRED_DOCS)[number]['key'];
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || '');
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
export function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { scholarships, addApplication } = useData();
  const { user } = useAuth();
  const scholarship = scholarships.find((s) => s.id === id);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Personal Info — manual entry
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  // Academic Info — manual entry
  const [course, setCourse] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [gpa, setGpa] = useState('');
  const [familyIncome, setFamilyIncome] = useState('');
  const [essay, setEssay] = useState('');
  // Documents — one required file per slot
  const [docs, setDocs] = useState<Record<DocKey, File | null>>({
    cor: null,
    studentId: null,
    prospectus: null,
    indigency: null
  });
  if (!scholarship || !user) return <div>Not found</div>;
  const handleNext = () =>
  setCurrentStep((p) => Math.min(p + 1, STEPS.length - 1));
  const handlePrev = () => setCurrentStep((p) => Math.max(p - 1, 0));
  const handleDocChange = (key: DocKey, file: File | null) => {
    setDocs((prev) => ({
      ...prev,
      [key]: file
    }));
  };
  const handleDocInput = (key: DocKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const isAcceptedType =
    file.type === 'application/pdf' ||
    file.type === 'image/jpeg' ||
    file.type === 'image/png' ||
    /\.(pdf|jpe?g|png)$/i.test(file.name);

    if (!isAcceptedType) {
      toast.error('Only PDF, JPG, or PNG files are allowed.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`${file.name} is too large. Max 5MB.`);
      e.target.value = '';
      return;
    }

    handleDocChange(key, file);
    // Allow selecting the same file name again later.
    e.target.value = '';
  };
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const mockDocs = await Promise.all(
        REQUIRED_DOCS.filter((d) => docs[d.key]).map(async (d, i) => {
          const file = docs[d.key]!;
          return {
            id: `doc${Date.now()}${i}`,
            name: `${d.label} — ${file.name}`,
            type: file.type,
            size: file.size,
            url: await fileToDataUrl(file)
          };
        })
      );
      await addApplication({
        studentId: user.id,
        scholarshipId: scholarship.id,
        documents: mockDocs,
        answers: {
          fullName,
          email,
          phone,
          address,
          course,
          yearLevel,
          gpa,
          familyIncome,
          essay
        }
      });
      navigate('/student/applications');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };
  // Validation per step
  const personalValid =
  fullName.trim() && email.trim() && phone.trim() && address.trim();
  const academicValid =
  course.trim() &&
  yearLevel.trim() &&
  gpa.trim() &&
  familyIncome.trim() &&
  essay.trim();
  const documentsValid = REQUIRED_DOCS.every((d) => docs[d.key]);
  const canProceed =
  currentStep === 0 && personalValid ||
  currentStep === 1 && academicValid ||
  currentStep === 2 && documentsValid;
  return (
    <div className="space-y-8 max-w-3xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Apply for Scholarship
        </h1>
        <p className="text-slate-600 mt-1">{scholarship.title}</p>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="absolute top-4 left-0 w-full h-1 bg-slate-200 rounded-full"></div>
        <div
          className="absolute top-4 left-0 h-1 bg-sky-600 rounded-full transition-all duration-300"
          style={{
            width: `${currentStep / (STEPS.length - 1) * 100}%`
          }}>
        </div>
        <div className="relative flex justify-between">
          {STEPS.map((step, idx) =>
          <div key={step} className="flex flex-col items-center gap-2">
              <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors border-2 ${idx < currentStep ? 'bg-sky-600 border-sky-600 text-white' : idx === currentStep ? 'bg-white border-sky-600 text-sky-600' : 'bg-white border-slate-300 text-slate-400'}`}>
              
                {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span
              className={`text-xs font-medium text-center ${idx <= currentStep ? 'text-slate-900' : 'text-slate-400'}`}>
              
                {step}
              </span>
            </div>
          )}
        </div>
      </div>

      <Card className="p-6 sm:p-8">
        {currentStep === 0 &&
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Personal Information
            </h2>
            <p className="text-sm text-slate-600">
              Please fill out your personal details below for this application.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
              label="Full Name *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Juan Dela Cruz"
              required />
            
              <Input
              label="Email Address *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@nemsu.edu.ph"
              required />
            
              <Input
              label="Phone Number *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+63 9XX XXX XXXX"
              required />
            
              <Input
              label="Home Address *"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Barangay, City, Province"
              required />
            
            </div>
          </div>
        }

        {currentStep === 1 &&
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Academic Information
            </h2>
            <p className="text-sm text-slate-600">
              Provide your current academic details.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course / Program *
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required>
                  <option value="">Select course/program...</option>
                  {COURSE_OPTIONS.map((courseOption) =>
                  <option key={courseOption} value={courseOption}>
                      {courseOption}
                    </option>
                  )}
                </select>
              </div>
            
              <Input
              label="Year Level *"
              value={yearLevel}
              onChange={(e) => setYearLevel(e.target.value)}
              placeholder="e.g. 3"
              required />
            
              <Input
              label="Current GPA *"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              placeholder="e.g. 1.75"
              required />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Family Income Range *
                </label>
                <select
                  value={familyIncome}
                  onChange={(e) => setFamilyIncome(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required>
                  <option value="">Select income range...</option>
                  {FAMILY_INCOME_RANGES.map((range) =>
                  <option key={range} value={range}>
                      {range}
                    </option>
                  )}
                </select>
              </div>
            
            </div>
            <div className="pt-4 border-t border-slate-100">
              <Textarea
              label="Why do you deserve this scholarship? (Essay) *"
              rows={6}
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Write your essay here..."
              required />
            
            </div>
          </div>
        }

        {currentStep === 2 &&
        <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Required Documents
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Please attach all four required documents below. Accepted
                formats: PDF, JPG, PNG (max 5MB each).
              </p>
            </div>

            <div className="space-y-4">
              {REQUIRED_DOCS.map((doc) => {
              const file = docs[doc.key];
              const inputId = `upload-${doc.key}`;
              return (
                <div
                  key={doc.key}
                  className={`border rounded-xl p-4 transition-colors ${file ? 'bg-sky-50 border-sky-200' : 'bg-white border-slate-200'}`}>
                  
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${file ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        
                          {file ?
                        <CheckCircle2 className="w-5 h-5" /> :

                        <FileText className="w-5 h-5" />
                        }
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900">
                            {doc.label} <span className="text-red-500">*</span>
                          </p>
                          <p className="text-xs text-slate-500">
                            {doc.description}
                          </p>
                          {file &&
                        <p className="text-xs text-sky-700 mt-1.5 truncate">
                              {file.name} ·{' '}
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        }
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocInput(doc.key, e)}
                        className="hidden"
                        id={inputId} />

                        <Button
                          type="button"
                          variant="outline"
                          className="cursor-pointer gap-2"
                          onClick={() => {
                          const fileInput = document.getElementById(inputId) as HTMLInputElement | null;
                          fileInput?.click();
                        }}>
                          <Upload className="w-4 h-4" />
                          {file ? 'Replace' : 'Upload'}
                        </Button>
                        {file &&
                      <button
                        type="button"
                        onClick={() => handleDocChange(doc.key, null)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        aria-label="Remove file">
                        
                            <X className="w-4 h-4" />
                          </button>
                      }
                      </div>
                    </div>
                  </div>);

            })}
            </div>

            {!documentsValid &&
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-lg flex gap-3 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                <p>
                  All four documents are required to proceed to the next step.
                </p>
              </div>
          }
          </div>
        }

        {/* Step 4: Review */}
        {currentStep === 3 &&
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Review Application
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Scholarship
                </h3>
                <p className="font-semibold text-slate-900">
                  {scholarship.title}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Applicant
                </h3>
                <p className="font-semibold text-slate-900">{fullName}</p>
                <p className="text-xs text-slate-600">{email}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Academic
                </h3>
                <p className="text-sm text-slate-900">
                  {course} · Year {yearLevel}
                </p>
                <p className="text-xs text-slate-600">GPA: {gpa}</p>
                <p className="text-xs text-slate-600">
                  Family Income: {familyIncome}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Contact
                </h3>
                <p className="text-sm text-slate-900">{phone}</p>
                <p className="text-xs text-slate-600 line-clamp-2">{address}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Documents Attached
                </h3>
                <ul className="space-y-1.5">
                  {REQUIRED_DOCS.map((d) =>
                <li
                  key={d.key}
                  className="flex items-center gap-2 text-sm text-slate-700">
                  
                      <CheckCircle2 className="w-4 h-4 text-sky-600" />
                      <span className="font-medium">{d.label}</span>
                      <span className="text-xs text-slate-500 truncate">
                        — {docs[d.key]?.name}
                      </span>
                    </li>
                )}
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Essay
                </h3>
                <p className="text-sm text-slate-700 line-clamp-4 whitespace-pre-wrap">
                  {essay}
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-900">
                By submitting this application, you certify that all information
                provided is true and correct. Any false information may result
                in disqualification.
              </p>
            </div>
          </div>
        }

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0 || isSubmitting}>
            
            Back
          </Button>

          {currentStep < STEPS.length - 1 ?
          <Button
            onClick={handleNext}
            className="gap-2"
            disabled={!canProceed}>
            
              Next Step <ChevronRight className="w-4 h-4" />
            </Button> :

          <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Submit Application
            </Button>
          }
        </div>
      </Card>
    </div>);

}