import { Card, CardContent } from '../components/ui/card.tsx';

interface SummaryCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, change, isPositive, icon }) => {
  return (
    <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                {title}
              </p>
              <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                {icon}
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {value}
              </p>
              
            </div>
          </div>
        </div>
        
        {/* Progress bar indicator */}
        <div className="mt-4 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              isPositive ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'
            }`}
            style={{ width: `${Math.abs(parseFloat(change))}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
