import React, { useMemo } from 'react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { TooltipProps, LegendProps } from 'recharts';

// Fixed color palette (cycle if more investors than colors)
const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#06B6D4', // teal
  '#F472B6', // pink
  '#FACC15', // gold
  '#A3E635', // lime
  '#6366F1', // indigo
];

// Clean investor name: trim, collapse whitespace, remove trailing punctuation
function cleanLabel(name: string): string {
  return name.replace(/\s+/g, ' ').trim().replace(/[\s.,;:!?-]+$/, '');
}

// Props
type Investor = { inv_name: string; total_amount: number; total_units?: number };
type Scheme = { scheme: string; users: Investor[] };

interface PieChartProps {
  data: Scheme[];
  schemeName: string;
  onSliceClick?: (invName: string) => void;
}

const PieChart: React.FC<PieChartProps> = ({ data, schemeName, onSliceClick }) => {
  // Find scheme
  const scheme = data.find((s) => s.scheme === schemeName);
  const users = scheme?.users || [];

  // Clean, deduped, sorted data for chart
  const chartData = useMemo(() => {
    // Map: cleaned name -> { value, units }
    const map = new Map<string, { value: number; units: number }>();
    for (const u of users) {
      const label = cleanLabel(u.inv_name);
      const prev = map.get(label) || { value: 0, units: 0 };
      map.set(label, {
        value: prev.value + u.total_amount,
        units: prev.units + (u.total_units ?? 0),
      });
    }
    // Convert to array, sort descending
    return Array.from(map.entries())
      .map(([name, { value, units }]) => ({ name, value, units }))
      .sort((a, b) => b.value - a.value);
  }, [users]);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  // Assign colors
  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    chartData.forEach((d, i) => {
      map[d.name] = COLORS[i % COLORS.length];
    });
    return map;
  }, [chartData]);

  // Tooltip
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const { name, value, units } = payload[0].payload as { name: string; value: number; units: number };
      const percent = total ? ((value / total) * 100).toFixed(2) : '0.00';
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <div className="font-semibold text-gray-800">{name}</div>
          <div className="text-sm text-gray-600">
            Amount: <span className="font-mono">{value.toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-600">
            Units: <span className="font-mono">{units?.toLocaleString?.() ?? units}</span>
          </div>
          <div className="text-xs text-gray-500">Share: {percent}%</div>
        </div>
      );
    }
    return null;
  };

  // Legend
  const renderLegend = (props: LegendProps) => {
    const { payload } = props;
    if (!payload) return null;
    return (
      <div className="flex flex-wrap gap-4 justify-center pt-3">
        {payload.map((entry, i) => (
          <div key={entry.value as string} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: colorMap[entry.value as string] }}
            />
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (!scheme) {
    return <div className="text-gray-400 italic">No data for scheme: {schemeName}</div>;
  }
  if (!chartData.length) {
    return <div className="text-gray-400 italic">No investor data for this scheme.</div>;
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={60}
            paddingAngle={2}
            isAnimationActive={true}
            animationDuration={900}
            animationEasing="ease-out"
            onClick={(data, idx) => {
              if (onSliceClick) onSliceClick(data.name);
            }}
          >
            {chartData.map((entry, i) => (
              <Cell key={`cell-${entry.name}`} fill={colorMap[entry.name]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart; 