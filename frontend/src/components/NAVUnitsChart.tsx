import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { scheme: 'Tech Growth', navUnits: 45000, value: 125.50 },
  { scheme: 'Healthcare', navUnits: 32000, value: 98.75 },
  { scheme: 'Financial', navUnits: 28000, value: 110.20 },
  { scheme: 'Real Estate', navUnits: 18000, value: 155.80 },
  { scheme: 'Energy', navUnits: 12000, value: 89.30 },
  { scheme: 'Infrastructure', navUnits: 9500, value: 135.60 },
];

const NAVUnitsChart = () => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="scheme" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            angle={-45}
            textAnchor="end"
            height={80}
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
              `${value.toLocaleString()} units`,
              'NAV Units'
            ]}
          />
          <Bar 
            dataKey="navUnits" 
            fill="#3B82F6" 
            radius={[4, 4, 0, 0]}
            name="navUnits"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NAVUnitsChart;
