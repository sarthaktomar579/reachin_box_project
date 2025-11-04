import { IEmail } from '../models/Email';

export const dummyAccounts = [
	{
		email: 'demo@acme.com',
		provider: 'IMAP',
		host: 'imap.example.com',
		port: 993,
		tls: true,
		isConnected: true
	},
	{
		email: 'sales@acme.com',
		provider: 'IMAP',
		host: 'imap.example.com',
		port: 993,
		tls: true,
		isConnected: false
	}
];

function generateDummyEmails(): Partial<IEmail & { _id: string }>[] {
	const emails: Partial<IEmail & { _id: string }>[] = [];
	const now = Date.now();
	let idCounter = 1;

	const categories: (IEmail['category'] | undefined)[] = [
		'Interested',
		'Meeting Booked',
		'Not Interested',
		'Spam',
		'Out of Office',
		undefined
	];

	for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
		// create two emails per day across two accounts
		for (let i = 0; i < 2; i++) {
			const account = i % 2 === 0 ? 'demo@acme.com' : 'sales@acme.com';
			const ts = now - dayOffset * 24 * 60 * 60 * 1000 - i * 60 * 60 * 1000;
			const category = categories[(dayOffset + i) % categories.length];
			emails.push({
				_id: String(idCounter),
				messageId: `demo-${idCounter}`,
				account,
				folder: 'INBOX',
				from: i % 2 === 0 ? 'founder@example.org' : 'no-reply@calendar.com',
				to: [account],
				subject:
					i % 2 === 0
						? `Interested in ReachInbox (day ${dayOffset})`
						: `Meeting update (day ${dayOffset})`,
				body:
					i % 2 === 0
						? 'Hi, I saw your product and would love to learn more about pricing and integrations.'
						: 'Your meeting has been scheduled. Please confirm your availability.',
				html: '',
				date: new Date(ts),
				category,
				isRead: dayOffset % 3 === 0,
				isFlagged: dayOffset % 7 === 0,
				attachments: []
			});
			idCounter++;
		}
	}

	return emails;
}

export const dummyEmails: Partial<IEmail & { _id: string }>[] = generateDummyEmails();


