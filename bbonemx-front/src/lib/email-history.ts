const STORAGE_KEY = 'bbm:email_history';
const MAX_ENTRIES = 20;

interface EmailRecord {
  email: string;
  count: number;
  lastUsed: string;
}

function readHistory(): EmailRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as EmailRecord[];
  } catch {
    return [];
  }
}

function writeHistory(history: EmailRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore storage errors
  }
}

export function addEmailsToHistory(emails: string[]): void {
  const history = readHistory();

  for (const raw of emails) {
    const email = raw.toLowerCase().trim();
    if (!email) continue;
    const existing = history.find((r) => r.email === email);
    if (existing) {
      existing.count++;
      existing.lastUsed = new Date().toISOString();
    } else {
      history.push({ email, count: 1, lastUsed: new Date().toISOString() });
    }
  }

  history.sort((a, b) => b.count - a.count || b.lastUsed.localeCompare(a.lastUsed));
  writeHistory(history.slice(0, MAX_ENTRIES));
}

export function getSuggestedEmails(input: string): string[] {
  const history = readHistory();
  const lower = input.toLowerCase().trim();
  if (!lower) return history.slice(0, 6).map((r) => r.email);
  return history
    .filter((r) => r.email.includes(lower))
    .slice(0, 8)
    .map((r) => r.email);
}
