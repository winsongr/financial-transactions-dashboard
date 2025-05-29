import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Technology Growth Fund', value: 450, color: '#3B82F6' },
  { name: 'Healthcare Investment', value: 320, color: '#10B981' },
  { name: 'Financial Services', value: 280, color: '#F59E0B' },
  { name: 'Real Estate Portfolio', value: 180, color: '#EF4444' },
  { name: 'Energy Sector Fund', value: 120, color: '#8B5CF6' },
  { name: 'Infrastructure Development', value: 95, color: '#06B6D4' },
];

const UsersBySchemeChart = () => {
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
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} users`, 'Users']}
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
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

export default UsersBySchemeChart;
