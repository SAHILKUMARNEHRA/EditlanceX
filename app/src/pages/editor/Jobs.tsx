import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, IndianRupee, Calendar, User, CheckCircle, Filter } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  videoType?: string;
  software?: string[];
  budget: number;
  deadline: string;
  clientName: string;
  status: string;
  applied?: boolean;
}

const categories = ['All', 'Wedding', 'YouTube', 'Corporate', 'Social Media', 'Documentary', 'Music Video', 'Other'];

const EditorJobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [applying, setApplying] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);

  useEffect(() => {
    fetchJobs();
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const data = await api.getEditorProfile();
      const p = data.profile;
      const isComplete = !!(p.bio && p.skills.length > 0 && p.experience && p.availability && p.portfolioLinks.length > 0);
      setProfileComplete(isComplete);
    } catch (err) {
      setProfileComplete(false);
    }
  };

  useEffect(() => {
    filterJobs();
  }, [searchQuery, selectedCategory, jobs]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const data = await api.getJobs();
      setJobs(data.jobs || []);
      setFilteredJobs(data.jobs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJobDetails = async (jobId: string) => {
    try {
      setIsFetchingDetails(true);
      const data = await api.getJobById(jobId);
      setSelectedJob(data);
      setDetailsDialogOpen(true);
    } catch (err: any) {
      console.error('Error fetching job details:', err);
      setError(err.message || 'Failed to fetch job details');
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((job) => job.category === selectedCategory);
    }

    setFilteredJobs(filtered);
  };

  const handleApply = async () => {
    if (!selectedJob) return;

    setApplying(true);
    try {
      await api.applyJob(selectedJob.id);
      // Update local state
      setJobs(jobs.map((job) => (job.id === selectedJob.id ? { ...job, applied: true } : job)));
      setDetailsDialogOpen(false);
      setSelectedJob(null);
    } catch (err: any) {
      console.error('Failed to apply for job:', err);
      setError(err.message || 'Failed to apply for job');
    } finally {
      setApplying(false);
    }
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(budget);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Incomplete Banner */}
        {!profileComplete && (
          <div className="mb-8 bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <User className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Complete your profile!</h3>
                <p className="text-sm text-amber-700">
                  You need to complete your profile before you can apply for jobs.
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
              onClick={() => navigate('/editor/profile?setup=true')}
            >
              Complete Profile
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
          <p className="mt-2 text-gray-600">Find video editing opportunities that match your skills</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
          </p>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {job.clientName}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-rose-50 text-rose-600">
                      {job.category}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{job.description}</p>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center text-gray-600">
                      <IndianRupee className="h-4 w-4 mr-1 text-green-600" />
                      <span className="font-medium">{formatBudget(job.budget)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                      <span>{formatDate(job.deadline)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => fetchJobDetails(job.id)}
                      className="flex-1"
                    >
                      {isFetchingDetails && selectedJob?.id === job.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'View Details'
                      )}
                    </Button>
                    {!job.applied && (
                      <Button
                        onClick={() => {
                          setSelectedJob(job);
                          setDetailsDialogOpen(true);
                        }}
                        disabled={!profileComplete}
                        className={`flex-1 ${!profileComplete ? 'bg-gray-300' : 'bg-rose-500 hover:bg-rose-600'}`}
                      >
                        Apply Now
                      </Button>
                    )}
                    {job.applied && (
                      <Button
                        disabled
                        className="flex-1 bg-green-500 hover:bg-green-500 cursor-default"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Applied
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {selectedJob?.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-rose-50 text-rose-600">
                  {selectedJob?.category}
                </Badge>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500 flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  {selectedJob?.clientName}
                </span>
              </DialogDescription>
            </DialogHeader>

            {selectedJob && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl">
                  <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Budget</p>
                  <p className="text-lg font-bold text-green-600 flex items-center">
                    <IndianRupee className="h-4 w-4 mr-0.5" />
                    {formatBudget(selectedJob.budget)}
                  </p>
                </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Deadline</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1.5 text-blue-500" />
                      {formatDate(selectedJob.deadline)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Video Type</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedJob.videoType || 'Not specified'}
                    </p>
                  </div>
                </div>

                {selectedJob.software && selectedJob.software.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900">Required Software</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.software.map((sw, i) => (
                        <Badge key={i} variant="outline" className="bg-white border-gray-200 text-gray-700">
                          {sw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900">Job Description</h4>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-white border rounded-lg p-4">
                    {selectedJob.description}
                  </div>
                </div>

                {/* Info Note */}
                <div className="text-xs text-gray-500 bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <p>
                    By clicking "Confirm Application", your editor profile (including your bio, experience, 
                    and portfolio links) will be shared with the client for review.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDetailsDialogOpen(false)} className="flex-1">
                Close
              </Button>
              {selectedJob && !selectedJob.applied && (
                <Button
                  onClick={handleApply}
                  disabled={applying || !profileComplete}
                  className={`flex-1 ${!profileComplete ? 'bg-gray-300' : 'bg-rose-500 hover:bg-rose-600'}`}
                >
                  {applying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : !profileComplete ? (
                    'Complete Profile'
                  ) : (
                    'Apply Now'
                  )}
                </Button>
              )}
              {selectedJob && selectedJob.applied && (
                <Button disabled className="flex-1 bg-green-500 hover:bg-green-500 opacity-100">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Applied
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EditorJobs;
