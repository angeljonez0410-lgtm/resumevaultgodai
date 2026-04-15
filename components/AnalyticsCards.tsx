"use client";

type Analytics = {
  totalPosts: number;
  drafts: number;
  scheduled: number;
  posted: number;
  failed: number;
  totalLogs: number;
};

export default function AnalyticsCards({
  analytics,
}: {
  analytics: Analytics;
}) {
  const cards = [
    {
      label: "Total Posts",
      value: analytics.totalPosts,
      color: "bg-blue-600",
    },
    {
      label: "Drafts",
      value: analytics.drafts,
      color: "bg-gray-600",
    },
    {
      label: "Scheduled",
      value: analytics.scheduled,
      color: "bg-yellow-500",
    },
    {
      label: "Posted",
      value: analytics.posted,
      color: "bg-green-600",
    },
    {
      label: "Failed",
      value: analytics.failed,
      color: "bg-red-600",
    },
    {
      label: "Logs",
      value: analytics.totalLogs,
      color: "bg-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-2xl shadow p-5">
          <div className={`w-3 h-3 rounded-full ${card.color}`} />
          <p className="text-sm text-gray-500 mt-3">{card.label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  );
}