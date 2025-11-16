'use client';

import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface DashboardChartsProps {
  stats: {
    weeklyActivity: Array<{
      date: string;
      focusCount: number;
      decisionCount: number;
    }>;
    monthlyCompletion: number;
  };
}

export function DashboardCharts({ stats }: DashboardChartsProps) {
  // Format date to show day names
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const focusData = stats.weeklyActivity.map(item => ({
    name: formatDate(item.date),
    value: item.focusCount
  }));

  const clarityData = [
    { name: 'Week 1', clarity: Math.round(stats.monthlyCompletion * 0.8) },
    { name: 'Week 2', clarity: Math.round(stats.monthlyCompletion * 0.9) },
    { name: 'Week 3', clarity: Math.round(stats.monthlyCompletion * 1.1) },
    { name: 'This Week', clarity: stats.monthlyCompletion },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Weekly Focus */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h4 className="text-lg font-serif font-bold text-foreground mb-6">
          Weekly Focus Sessions
        </h4>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={focusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.625rem',
                }}
              />
              <Bar 
                dataKey="value" 
                fill="var(--chart-1)" 
                radius={[8, 8, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clarity Score Trend */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h4 className="text-lg font-serif font-bold text-foreground mb-6">
          Clarity Score Trend
        </h4>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={clarityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.625rem',
                }}
              />
              <Line
                type="monotone"
                dataKey="clarity"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={{ fill: 'var(--chart-2)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
