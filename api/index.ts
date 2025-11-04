import express from 'express';
import serverless from 'serverless-http';

// Minimal serverless API that mirrors backend endpoints using dummy data

interface EmailLike {
	_id: string;
	messageId: string;
	account: string;
	folder: string;
	from: string;
	to: string[];
	subject: string;
	body: string;
	html: string;
	date: Date;
	category?: 'Interested' | 'Meeting Booked' | 'Not Interested' | 'Spam' | 'Out of Office';
	isRead: boolean;
	isFlagged: boolean;
	attachments: Array<{ filename: string; size: number }>;
}

const accounts = [
	{ email: 'demo@acme.com', provider: 'IMAP', host: 'imap.example.com', port: 993, tls: true, isConnected: true },
	{ email: 'sales@acme.com', provider: 'IMAP', host: 'imap.example.com', port: 993, tls: true, isConnected: false }
];

function generateEmails(): EmailLike[] {
	const emails: EmailLike[] = [];
	const now = Date.now();
	let id = 1;
	const categories: (EmailLike['category'])[] = ['Interested', 'Meeting Booked', 'Not Interested', 'Spam', 'Out of Office', undefined as any];
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
				date: new Date(ts),
				category,
				isRead: day % 3 === 0,
				isFlagged: day % 7 === 0,
				attachments: []
			});
			id++;
		}
	}
	return emails;
}

const allEmails = generateEmails();

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok', timestamp: new Date(), mode: 'vercel-serverless-dummy' });
});

app.get('/api/accounts', (_req, res) => {
	res.json(accounts);
});

app.get('/api/emails', (req, res) => {
	const { account, folder, category, limit = '50' } = req.query as Record<string, string>;
	let items = [...allEmails];
	if (account) items = items.filter(e => e.account === account);
	if (folder) items = items.filter(e => e.folder === folder);
	if (category) items = items.filter(e => e.category === category);
	items.sort((a, b) => +new Date(b.date) - +new Date(a.date));
	res.json(items.slice(0, Number(limit)));
});

app.get('/api/emails/search', (req, res) => {
	const { q = '', account, folder, category } = req.query as Record<string, string>;
	let items = [...allEmails];
	if (account) items = items.filter(e => e.account === account);
	if (folder) items = items.filter(e => e.folder === folder);
	if (category) items = items.filter(e => e.category === category);
	const needle = q.toLowerCase();
	const results = items.filter(e =>
		(e.subject || '').toLowerCase().includes(needle) ||
		(e.body || '').toLowerCase().includes(needle) ||
		(e.from || '').toLowerCase().includes(needle)
	);
	res.json(results);
});

app.get('/api/emails/:id', (req, res) => {
	const found = allEmails.find(e => e._id === req.params.id);
	if (!found) return res.status(404).json({ error: 'Email not found' });
	res.json(found);
});

app.get('/api/emails/:id/suggested-reply', (req, res) => {
	const found = allEmails.find(e => e._id === req.params.id);
	if (!found) return res.status(404).json({ error: 'Email not found' });
	const reply = `Hi ${found.from?.split(' ')[0] || 'there'},\n\nThanks for reaching out! We'd be happy to share more about ReachInbox and how it can help your team automate outreach. You can pick a convenient time here: https://cal.com/reachinbox/meeting\n\nBest regards,\nThe ReachInbox Team`;
	res.json({ reply });
});

export default serverless(app);


