type LogEntry = {
  id: string;
  action: string;
  result: string;
  created_at: string;
};

export default function LogsPanel({
  logs,
}: {
  logs: LogEntry[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-900">Logs</h2>

      <div className="mt-4 space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="border border-gray-200 rounded-xl p-3">
            <div className="font-semibold text-gray-900">{log.action}</div>
            <div className="text-sm text-gray-600 mt-1">{log.result}</div>
            <div className="text-xs text-gray-400 mt-2">
              {new Date(log.created_at).toLocaleString()}
            </div>
          </div>
        ))}

        {!logs.length && <p className="text-sm text-gray-500">No logs yet</p>}
      </div>
    </div>
  );
}
