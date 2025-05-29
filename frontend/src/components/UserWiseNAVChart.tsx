import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, TooltipProps } from 'recharts';

const data = [
  { 
    name: 'John Smith', 
    units: 1100, 
    navPrice: 125.50, 
    totalValue: 138050,
    color: '#3B82F6' 
  },
  { 
    name: 'Sarah Johnson', 
    units: 700, 
    navPrice: 118.25, 
    totalValue: 82775,
    color: '#10B981' 
  },
  { 
    name: 'Michael Brown', 
    units: 850, 
    navPrice: 142.75, 
    totalValue: 121338,
    color: '#F59E0B' 
  },
  { 
    name: 'Emily Davis', 
    units: 650, 
    navPrice: 135.80, 
    totalValue: 88270,
    color: '#EF4444' 
  },
  { 
    name: 'David Wilson', 
    units: 475, 
    navPrice: 128.90, 
    totalValue: 61228,
    color: '#8B5CF6' 
  },
  { 
    name: 'Lisa Anderson', 
    units: 320, 
    navPrice: 155.40, 
    totalValue: 49728,
    color: '#06B6D4' 
  }
];

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{data.name}</p>
        <p className="text-sm text-gray-600">Units: {data.units.toLocaleString()}</p>
        <p className="text-sm text-gray-600">NAV Price: ${data.navPrice.toFixed(2)}</p>
        <p className="text-sm font-medium text-gray-800">Total Value: ${data.totalValue.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const UserWiseNAVChart = () => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={5}
            dataKey="units"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-sm font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserWiseNAVChart;
