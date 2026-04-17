const POST_LOG_KEY = 'resumevault_post_log_v1';

export function getPostLogs() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(POST_LOG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePostLogs(logs) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(POST_LOG_KEY, JSON.stringify(logs));
}

export function addPostLog(entry) {
  const logs = getPostLogs();
  const nextEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: 'generated',
    ...entry,
  };
  const nextLogs = [nextEntry, ...logs];
  savePostLogs(nextLogs);
  return nextLogs;
}

export function clearPostLogs() {
  savePostLogs([]);
}

export function toCsv(logs) {
  const headers = [
    'createdAt',
    'platform',
    'category',
    'contentType',
    'topic',
    'status',
    'website',
    'characterCount',
    'hashtagCount',
    'caption',
    'fullContent',
  ];

  const escapeCell = (value) => {
    const text = String(value ?? '').replace(/\r?\n/g, ' ');
    return `"${text.replace(/"/g, '""')}"`;
  };

  const rows = logs.map((log) => headers.map((header) => escapeCell(log[header])).join(','));
  return `\uFEFF${headers.join(',')}\n${rows.join('\n')}`;
}

export function downloadCsv(logs, filename = 'resumevault-post-log.csv') {
  if (typeof document === 'undefined') return;
  const blob = new Blob([toCsv(logs)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
