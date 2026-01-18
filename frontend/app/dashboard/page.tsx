'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { Header } from '@/components/Header';
import { ComposeModal } from '@/components/ComposeModal';
import { EmailTable } from '@/components/EmailTable';
import { getScheduledEmails, getSentEmails } from '@/lib/api';
import { EmailJob } from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);

  const [tab, setTab] = useState<'scheduled' | 'sent'>('scheduled');
  const [composeOpen, setComposeOpen] = useState(false);
  const [scheduledJobs, setScheduledJobs] = useState<EmailJob[]>([]);
  const [sentJobs, setSentJobs] = useState<EmailJob[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [loadingSent, setLoadingSent] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (tab === 'scheduled' && !loadingScheduled) {
      refreshScheduled();
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'sent' && !loadingSent) {
      refreshSent();
    }
  }, [tab]);

  const refreshScheduled = async () => {
    setLoadingScheduled(true);
    try {
      const data = await getScheduledEmails();
      setScheduledJobs(data);
    } catch (err) {
      console.error('Failed to load scheduled emails', err);
    } finally {
      setLoadingScheduled(false);
    }
  };

  const refreshSent = async () => {
    setLoadingSent(true);
    try {
      const data = await getSentEmails();
      setSentJobs(data);
    } catch (err) {
      console.error('Failed to load sent emails', err);
    } finally {
      setLoadingSent(false);
    }
  };

  const handleComposed = () => {
    setTab('scheduled');
    refreshScheduled();
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLogout={() => {
          logout();
          router.push('/');
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Email Dashboard</h2>
          <button
            onClick={() => setComposeOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition"
          >
            + Compose New Email
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 flex">
            <button
              onClick={() => setTab('scheduled')}
              className={`flex-1 py-4 px-6 font-medium transition ${
                tab === 'scheduled'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Scheduled Emails
            </button>
            <button
              onClick={() => setTab('sent')}
              className={`flex-1 py-4 px-6 font-medium transition ${
                tab === 'sent'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sent Emails
            </button>
          </div>

          <div className="p-6">
            {tab === 'scheduled' ? (
              <EmailTable
                jobs={scheduledJobs}
                isLoading={loadingScheduled}
                emptyMessage="No scheduled emails yet"
              />
            ) : (
              <EmailTable
                jobs={sentJobs}
                isLoading={loadingSent}
                emptyMessage="No sent emails yet"
              />
            )}
          </div>
        </div>
      </div>

      <ComposeModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSuccess={handleComposed}
      />
    </div>
  );
}
