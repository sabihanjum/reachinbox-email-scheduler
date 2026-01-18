import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

export const googleAuth = async (idToken: string) => {
  const { data } = await api.post('/api/auth/google', { idToken });
  return data;
};

export const logout = async () => {
  await api.post('/api/auth/logout');
};

export interface EmailJob {
  id: string;
  toEmail: string;
  subject: string;
  body: string;
  sendAt: string;
  status: 'scheduled' | 'queued' | 'sending' | 'sent' | 'failed';
  sentAt?: string;
  error?: string;
}

export interface Sender {
  id: string;
  name: string;
  fromEmail: string;
}

export const scheduleEmails = async (payload: {
  subject: string;
  body: string;
  emails: string[];
  sendAt?: string;
  senderId?: string;
  minDelayMs?: number;
  maxEmailsPerHour?: number;
}) => {
  const { data } = await api.post('/api/email/schedule', payload);
  return data;
};

export const getScheduledEmails = async () => {
  const { data } = await api.get<EmailJob[]>('/api/email/scheduled');
  return data;
};

export const getSentEmails = async () => {
  const { data } = await api.get<EmailJob[]>('/api/email/sent');
  return data;
};

export const getSenders = async () => {
  const { data } = await api.get<Sender[]>('/api/email/senders');
  return data;
};
