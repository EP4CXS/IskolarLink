import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileText,
  Download,
  Banknote,
  Calendar } from
'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { Card, StatusBadge } from '../../components/ui';
import { toast } from 'sonner';
import { detectProgramFromTitle } from '../../lib/programs';
const STATUS_ORDER = ['Pending', 'Under Review', 'Screened', 'Approved'];
export function ApplicationDetail() {
  const { id } = useParams();
  const { applications, scholarships, announcements } = useData();
  const application = applications.find((a) => a.id === id);
  const scholarship = scholarships.find(
    (s) => s.id === application?.scholarshipId
  );
  if (!application || !scholarship) return <div>Not found</div>;
  const timelineEvents = application.timeline.filter(
    (event) =>
    !(event.status === 'Approved' && event.note?.toLowerCase().startsWith('grant of '))
  );
  const openDocument = (url: string) => {
    const clean = (url || '').trim();
    if (!clean || clean === '#') {
      toast.error('This attachment has no available file link.');
      return;
    }
    try {
      if (clean.startsWith('data:')) {
        const [meta, dataPart = ''] = clean.split(',', 2);
        const mime = meta.match(/^data:(.*?)(;|$)/)?.[1] || 'application/octet-stream';
        const isBase64 = /;base64/i.test(meta);
        let blob: Blob;
        if (isBase64) {
          const binary = atob(dataPart);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          blob = new Blob([bytes], { type: mime });
        } else {
          blob = new Blob([decodeURIComponent(dataPart)], { type: mime });
        }
        const blobUrl = URL.createObjectURL(blob);
        const opened = window.open(blobUrl, '_blank');
        if (!opened) toast.error('Popup blocked. Please allow popups for this site.');
        return;
      }
      const opened = window.open(clean, '_blank');
      if (!opened) toast.error('Popup blocked. Please allow popups for this site.');
    } catch {
      toast.error('Failed to open this attachment.');
    }
  };
  const isRejected = application.status === 'Rejected';
  // Determine current step index for the timeline
  let currentStepIndex = STATUS_ORDER.indexOf(application.status);
  if (isRejected) {
    // Find the last non-rejected status in timeline
    const lastEvent = timelineEvents[timelineEvents.length - 2];
    currentStepIndex = lastEvent ? STATUS_ORDER.indexOf(lastEvent.status) : 0;
  }
  const transactions =
  application.grantTransactions && application.grantTransactions.length > 0 ?
  [...application.grantTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  ) :
  application.grantDisbursement ?
  [application.grantDisbursement] :
  [];
  const totalReleased = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const program = detectProgramFromTitle(scholarship.title);
  const nextGrantRelease = announcements.
  filter(
    (a) =>
    a.category === 'grant-release' &&
    !!a.grantReleaseDate &&
    (a.targetAudience === 'all' ||
    a.targetAudience === scholarship.id ||
    (!!program && a.targetAudience === program))
  ).
  map((a) => ({
    ...a,
    releaseTs: new Date(a.grantReleaseDate as string).getTime()
  })).
  filter((a) => !Number.isNaN(a.releaseTs) && a.releaseTs >= Date.now()).
  sort((a, b) => a.releaseTs - b.releaseTs)[0];
  return (
    <div className="space-y-6">
      <Link
        to="/student/applications"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-sky-600">
        
        <ArrowLeft className="w-4 h-4" /> Back to Applications
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {scholarship.title}
          </h1>
          <p className="text-gray-500 mt-1">
            Application ID: {application.id.toUpperCase()}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Column */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-8">
              Application Status Tracker
            </h2>

            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>

              <div className="space-y-8 relative">
                {timelineEvents.map((event, idx) => {
                  const isLast = idx === timelineEvents.length - 1;
                  const isRejectEvent = event.status === 'Rejected';
                  return (
                    <motion.div
                      initial={{
                        opacity: 0,
                        x: -20
                      }}
                      animate={{
                        opacity: 1,
                        x: 0
                      }}
                      transition={{
                        delay: idx * 0.1
                      }}
                      key={event.id}
                      className="flex gap-4">
                      
                      <div className="relative z-10 flex-shrink-0 bg-white py-1">
                        {isRejectEvent ?
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                            <Circle className="w-5 h-5 fill-current" />
                          </div> :

                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${isLast && !isRejected ? 'bg-sky-100 text-sky-600' : 'bg-sky-600 text-white'}`}>
                          
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        }
                      </div>

                      <div className={`flex-1 pt-1.5 ${isLast ? '' : 'pb-8'}`}>
                        <h3
                          className={`font-semibold ${isRejectEvent ? 'text-red-600' : 'text-gray-900'}`}>
                          
                          {event.status}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(event.date).toLocaleString()}
                        </p>
                        {event.note &&
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700">
                            {event.note}
                            {event.author &&
                          <span className="block mt-2 text-xs text-gray-500 font-medium">
                                — {event.author}
                              </span>
                          }
                          </div>
                        }
                      </div>
                    </motion.div>);

                })}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Submitted Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {application.documents.map((doc) =>
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-5 h-5 text-sky-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {doc.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openDocument(doc.url)}
                    className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Details Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Grant Disbursement (latest + totals) */}
          {transactions.length > 0 &&
          <Card className="p-6 border-sky-200 bg-sky-50/40">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Grant Released
                  </h3>
                  <p className="text-xs text-sky-700">
                    {transactions.length} transaction
                    {transactions.length === 1 ? '' : 's'} recorded
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-bold text-gray-900 text-base">
                    ₱{transactions[0].amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-medium text-gray-900">
                    {transactions[0].method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference</span>
                  <span className="font-mono text-xs text-gray-900">
                    {transactions[0].reference}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Released
                  </span>
                  <span className="font-medium text-gray-900">
                    {new Date(
                    transactions[0].date
                  ).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Received</span>
                  <span className="font-semibold text-gray-900">
                    ₱{totalReleased.toLocaleString()}
                  </span>
                </div>
                {transactions[0].note &&
              <div className="pt-3 mt-3 border-t border-sky-200 text-xs text-gray-700 italic">
                    "{transactions[0].note}"
                  </div>
              }
              </div>
            </Card>
          }

          {application.status === 'Approved' &&
          <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Next Grant Release
              </h3>
              <div className="space-y-3">
                <div
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {nextGrantRelease?.title || 'No schedule yet'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {nextGrantRelease ?
                          'The next release schedule has been posted by admin.' :
                          'Admin has not posted a next release schedule yet.'}
                        </p>
                      </div>
                      {nextGrantRelease?.grantReleaseDate ?
                      <span className="text-xs text-amber-700 text-right">
                          Scheduled:{' '}
                          {new Date(nextGrantRelease.grantReleaseDate).toLocaleDateString()}
                        </span> :
                      <span className="text-xs text-gray-500">
                          TBD
                        </span>
                      }
                    </div>
                    {nextGrantRelease?.content &&
                    <p className="text-xs text-gray-700 mt-2 italic">
                        "{nextGrantRelease.content}"
                      </p>
                    }
                  </div>
              </div>
            </Card>
          }

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Application Details
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  Date Submitted
                </span>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(application.submissionDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  Essay Response
                </span>
                <p className="text-sm text-gray-900 mt-1 line-clamp-4 italic">
                  "{application.answers.essay}"
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>);

}