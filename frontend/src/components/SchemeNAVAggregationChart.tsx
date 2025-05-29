import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TooltipProps } from 'recharts';

const data = [
  { 
    scheme: 'Technology Growth Fund', 
    totalUnits: 1068, 
    totalInvestment: 133910,
    averageNAV: 125.47
  },
  { 
    scheme: 'Healthcare Investment', 
    totalUnits: 900, 
    totalInvestment: 106792,
    averageNAV: 118.66
  },
  { 
    scheme: 'Financial Services', 
    totalUnits: 806, 
    totalInvestment: 114048,
    averageNAV: 141.50
  },
  { 
    scheme: 'Real Estate Portfolio', 
    totalUnits: 552, 
    totalInvestment: 86112,
    averageNAV: 156.00
  },
  { 
    scheme: 'Energy Sector Fund', 
    totalUnits: 445, 
    totalInvestment: 57350,
    averageNAV: 129.00
  },
  { 
    scheme: 'Infrastructure Development', 
    totalUnits: 416, 
    totalInvestment: 57408,
    averageNAV: 138.00
  }
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-sm text-gray-600">Total Units: {data.totalUnits.toLocaleString()}</p>
        <p className="text-sm text-gray-600">Total Investment: ${data.totalInvestment.toLocaleString()}</p>
        <p className="text-sm font-medium text-gray-800">Avg NAV: ${data.averageNAV.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const SchemeNAVAggregationChart = () => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="scheme" 
            tick={{ fontSize: 10 }}
            stroke="#6b7280"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: 'Total Units', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="totalUnits" 
            fill="#3B82F6" 
            radius={[4, 4, 0, 0]}
            name="totalUnits"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SchemeNAVAggregationChart;
