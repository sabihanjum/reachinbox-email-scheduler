'use client';

import { EmailJob } from '@/lib/api';
// Lightweight relative time formatter to avoid date-fns type-only export issues in some TS configs
function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 30) return 'just now';
  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes < 2) return 'a minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 2) return 'an hour ago';
  if (hours < 24) return `${hours} hours ago`;
  if (days < 2) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  if (months < 2) return 'a month ago';
  if (months < 12) return `${months} months ago`;
  if (years < 2) return 'a year ago';
  return `${years} years ago`;
}

interface EmailTableProps {
  jobs: EmailJob[];
  isLoading: boolean;
  emptyMessage: string;
}

export function EmailTable({ jobs, isLoading, emptyMessage }: EmailTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 text-center">
          <p className="mb-2">📭 {emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Subject</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-900">{job.toEmail}</td>
              <td className="px-4 py-3 text-gray-600 truncate">{job.subject}</td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {formatRelative(new Date(job.sentAt || job.sendAt))}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    job.status === 'sent'
                      ? 'bg-green-100 text-green-800'
                      : job.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : job.status === 'sending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {job.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
