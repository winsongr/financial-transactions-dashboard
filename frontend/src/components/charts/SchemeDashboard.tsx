import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card.tsx';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select.tsx';
import { Skeleton } from '../ui/skeleton.tsx';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert.tsx';
import PieChart from '../ui/PieChart.tsx';


type Investor = { inv_name: string; total_amount: number; total_units?: number };
type Scheme = { scheme: string; users: Investor[] };
type UserScheme = { scheme: string; total_units: number; total_amount: number; nav_price?: number };
type User = { pan: string; inv_name: string; schemes: UserScheme[] };

type Mode = 'scheme' | 'user';

interface GenericPieDashboardProps {
  data: Scheme[] | User[];
  mode: Mode;
  title?: string;
  onSliceClick?: (name: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const COLORS = [
  '#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#F472B6','#FACC15','#A3E635','#6366F1',
];

function cleanName(name: string): string {
  return name?.replace(/\s+/g, ' ').trim() || '';
}

function userToSchemePieData(users: User[], selectedUser: string): Scheme[] {
  const user = users.find(u => u.inv_name === selectedUser);
  if (!user) return [];
  return [{
    scheme: user.inv_name,
    users: user.schemes.map(s => ({
      inv_name: s.scheme,
      total_amount: s.total_amount,
      total_units: s.total_units,
    })),
  }];
}

function schemeToPieData(schemes: Scheme[], selectedScheme: string): Scheme[] {
  return schemes.filter(s => s.scheme === selectedScheme);
}

const GenericPieDashboard: React.FC<GenericPieDashboardProps> = ({
  data,
  mode,
  title = 'Distribution',
  onSliceClick,
  isLoading = false,
  error = null,
}) => {

  const [selected, setSelected] = useState<string>('');


  const options = useMemo(() => {
    if (mode === 'scheme') {
      return (data as Scheme[]).map(s => s.scheme);
    } else {
      return (data as User[]).map(u => u.inv_name);
    }
  }, [data, mode]);


  useEffect(() => {
    if (!selected && options.length > 0) {
      setSelected(options[0]);
    }
  }, [options, selected]);


  const pieData = useMemo(() => {
    if (mode === 'scheme') {
      return schemeToPieData(data as Scheme[], selected);
    } else {
      return userToSchemePieData(data as User[], selected);
    }
  }, [data, mode, selected]);


  const legendData = useMemo(() => {
    let items: { name: string; value: number; units?: number }[] = [];
    if (mode === 'scheme') {
      const scheme = (data as Scheme[]).find(s => s.scheme === selected);
      if (scheme) {

        const map = new Map<string, { value: number; units: number }>();
        for (const u of scheme.users) {
          const label = cleanName(u.inv_name);
          const prev = map.get(label) || { value: 0, units: 0 };
          map.set(label, {
            value: prev.value + u.total_amount,
            units: prev.units + (u.total_units ?? 0),
          });
        }
        items = Array.from(map.entries())
          .map(([name, { value, units }]) => ({ name, value, units }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);
      }
    } else {
      const user = (data as User[]).find(u => u.inv_name === selected);
      if (user) {
        const map = new Map<string, { value: number; units: number }>();
        for (const s of user.schemes) {
          const label = cleanName(s.scheme);
          const prev = map.get(label) || { value: 0, units: 0 };
          map.set(label, {
            value: prev.value + s.total_amount,
            units: prev.units + (s.total_units ?? 0),
          });
        }
        items = Array.from(map.entries())
          .map(([name, { value, units }]) => ({ name, value, units }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);
      }
    }

    const colorMap: Record<string, string> = {};
    items.forEach((item, i) => {
      colorMap[item.name] = COLORS[i % COLORS.length];
    });
    return { items, colorMap };
  }, [data, mode, selected]);


  const summary = useMemo(() => {
    if (mode === 'scheme') {
      const scheme = (data as Scheme[]).find(s => s.scheme === selected);
      const totalInvested = scheme?.users.reduce((sum, u) => sum + u.total_amount, 0) || 0;
      const topInvestor = scheme?.users.slice().sort((a, b) => b.total_amount - a.total_amount)[0]?.inv_name || '-';
      return {
        total: totalInvested,
        top: topInvestor,
        count: scheme?.users.length || 0,
      };
    } else {
      const user = (data as User[]).find(u => u.inv_name === selected);
      const totalInvested = user?.schemes.reduce((sum, s) => sum + s.total_amount, 0) || 0;
      const topScheme = user?.schemes.slice().sort((a, b) => b.total_amount - a.total_amount)[0]?.scheme || '-';
      return {
        total: totalInvested,
        top: topScheme,
        count: user?.schemes.length || 0,
      };
    }
  }, [data, mode, selected]);

  return (
    <Card className="w-full mx-auto my-8">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Dropdown + Legend + Summary */}
          <div className="lg:w-1/4 w-full flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {mode === 'scheme' ? 'Select Scheme' : 'Select User'}
              </label>
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={mode === 'scheme' ? 'Choose a scheme...' : 'Choose a user...'} />
                </SelectTrigger>
                <SelectContent>
                  {options.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Summary */}
            <div className="mt-2 text-xs text-gray-700">
              <div>Total {mode === 'scheme' ? 'Investors' : 'Schemes'}: <span className="font-bold">{summary.count}</span></div>
              <div>Total Invested: <span className="font-bold">{summary.total.toLocaleString()}</span></div>
              <div>Top {mode === 'scheme' ? 'Investor' : 'Scheme'}: <span className="font-bold">{summary.top}</span></div>
            </div>
            {/* Legend */}
            {legendData.items.length > 0 && (
              <div className="mt-4">
                <div className="font-semibold text-sm mb-2">Legend</div>
                <div className="flex flex-col gap-2">
                  {legendData.items.map((u) => (
                    <div key={u.name} className="flex items-center gap-2 text-xs">
                      <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: legendData.colorMap[u.name] }} />
                      <span className="truncate max-w-[120px]">{u.name}</span>
                      <span className="ml-auto font-mono text-gray-500">{u.value.toLocaleString()}</span>
                    </div>
                  ))}
                  {legendData.items.length >= 10 && (
                    <span className="text-xs text-gray-400 mt-1">+more</span>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Right: Chart or states */}
          <div className="lg:w-3/4 w-full min-h-[400px] flex items-center justify-center">
            {isLoading ? (
              <div className="w-full h-96 flex items-center justify-center">
                <Skeleton className="w-32 h-32" />
              </div>
            ) : error ? (
              <Alert variant="destructive" className="w-full max-w-md mx-auto">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error || 'Failed to load data.'}</AlertDescription>
              </Alert>
            ) : (
              <PieChart
                data={pieData}
                schemeName={mode === 'scheme' ? selected : (pieData[0]?.scheme || '')}
                onSliceClick={onSliceClick}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GenericPieDashboard; 