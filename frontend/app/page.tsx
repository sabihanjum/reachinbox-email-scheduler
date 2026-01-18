'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { googleAuth } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (credentialResponse: any) => {
    try {
      setError(null);
      console.log('Google credential:', credentialResponse?.credential?.slice(0, 20) + '...');
      const { user, token } = await googleAuth(credentialResponse.credential);
      login(user, token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
          ReachInbox
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Email Job Scheduler
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError('Login failed')}
          />
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sign in with your Google account to get started
        </p>
      </div>
    </div>
  );
}
