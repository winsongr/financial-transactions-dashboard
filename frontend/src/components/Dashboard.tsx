import { useState } from 'react';
import { Upload, Download, TrendingUp, Users, DollarSign, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Badge } from '../components/ui/badge.tsx';
import SummaryCard from './SummaryCard.tsx';
import UserWiseNAVChart from './UserWiseNAVChart.tsx';
import SchemeWiseInvestmentChart from './SchemeWiseInvestmentChart.tsx';
import UserInvestmentDetails from './UserInvestmentDetails.tsx';
import SchemeNAVAggregationChart from './SchemeNAVAggregationChart.tsx';
import { useToast } from '../hooks/use-toast.ts';
import { useQuery } from '@tanstack/react-query';

interface DashboardSummary {
  total_investors: number;
  total_schemes: number;
  total_investments: number;
  total_nav_units: number;
}

const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    const response = await fetch('http://localhost:8000/api/transactions/dashboard-summary');
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard summary');
    }
    const data = await response.json();
    if (
      typeof data.total_investors !== 'number' ||
      typeof data.total_schemes !== 'number' ||
      typeof data.total_investments !== 'number' ||
      typeof data.total_nav_units !== 'number'
    ) {
      throw new Error('Invalid dashboard summary data');
    }
    return data;
  } catch (error) {
    console.error('Dashboard summary fetch error:', error);
    throw error;
  }
};

const Dashboard = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: summary,
    isPending: isSummaryLoading,
    error: summaryError,
  } = useQuery<DashboardSummary, Error>({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardSummary,
    staleTime: 60 * 1000, // 1 minute cache for production
    retry: 2, // Retry failed requests up to 2 times
  });

  const handleUpload = () => {
    toast({
      title: "CSV Upload",
      description: "Upload functionality ready - drag and drop CSV files here.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export PDF",
      description: "Generating PDF report with current filters...",
    });
  };

  const handleFilterChange = (value: string) => {
    setIsLoading(true);
    setFilter(value);
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    NAV Dashboard
                  </h1>
                </div>
              </div>

            </div>
            
            <div className="flex items-center gap-3">
              
              
              <Button 
                variant="outline"
                onClick={handleExport}
                className="border-gray-200 hover:bg-gray-50 text-gray-700"
              >
                <Download size={16} />
                Export
              </Button>
              
              <Button 
                onClick={handleUpload}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Upload size={16} />
                Upload CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Total Investors"
            value={isSummaryLoading ? '...' : summary?.total_investors?.toLocaleString() ?? '-'}
            change=""
            isPositive={true}
            icon={<Users className="w-8 h-8 text-blue-600" />}
          />
          <SummaryCard
            title="NAV Units"
            value={isSummaryLoading ? '...' : summary?.total_nav_units?.toLocaleString() ?? '-'}
            change=""
            isPositive={true}
            icon={<TrendingUp className="w-8 h-8 text-green-600" />}
          />
          <SummaryCard
            title="Total Investment"
            value={isSummaryLoading ? '...' : summary?.total_investments?.toLocaleString() ?? '-'}
            change=""
            isPositive={true}
            icon={<DollarSign className="w-8 h-8 text-emerald-600" />}
          />
          <SummaryCard
            title="Active Schemes"
            value={isSummaryLoading ? '...' : summary?.total_schemes?.toLocaleString() ?? '-'}
            change=""
            isPositive={true}
            icon={<Building2 className="w-8 h-8 text-purple-600" />}
          />
        </div>
        {summaryError && (
          <div className="text-red-600 font-semibold">Error loading dashboard summary: {summaryError.message}</div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    User-wise NAV Purchases
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Distribution of NAV units by investor</p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-80 space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-150"></div>
                  </div>
                  <p className="text-sm text-gray-500">Loading chart data...</p>
                </div>
              ) : (
                <UserWiseNAVChart />
              )}
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                    Scheme-wise Investments
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Investment distribution across schemes</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-80 space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-emerald-600 rounded-full animate-spin animation-delay-150"></div>
                  </div>
                  <p className="text-sm text-gray-500">Loading chart data...</p>
                </div>
              ) : (
                <SchemeWiseInvestmentChart />
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Investment Details */}
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Investment Portfolio Details
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Comprehensive view of all investments</p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {isLoading ? 'Updating...' : 'Live Data'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <UserInvestmentDetails />
          </CardContent>
        </Card>

        {/* NAV Aggregation Chart */}
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Scheme Performance Overview
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Total NAV units and investment aggregation</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Real-time</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-80 space-y-4">
                <div className="grid grid-cols-6 gap-2 w-64">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-16 bg-gradient-to-t from-blue-200 to-blue-100 rounded animate-pulse"></div>
                      <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">Loading aggregation data...</p>
              </div>
            ) : (
              <SchemeNAVAggregationChart />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg"></div>
                <span className="font-semibold text-gray-700">Dashboard</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-500">Last updated: Just now</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              {isSummaryLoading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span>{summary?.total_schemes} Active Schemes</span>
                  <span>{summary?.total_investors} Investors</span>
                  <span>{summary?.total_investments} Total Investment</span>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
