import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.tsx';
import { Loader } from 'lucide-react';

interface UserScheme {
  id: string;
  schemeName: string;
  units: number;
  amount: number;
  navPrice: number;
}

interface UserData {
  id: string;
  name: string;
  schemes: UserScheme[];
}

const mockUsers: UserData[] = [
  {
    id: '1',
    name: 'John Smith',
    schemes: [
      { id: 'sch1', schemeName: 'Technology Growth Fund', units: 450, amount: 56450, navPrice: 125.44 },
      { id: 'sch2', schemeName: 'Healthcare Investment', units: 320, amount: 37856, navPrice: 118.30 },
      { id: 'sch3', schemeName: 'Financial Services', units: 280, amount: 39760, navPrice: 142.00 }
    ]
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    schemes: [
      { id: 'sch4', schemeName: 'Healthcare Investment', units: 380, amount: 44936, navPrice: 118.25 },
      { id: 'sch5', schemeName: 'Real Estate Portfolio', units: 220, amount: 34320, navPrice: 156.00 },
      { id: 'sch6', schemeName: 'Energy Sector Fund', units: 150, amount: 19350, navPrice: 129.00 }
    ]
  },
  {
    id: '3',
    name: 'Michael Brown',
    schemes: [
      { id: 'sch7', schemeName: 'Technology Growth Fund', units: 520, amount: 65260, navPrice: 125.50 },
      { id: 'sch8', schemeName: 'Infrastructure Development', units: 180, amount: 24840, navPrice: 138.00 }
    ]
  }
];

const CustomTooltip = ({ scheme }: { scheme: UserScheme }) => (
  <div className="absolute z-10 bg-gray-800 text-white p-2 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
    <p className="font-semibold">{scheme.schemeName}</p>
    <p>Units: {scheme.units.toLocaleString()}</p>
    <p>Amount: ${scheme.amount.toLocaleString()}</p>
  </div>
);

const UserInvestmentDetails = () => {
  const [selectedUser, setSelectedUser] = useState<string>('1');
  const [isLoading, setIsLoading] = useState(false);

  const handleUserChange = (userId: string) => {
    setIsLoading(true);
    setSelectedUser(userId);
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  };

  const currentUser = mockUsers.find(user => user.id === selectedUser);

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-800">User Investment Details</CardTitle>
          <Select value={selectedUser} onValueChange={handleUserChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {mockUsers.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : currentUser ? (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">{currentUser.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentUser.schemes.map((scheme) => (
                <div 
                  key={scheme.id} 
                  className="relative group bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 truncate" title={scheme.schemeName}>
                      {scheme.schemeName}
                    </h4>
                    <div className="text-sm text-gray-600">
                      <p>Units: <span className="font-medium">{scheme.units.toLocaleString()}</span></p>
                      <p>Amount: <span className="font-medium">${scheme.amount.toLocaleString()}</span></p>
                      <p>NAV Price: <span className="font-medium">${scheme.navPrice.toFixed(2)}</span></p>
                    </div>
                  </div>
                  <CustomTooltip scheme={scheme} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No user selected</p>
        )}
      </CardContent>
    </Card>
  );
};

export default UserInvestmentDetails;
