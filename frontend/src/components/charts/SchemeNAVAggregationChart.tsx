import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TooltipProps } from 'recharts';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../../hooks/use-toast.ts';
import { SchemeDistribution } from '../../lib/types.ts';
import { getSchemeDistribution } from '../../lib/api.ts';

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-sm text-gray-600">Total Units: {data.total_units?.toLocaleString?.() ?? '-'}</p>
        <p className="text-sm text-gray-600">Total Investment: {data.total_amount?.toLocaleString?.() ?? '-'}</p>
      </div>
    );
  }
  return null;
};

const SchemeNAVAggregationChart = () => {
  const { toast } = useToast();
  const { data = [], error, isLoading } = useQuery<SchemeDistribution[], Error>({
    queryKey: ['scheme-distribution'],
    queryFn: getSchemeDistribution,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch scheme distribution.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="h-80 w-full flex items-center justify-center">
        <div className="text-gray-500">Loading scheme distribution...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-80 w-full flex items-center justify-center">
        <div className="text-red-600 font-semibold">{error.message || 'Unknown error'}</div>
      </div>
    );
  }

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
            dataKey="total_units" 
            fill="#3B82F6" 
            radius={[4, 4, 0, 0]}
            name="Total Units"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SchemeNAVAggregationChart;
