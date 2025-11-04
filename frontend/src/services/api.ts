import axios from 'axios';
import { Email } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;
const USE_MOCK = !API_BASE; // if no API base provided, use in-frontend dummy data

function generateDummyEmails(): Email[] {
  const emails: Email[] = [] as any;
  const now = Date.now();
  let id = 1;
  const categories: (Email['category'])[] = ['Interested', 'Meeting Booked', 'Not Interested', 'Spam', 'Out of Office', undefined as any];
  for (let day = 0; day < 30; day++) {
    for (let i = 0; i < 2; i++) {
      const account = i % 2 === 0 ? 'demo@acme.com' : 'sales@acme.com';
      const ts = now - day * 24 * 60 * 60 * 1000 - i * 60 * 60 * 1000;
      const category = categories[(day + i) % categories.length];
      emails.push({
        _id: String(id),
        messageId: `demo-${id}`,
        account,
        folder: 'INBOX',
        from: i % 2 === 0 ? 'founder@example.org' : 'no-reply@calendar.com',
        to: [account],
        subject: i % 2 === 0 ? `Interested in ReachInbox (day ${day})` : `Meeting update (day ${day})`,
        body: i % 2 === 0 ? 'Hi, I saw your product and would love to learn more about pricing and integrations.' : 'Your meeting has been scheduled. Please confirm your availability.',
        html: '',
        date: new Date(ts) as any,
        category,
        isRead: day % 3 === 0,
        isFlagged: day % 7 === 0,
        attachments: [],
        createdAt: new Date(ts) as any,
        updatedAt: new Date(ts) as any
      });
      id++;
    }
  }
  return emails;
}

const MOCK_EMAILS: Email[] = USE_MOCK ? generateDummyEmails() : [];

export const fetchEmails = async (params?: any): Promise<Email[]> => {
  if (USE_MOCK) {
    let items = [...MOCK_EMAILS];
    if (params?.account) items = items.filter(e => e.account === params.account);
    if (params?.folder) items = items.filter(e => e.folder === params.folder);
    if (params?.category) items = items.filter(e => e.category === params.category);
    items.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    const limit = Number(params?.limit || 50);
    return items.slice(0, limit);
  }
  const response = await axios.get(`${API_BASE}/emails`, { params });
  return response.data;
};

export const searchEmails = async (query: string, params?: any): Promise<Email[]> => {
  if (USE_MOCK) {
    let items = await fetchEmails(params);
    const needle = (query || '').toLowerCase();
    return items.filter(e =>
      (e.subject || '').toLowerCase().includes(needle) ||
      (e.body || '').toLowerCase().includes(needle) ||
      (e.from || '').toLowerCase().includes(needle)
    );
  }
  const response = await axios.get(`${API_BASE}/emails/search`, { params: { q: query, ...params } });
  return response.data;
};

export const getEmailById = async (id: string): Promise<Email> => {
  if (USE_MOCK) {
    const found = MOCK_EMAILS.find(e => e._id === id);
    if (!found) throw new Error('Email not found');
    return found;
  }
  const response = await axios.get(`${API_BASE}/emails/${id}`);
  return response.data;
};

export const getSuggestedReply = async (emailId: string): Promise<{ reply: string }> => {
  if (USE_MOCK) {
    const email = await getEmailById(emailId);
    const first = email.from?.split(' ')[0] || 'there';
    return { reply: `Hi ${first},\n\nThanks for reaching out! We'd be happy to share more about ReachInbox and how it can help your team automate outreach. You can pick a convenient time here: https://cal.com/reachinbox/meeting\n\nBest regards,\nThe ReachInbox Team` };
  }
  const response = await axios.get(`${API_BASE}/emails/${emailId}/suggested-reply`);
  return response.data;
};