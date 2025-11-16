interface StatsGridProps {
  stats: {
    todaysFocus: string | null;
    recentDecisionsCount: number;
    focusCompletionRate: number;
    totalFocusEntries: number;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  const statItems = [
    { 
      label: "Today's Focus", 
      value: stats.todaysFocus || "None yet",
      color: "from-chart-5" 
    },
    { 
      label: "Active Decisions", 
      value: stats.recentDecisionsCount.toString(),
      color: "from-chart-2" 
    },
    { 
      label: "Focus Completion", 
      value: `${stats.focusCompletionRate}%`,
      color: "from-chart-3" 
    },
    { 
      label: "Total Focus Entries", 
      value: stats.totalFocusEntries.toString(),
      color: "from-chart-4" 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statItems.map((stat, i) => (
        <div key={i} className="bg-card rounded-lg p-6 border border-border">
          <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
          <p
            className={`text-3xl font-serif font-bold bg-gradient-to-r ${stat.color} to-primary bg-clip-text text-transparent`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
