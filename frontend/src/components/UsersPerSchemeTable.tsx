
import React, { useState, useMemo } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table.tsx';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination.tsx';
import { Loader } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  scheme: string;
  investmentAmount: number;
  joinDate: string;
}

interface UsersPerSchemeTableProps {
  selectedScheme: string;
  onSchemeChange: (scheme: string) => void;
  onUserSelect: (userId: string) => void;
}

const mockUsers: User[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', scheme: 'Technology Growth Fund', investmentAmount: 50000, joinDate: '2024-01-15' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', scheme: 'Healthcare Investment', investmentAmount: 25000, joinDate: '2024-02-10' },
  { id: '3', name: 'Mike Davis', email: 'mike@example.com', scheme: 'Technology Growth Fund', investmentAmount: 75000, joinDate: '2024-01-20' },
  { id: '4', name: 'Emily Wilson', email: 'emily@example.com', scheme: 'Financial Services', investmentAmount: 40000, joinDate: '2024-03-05' },
  { id: '5', name: 'David Brown', email: 'david@example.com', scheme: 'Real Estate Portfolio', investmentAmount: 100000, joinDate: '2024-02-28' },
  { id: '6', name: 'Lisa Garcia', email: 'lisa@example.com', scheme: 'Healthcare Investment', investmentAmount: 30000, joinDate: '2024-03-12' },
  { id: '7', name: 'Robert Taylor', email: 'robert@example.com', scheme: 'Energy Sector Fund', investmentAmount: 60000, joinDate: '2024-01-08' },
  { id: '8', name: 'Jennifer Lee', email: 'jennifer@example.com', scheme: 'Technology Growth Fund', investmentAmount: 45000, joinDate: '2024-02-15' },
  { id: '9', name: 'Christopher White', email: 'chris@example.com', scheme: 'Infrastructure Development', investmentAmount: 80000, joinDate: '2024-03-20' },
  { id: '10', name: 'Amanda Martinez', email: 'amanda@example.com', scheme: 'Financial Services', investmentAmount: 35000, joinDate: '2024-01-25' },
];

const schemes = [
  'all',
  'Technology Growth Fund',
  'Healthcare Investment',
  'Financial Services',
  'Real Estate Portfolio',
  'Energy Sector Fund',
  'Infrastructure Development'
];

const ITEMS_PER_PAGE = 5;

const UsersPerSchemeTable: React.FC<UsersPerSchemeTableProps> = ({
  selectedScheme,
  onSchemeChange,
  onUserSelect
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const filteredUsers = useMemo(() => {
    return selectedScheme === 'all' 
      ? mockUsers 
      : mockUsers.filter(user => user.scheme === selectedScheme);
  }, [selectedScheme]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSchemeChange = (value: string) => {
    setIsLoading(true);
    onSchemeChange(value);
    setCurrentPage(1);
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUserClick = (userId: string) => {
    onUserSelect(userId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Scheme Filter */}
      <div className="flex items-center gap-4">
        <label htmlFor="scheme-select" className="text-sm font-medium text-gray-700">
          Filter by Scheme:
        </label>
        <Select value={selectedScheme} onValueChange={handleSchemeChange}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a scheme" />
          </SelectTrigger>
          <SelectContent>
            {schemes.map((scheme) => (
              <SelectItem key={scheme} value={scheme}>
                {scheme === 'all' ? 'All Schemes' : scheme}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Scheme</TableHead>
              <TableHead>Investment</TableHead>
              <TableHead>Join Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow 
                key={user.id} 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleUserClick(user.id)}
              >
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="max-w-xs truncate">{user.scheme}</TableCell>
                <TableCell>${user.investmentAmount.toLocaleString()}</TableCell>
                <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} size={undefined}              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink 
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer" size={undefined}                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} size={undefined}              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
      </div>
    </div>
  );
};

export default UsersPerSchemeTable;
