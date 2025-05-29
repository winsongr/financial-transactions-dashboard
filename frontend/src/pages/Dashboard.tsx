import { Upload, Download, TrendingUp, Users, DollarSign, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import SummaryCard from '../components/charts/SummaryCard.tsx';
import SchemeNAVAggregationChart from '../components/charts/SchemeNAVAggregationChart.tsx';
import SchemeDashboard from '../components/charts/SchemeDashboard.tsx';
import { useDashboard } from '../hooks/useDashboard.ts';

const Dashboard = () => {
  const {
    summary,
    isSummaryLoading,
    summaryError,
    schemes,
    isSchemesLoading,
    schemesError,
    users,
    isUsersLoading,
    usersError,
    exportMutation,
    filter,
    setFilter,
    isLoading,
    uploading,
    fileInputRef,
    handleUploadClick,
    handleFileChange,
    lastUpdated,
    getTimeAgo,
  } = useDashboard();

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
                onClick={() => exportMutation.mutate()}
                className="border-gray-200 hover:bg-gray-50 text-gray-700"
                disabled={exportMutation.isPending}
              >
                <Download size={16} />
                {exportMutation.isPending ? 'Processing...' : 'Download'}
              </Button>
              <Button 
                onClick={handleUploadClick}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={uploading}
              >
                <Upload size={16} />
                {uploading ? 'Uploading...' : 'Upload CSV'}
              </Button>
              <input
                type="file"
                accept=".csv,text/csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
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
            value={isSummaryLoading ? '...' : summary?.total_nav_amount?.toLocaleString() ?? '-'}
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
        <SchemeDashboard
          data={schemes || []}
          mode="scheme"
          title="Scheme Distribution"
          isLoading={isSchemesLoading}
          error={schemesError?.message || null}
        />
        <SchemeDashboard
          data={users || []}
          mode="user"
          title="User Distribution"
          isLoading={isUsersLoading}
          error={usersError?.message || null}
        />
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Scheme Performance Overview
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Total NAV units and investment aggregation</p>
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
                <span className="font-semibold text-gray-700">Nav Dashboard</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-500">
                Last updated: {getTimeAgo(lastUpdated)}
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              {isSummaryLoading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span>{summary?.total_schemes} Active Schemes</span>
                  <span>{summary?.total_investors} Investors</span>
                  <span>{summary?.total_investments} Total Transactions</span>
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
