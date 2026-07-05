export interface Subscription {
  id: string;
  merchant: string;
  logo: string;
  amount: number;
  frequency: 'monthly' | 'yearly' | 'weekly';
  nextBillingDate: string;
  status: 'active' | 'paused' | 'cancelled' | 'trial';
  category: string;
  color: string;
  startDate?: string;
  lastBillingDate?: string | null;
  history: { date: string; amount: number }[];
}

export const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    merchant: 'Netflix',
    logo: '🎬',
    amount: 15.99,
    frequency: 'monthly',
    nextBillingDate: '2024-02-15',
    status: 'active',
    category: 'Entertainment',
    color: '#E50914',
    history: [
      { date: '2024-01-15', amount: 15.99 },
      { date: '2023-12-15', amount: 15.99 },
      { date: '2023-11-15', amount: 15.99 },
    ],
  },
  {
    id: '2',
    merchant: 'Spotify',
    logo: '🎵',
    amount: 9.99,
    frequency: 'monthly',
    nextBillingDate: '2024-02-10',
    status: 'active',
    category: 'Entertainment',
    color: '#1DB954',
    history: [
      { date: '2024-01-10', amount: 9.99 },
      { date: '2023-12-10', amount: 9.99 },
      { date: '2023-11-10', amount: 9.99 },
    ],
  },
  {
    id: '3',
    merchant: 'Adobe Creative Cloud',
    logo: '🎨',
    amount: 54.99,
    frequency: 'monthly',
    nextBillingDate: '2024-02-20',
    status: 'active',
    category: 'Productivity',
    color: '#FF0000',
    history: [
      { date: '2024-01-20', amount: 54.99 },
      { date: '2023-12-20', amount: 54.99 },
      { date: '2023-11-20', amount: 52.99 },
    ],
  },
  {
    id: '4',
    merchant: 'GitHub Pro',
    logo: '💻',
    amount: 4.00,
    frequency: 'monthly',
    nextBillingDate: '2024-02-01',
    status: 'active',
    category: 'Developer Tools',
    color: '#6e5494',
    history: [
      { date: '2024-01-01', amount: 4.00 },
      { date: '2023-12-01', amount: 4.00 },
    ],
  },
  {
    id: '5',
    merchant: 'ChatGPT Plus',
    logo: '🤖',
    amount: 20.00,
    frequency: 'monthly',
    nextBillingDate: '2024-02-05',
    status: 'active',
    category: 'AI Tools',
    color: '#10a37f',
    history: [
      { date: '2024-01-05', amount: 20.00 },
      { date: '2023-12-05', amount: 20.00 },
    ],
  },
  {
    id: '6',
    merchant: 'Notion',
    logo: '📝',
    amount: 8.00,
    frequency: 'monthly',
    nextBillingDate: '2024-02-12',
    status: 'active',
    category: 'Productivity',
    color: '#000000',
    history: [
      { date: '2024-01-12', amount: 8.00 },
      { date: '2023-12-12', amount: 8.00 },
    ],
  },
  {
    id: '7',
    merchant: 'Amazon Prime',
    logo: '📦',
    amount: 139.00,
    frequency: 'yearly',
    nextBillingDate: '2024-06-01',
    status: 'active',
    category: 'Shopping',
    color: '#FF9900',
    history: [
      { date: '2023-06-01', amount: 139.00 },
      { date: '2022-06-01', amount: 119.00 },
    ],
  },
  {
    id: '8',
    merchant: 'Figma',
    logo: '✏️',
    amount: 0.00,
    frequency: 'monthly',
    nextBillingDate: '2024-02-25',
    status: 'trial',
    category: 'Design',
    color: '#F24E1E',
    history: [],
  },
  {
    id: '9',
    merchant: 'Disney+',
    logo: '🏰',
    amount: 13.99,
    frequency: 'monthly',
    nextBillingDate: '2024-02-18',
    status: 'paused',
    category: 'Entertainment',
    color: '#113CCF',
    startDate: '2023-10-18',
    history: [
      { date: '2023-11-18', amount: 13.99 },
      { date: '2023-10-18', amount: 13.99 },
    ],
  },
];

export const calculateActiveSubscriptionsChange = (subscriptions: Subscription[]) => {
  const currentActiveCount = subscriptions.filter(s => s.status === 'active').length;
  
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  let lastMonthActiveCount = 0;
  
  subscriptions.forEach(sub => {
    // If it's currently active and it started before this month began, it was probably active last month
    if (sub.status === 'active' && sub.startDate) {
      const startDate = new Date(sub.startDate);
      if (startDate <= lastMonth) {
        lastMonthActiveCount++;
      }
    } else if (sub.status === 'active' && !sub.startDate) {
      // If we don't have a start date, assume it was active last month to prevent false spikes
      lastMonthActiveCount++;
    }
  });

  return currentActiveCount - lastMonthActiveCount;
};

export const calculateMonthlySpend = (subscriptions: Subscription[]) => {
  return subscriptions
    .filter((sub) => sub.status === 'active')
    .reduce((total, sub) => {
      if (sub.frequency === 'yearly') {
        return total + sub.amount / 12;
      }
      if (sub.frequency === 'weekly') {
        return total + sub.amount * 4.33;
      }
      return total + sub.amount;
    }, 0);
};

export const calculateMonthlySpendChange = (subscriptions: Subscription[]) => {
  const currentSpend = calculateMonthlySpend(subscriptions);
  
  // Try to calculate last month's spend
  let lastMonthSpend = 0;
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  subscriptions.forEach(sub => {
    // Check if we have explicit history for last month
    if (sub.history && sub.history.length > 0) {
      const lastMonthPayment = sub.history.find(h => {
        const d = new Date(h.date);
        return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
      });
      if (lastMonthPayment) {
        lastMonthSpend += lastMonthPayment.amount;
      }
    } else if (sub.status === 'active') {
      // If no history, assume active subscriptions cost the same last month
      // (This will result in 0% change unless history explicitly shows a price increase/decrease)
      if (sub.frequency === 'yearly') lastMonthSpend += sub.amount / 12;
      else if (sub.frequency === 'weekly') lastMonthSpend += sub.amount * 4.33;
      else lastMonthSpend += sub.amount;
    }
  });

  if (lastMonthSpend === 0) return 0;
  return ((currentSpend - lastMonthSpend) / lastMonthSpend) * 100;
};

export const calculateYearlySpend = (subscriptions: Subscription[]) => {
  return subscriptions
    .filter((sub) => sub.status === 'active')
    .reduce((total, sub) => {
      if (sub.frequency === 'monthly') {
        return total + sub.amount * 12;
      }
      if (sub.frequency === 'weekly') {
        return total + sub.amount * 52;
      }
      return total + sub.amount;
    }, 0);
};

export const groupByCategory = (subscriptions: Subscription[]) => {
  return subscriptions.reduce((acc, sub) => {
    if (!acc[sub.category]) {
      acc[sub.category] = [];
    }
    acc[sub.category].push(sub);
    return acc;
  }, {} as Record<string, Subscription[]>);
};
