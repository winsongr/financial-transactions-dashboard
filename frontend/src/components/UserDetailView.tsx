import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Loader, TrendingUp, TrendingDown } from 'lucide-react';

interface UserScheme {
  id: string;
  schemeName: string;
  investmentAmount: number;
  currentValue: number;
  units: number;
  navPerUnit: number;
  returnPercentage: number;
  investmentDate: string;
  status: 'active' | 'suspended' | 'matured';
}

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalInvestment: number;
  totalCurrentValue: number;
  totalReturn: number;
  schemes: UserScheme[];
}

interface UserDetailViewProps {
  userId: string;
}

const mockUserDetails: Record<string, UserDetail> = {
  '1': {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    totalInvestment: 125000,
    totalCurrentValue: 142500,
    totalReturn: 14.0,
    schemes: [
      {
        id: 'sch1',
        schemeName: 'Technology Growth Fund',
        investmentAmount: 50000,
        currentValue: 58500,
        units: 450,
        navPerUnit: 130.00,
        returnPercentage: 17.0,
        investmentDate: '2024-01-15',
        status: 'active'
      },
      {
        id: 'sch2',
        schemeName: 'Healthcare Investment',
        investmentAmount: 75000,
        currentValue: 84000,
        units: 650,
        navPerUnit: 129.23,
        returnPercentage: 12.0,
        investmentDate: '2024-02-10',
        status: 'active'
      }
    ]
  },
  '2': {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1 (555) 987-6543',
    totalInvestment: 85000,
    totalCurrentValue: 91200,
    totalReturn: 7.3,
    schemes: [
      {
        id: 'sch3',
        schemeName: 'Healthcare Investment',
        investmentAmount: 25000,
        currentValue: 26800,
        units: 220,
        navPerUnit: 121.82,
        returnPercentage: 7.2,
        investmentDate: '2024-02-10',
        status: 'active'
      },
      {
        id: 'sch4',
        schemeName: 'Financial Services',
        investmentAmount: 60000,
        currentValue: 64400,
        units: 480,
        navPerUnit: 134.17,
        returnPercentage: 7.3,
        investmentDate: '2024-01-20',
        status: 'active'
      }
    ]
  }
};

const UserDetailView: React.FC<UserDetailViewProps> = ({ userId }) => {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetail = () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const detail = mockUserDetails[userId] || mockUserDetails['1']; // Fallback to first user
        setUserDetail(detail);
        setIsLoading(false);
      }, 800);
    };

    fetchUserDetail();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">User details not found.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'matured': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* User Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${userDetail.totalInvestment.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${userDetail.totalCurrentValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center ${
              userDetail.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {userDetail.totalReturn >= 0 ? (
                <TrendingUp className="w-5 h-5 mr-1" />
              ) : (
                <TrendingDown className="w-5 h-5 mr-1" />
              )}
              {userDetail.totalReturn >= 0 ? '+' : ''}{userDetail.totalReturn.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Schemes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userDetail.schemes.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-lg font-semibold">{userDetail.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg">{userDetail.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-lg">{userDetail.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheme Details */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Schemes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userDetail.schemes.map((scheme) => (
              <div key={scheme.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{scheme.schemeName}</h4>
                    <p className="text-sm text-gray-500">
                      Invested on {new Date(scheme.investmentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(scheme.status)}>
                    {scheme.status.charAt(0).toUpperCase() + scheme.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Investment</p>
                    <p className="font-semibold">${scheme.investmentAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Current Value</p>
                    <p className="font-semibold">${scheme.currentValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Units</p>
                    <p className="font-semibold">{scheme.units.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">NAV per Unit</p>
                    <p className="font-semibold">${scheme.navPerUnit.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Return</p>
                    <p className={`font-semibold flex items-center ${
                      scheme.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {scheme.returnPercentage >= 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {scheme.returnPercentage >= 0 ? '+' : ''}{scheme.returnPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetailView;
