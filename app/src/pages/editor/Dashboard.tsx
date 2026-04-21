import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Briefcase, CheckCircle, Clock, IndianRupee, Calendar, ArrowRight, User, PartyPopper, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  applicationStatus?: string;
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
  const [hiringAlert, setHiringAlert] = useState<{ type: 'HIRED' | 'NOT_HIRED', jobTitle: string } | null>(null);

  useEffect(() => {
    fetchJobs();
    checkProfile();
  }, []);

  useEffect(() => {
    // Check for recent status changes in applied jobs
    const hiredJob = appliedJobs.find(job => job.status === 'HIRED');
    const rejectedJob = appliedJobs.find(job => job.status === 'NOT_HIRED');
    
    if (hiredJob) {
      setHiringAlert({ type: 'HIRED', jobTitle: hiredJob.title });
    } else if (rejectedJob) {
      setHiringAlert({ type: 'NOT_HIRED', jobTitle: rejectedJob.title });
    }
  }, [appliedJobs]);

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
      notation: 'compact',
      compactDisplay: 'short'
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
    <div className="min-h-screen bg-gray-50 py-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          {/* Notifications */}
          {hiringAlert && (
          <Alert className={`mb-6 border-2 relative overflow-hidden ${hiringAlert.type === 'HIRED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            {hiringAlert.type === 'HIRED' && (
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                <PartyPopper className="h-32 w-32 -mt-4 -mr-4 text-green-600" />
              </div>
            )}
            <div className="relative z-10 flex items-start gap-3">
              {hiringAlert.type === 'HIRED' ? (
                <PartyPopper className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div>
                <AlertTitle className={`font-bold ${hiringAlert.type === 'HIRED' ? 'text-green-800' : 'text-red-800'}`}>
                  {hiringAlert.type === 'HIRED' ? 'Congratulations!' : 'Application Update'}
                </AlertTitle>
                <AlertDescription className={hiringAlert.type === 'HIRED' ? 'text-green-700' : 'text-red-700'}>
                  {hiringAlert.type === 'HIRED' 
                    ? `You have been hired for "${hiringAlert.jobTitle}"! The client will contact you soon.`
                    : `The application for "${hiringAlert.jobTitle}" was not successful this time. Keep applying!`}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-4 h-auto p-0 underline hover:bg-transparent" 
                    onClick={() => setHiringAlert(null)}
                  >
                    Dismiss
                  </Button>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

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

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden mb-8 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
            <div className="absolute -bottom-8 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">{user?.name?.split(' ')[0]}!</span>
              </h1>
              <p className="text-gray-600 text-lg">
                Here's what's happening with your editing career today.
              </p>
            </div>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <Card className="hover:shadow-md transition-shadow">
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
                {appliedJobs.length > 0 ? `${Math.round((appliedJobs.filter(j => j.status === 'HIRED').length / appliedJobs.length) * 100)}%` : 'N/A'}
              </div>
              <p className="text-xs text-gray-500">Based on applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Tabs */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
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
                        <div className="flex gap-2 items-center">
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
                            disabled={!profileComplete || (job.applied && job.applicationStatus !== 'NOT_HIRED')}
                            className={`${!profileComplete || (job.applied && job.applicationStatus !== 'NOT_HIRED') ? 'bg-gray-300' : 'bg-rose-500 hover:bg-rose-600'} h-8 text-xs`}
                            onClick={() => {
                              setSelectedJob(job);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            {job.applied ? (
                              job.applicationStatus === 'HIRED' ? 'Hired' :
                              job.applicationStatus === 'NOT_HIRED' ? 'Apply Again' : 'Pending'
                            ) : 'Apply'}
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
                          <Button
                            size="sm"
                            disabled={job.status !== 'NOT_HIRED'}
                            className={`${job.status !== 'NOT_HIRED' ? 'bg-gray-300' : 'bg-rose-500 hover:bg-rose-600'} h-6 text-xs px-2`}
                          >
                            {job.status === 'HIRED' ? 'Hired' :
                             job.status === 'NOT_HIRED' ? 'Declined' : 'Pending'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>
                      <div className="flex items-center justify-between text-sm gap-2">
                        <span className="flex items-center text-green-600 font-medium min-w-0">
                          <span className="truncate" title={job.budget.toString()}>
                            {formatBudget(job.budget)}
                          </span>
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500 p-0 h-auto hover:bg-transparent shrink-0"
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
                  <span className="truncate" title={selectedJob?.budget?.toString()}>
                    {formatBudget(selectedJob.budget)}
                  </span>
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
            {selectedJob && (
              <Button
                onClick={handleApply}
                disabled={applying || !profileComplete || (selectedJob.applied && selectedJob.applicationStatus !== 'NOT_HIRED')}
                className={`flex-1 ${!profileComplete || (selectedJob.applied && selectedJob.applicationStatus !== 'NOT_HIRED') ? 'bg-gray-300' : 'bg-rose-500 hover:bg-rose-600'} ${selectedJob.applied && selectedJob.applicationStatus === 'HIRED' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
              >
                {applying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : !profileComplete ? (
                  'Complete Profile'
                ) : selectedJob.applied ? (
                  selectedJob.applicationStatus === 'HIRED' ? (
                    <><CheckCircle className="h-4 w-4 mr-2" /> Hired</>
                  ) : selectedJob.applicationStatus === 'NOT_HIRED' ? (
                    'Apply Again'
                  ) : (
                    'Pending'
                  )
                ) : (
                  'Apply Now'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
};

export default EditorDashboard;
