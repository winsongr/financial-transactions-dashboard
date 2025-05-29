import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, TooltipProps } from 'recharts';

const data = [
  { 
    name: 'Technology Growth Fund',
    userName: 'John Smith',
    amountInvested: 75000,
    navUnits: 598,
    color: '#3B82F6' 
  },
  { 
    name: 'Healthcare Investment',
    userName: 'Sarah Johnson',
    amountInvested: 62000,
    navUnits: 524,
    color: '#10B981' 
  },
  { 
    name: 'Financial Services',
    userName: 'Michael Brown',
    amountInvested: 58000,
    navUnits: 526,
    color: '#F59E0B' 
  },
  { 
    name: 'Real Estate Portfolio',
    userName: 'Emily Davis',
    amountInvested: 45000,
    navUnits: 332,
    color: '#EF4444' 
  },
  { 
    name: 'Energy Sector Fund',
    userName: 'David Wilson',
    amountInvested: 38000,
    navUnits: 295,
    color: '#8B5CF6' 
  },
  { 
    name: 'Infrastructure Development',
    userName: 'Lisa Anderson',
    amountInvested: 32000,
    navUnits: 236,
    color: '#06B6D4' 
  }
];

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{data.name}</p>
        <p className="text-sm text-gray-600">Top Investor: {data.userName}</p>
        <p className="text-sm text-gray-600">Amount Invested: ${data.amountInvested.toLocaleString()}</p>
        <p className="text-sm font-medium text-gray-800">NAV Units: {data.navUnits.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const SchemeWiseInvestmentChart = () => {
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
            dataKey="amountInvested"
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

export default SchemeWiseInvestmentChart;
