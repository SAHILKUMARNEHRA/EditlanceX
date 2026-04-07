import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Briefcase, CheckCircle, Clock, IndianRupee, Calendar, ArrowRight, User } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

const EditorDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
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
    const searchParams = new URLSearchParams(location.search);
    const jobId = searchParams.get('jobId');
    if (jobId) {
      fetchJobDetails(jobId);
    }
  }, [location.search]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      // Fetch all jobs and applied jobs in parallel
      const [allJobsData, appliedJobsData] = await Promise.all([
        api.getJobs(),
        api.getAppliedJobs(),
      ]);
      
      setAvailableJobs(allJobsData.jobs || []);
      setAppliedJobs(appliedJobsData.jobs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJobDetails = async (jobId: string) => {
    try {
      const data = await api.getJobById(jobId);
      setSelectedJob(data);
      setDetailsDialogOpen(true);
    } catch (err: any) {
      console.error('Error fetching job details:', err);
      setError(err.message || 'Failed to fetch job details');
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;

    setApplying(true);
    try {
      await api.applyJob(selectedJob.id);
      // Refresh job lists
      await fetchJobs();
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your editing career
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableJobs.length}</div>
              <p className="text-xs text-gray-500">New opportunities</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applied Jobs</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appliedJobs.length}</div>
              <p className="text-xs text-gray-500">Applications sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appliedJobs.length > 0 ? '75%' : 'N/A'}
              </div>
              <p className="text-xs text-gray-500">Based on applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Tabs */}
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="available">Available Jobs</TabsTrigger>
            <TabsTrigger value="applied">Applied Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Available Jobs</h2>
              <Link to="/editor/jobs">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {availableJobs.length === 0 ? (
              <Card className="p-8 text-center">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs available</h3>
                <p className="text-gray-500">Check back later for new opportunities</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableJobs.slice(0, 3).map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
                        <Badge variant="secondary" className="bg-rose-50 text-rose-600">
                          {job.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <span className="flex items-center text-gray-500 text-sm">
                          <User className="h-3 w-3 mr-1" />
                          {job.clientName}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-rose-500 p-0 h-auto hover:bg-transparent"
                            onClick={() => fetchJobDetails(job.id)}
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            disabled={!profileComplete}
                            className={`${!profileComplete ? 'bg-gray-300' : 'bg-rose-500 hover:bg-rose-600'} h-8 text-xs`}
                            onClick={() => {
                              setSelectedJob(job);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applied">
            <h2 className="text-xl font-semibold mb-4">Applied Jobs</h2>
            
            {appliedJobs.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-500 mb-4">Start applying to jobs to see them here</p>
                <Link to="/editor/jobs">
                  <Button className="bg-rose-500 hover:bg-rose-600">Browse Jobs</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appliedJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow border-green-200">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className="bg-green-100 text-green-700">Applied</Badge>
                          {job.status && job.status !== 'PENDING' && (
                            <Badge className={job.status === 'HIRED' ? 'bg-green-600' : 'bg-red-500'}>
                              {job.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-green-600 font-medium">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          {formatBudget(job.budget)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500 p-0 h-auto hover:bg-transparent"
                          onClick={() => fetchJobDetails(job.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Details Dialog */}
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
  );
};

export default EditorDashboard;
