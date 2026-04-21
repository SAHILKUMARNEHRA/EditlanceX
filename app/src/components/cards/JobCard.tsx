import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, User, CheckCircle } from 'lucide-react';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    category: string;
    budget: number;
    deadline: string;
    clientName: string;
    status?: string;
    applied?: boolean;
  };
  onApply?: () => void;
  showApplyButton?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply, showApplyButton = true }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(budget);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <User className="h-3 w-3 mr-1" />
              {job.clientName}
            </p>
          </div>
          <Badge variant="secondary" className="bg-rose-50 text-rose-600 hover:bg-rose-100">
            {job.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{job.description}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-1 text-green-600" />
            <span className="font-medium">{formatBudget(job.budget)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-1 text-blue-600" />
            <span>{formatDate(job.deadline)}</span>
          </div>
        </div>
      </CardContent>
      {showApplyButton && (
        <CardFooter className="pt-0">
          <Button
            onClick={onApply}
            disabled={job.applied}
            className={`w-full ${
              job.applied
                ? 'bg-green-500 hover:bg-green-500 cursor-default'
                : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {job.applied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Applied
              </>
            ) : (
              'Apply Now'
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default JobCard;
