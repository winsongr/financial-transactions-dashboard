import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', revenue: 4200, users: 240 },
  { month: 'Feb', revenue: 3800, users: 220 },
  { month: 'Mar', revenue: 5100, users: 290 },
  { month: 'Apr', revenue: 4600, users: 260 },
  { month: 'May', revenue: 5800, users: 320 },
  { month: 'Jun', revenue: 6200, users: 350 },
];

const DashboardBarChart = () => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value, name) => [
              name === 'revenue' ? `$${value}` : value,
              name === 'revenue' ? 'Revenue' : 'New Users'
            ]}
          />
          <Bar 
            dataKey="revenue" 
            fill="#3B82F6" 
            radius={[4, 4, 0, 0]}
            name="revenue"
          />
          <Bar 
            dataKey="users" 
            fill="#10B981" 
            radius={[4, 4, 0, 0]}
            name="users"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardBarChart;
