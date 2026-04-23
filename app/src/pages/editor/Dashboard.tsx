import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Briefcase, CheckCircle, Clock, Calendar, ArrowRight, User } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatINRCompact } from '@/lib/utils';

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
      const [allJobsData, appliedJobsData] = await Promise.all([
        api.getJobs(),
        api.getAppliedJobs(),
      ]);
      
      let jobs = allJobsData.jobs || [];
      jobs.sort((a: Job, b: Job) => {
        const isAExpired = new Date(a.deadline).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
        const isBExpired = new Date(b.deadline).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
        if (isAExpired && !isBExpired) return 1;
        if (!isAExpired && isBExpired) return -1;
        return 0;
      });

      setAvailableJobs(jobs);
      setAppliedJobs(appliedJobsData.jobs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const isExpired = (deadline: string) => new Date(deadline).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);

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
    // Optimistic UI Update
    const previousJob = { ...selectedJob };
    const previousAvailable = [...availableJobs];

    try {
      setAvailableJobs(availableJobs.map(j => j.id === selectedJob.id ? { ...j, applied: true, applicationStatus: 'PENDING' } : j));
      setSelectedJob(null);
      setDetailsDialogOpen(false);

      await api.applyJob(selectedJob.id);
      // fetchJobs() can happen silently in the background without blocking the UI
      api.getJobs().then(data => {
        let jobs = data.jobs || [];
        jobs.sort((a: Job, b: Job) => {
          const isAExpired = new Date(a.deadline).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
          const isBExpired = new Date(b.deadline).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
          if (isAExpired && !isBExpired) return 1;
          if (!isAExpired && isBExpired) return -1;
          return 0;
        });
        setAvailableJobs(jobs);
      });
      api.getAppliedJobs().then(data => setAppliedJobs(data.jobs || []));
      
    } catch (err: any) {
      console.error('Failed to apply for job:', err);
      setError(err.message || 'Failed to apply for job');
      // Revert on error
      setAvailableJobs(previousAvailable);
      setSelectedJob(previousJob);
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8 animate-in fade-in duration-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          {/* Notifications */}
          {hiringAlert && (
          <Alert className={`mb-8 border p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${hiringAlert.type === 'HIRED' ? 'bg-gradient-to-r from-green-900/40 to-[#111] border-green-500/30' : 'bg-gradient-to-r from-red-900/40 to-[#111] border-red-500/30'}`}>
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 rounded-full overflow-hidden shrink-0 border-2 border-white/10 shadow-lg">
                <img 
                  src={hiringAlert.type === 'HIRED' 
                    ? 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop' 
                    : 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=200&auto=format&fit=crop'} 
                  alt="Status" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <AlertTitle className={`text-lg font-bold mb-1 tracking-tight ${hiringAlert.type === 'HIRED' ? 'text-green-400' : 'text-red-400'}`}>
                  {hiringAlert.type === 'HIRED' ? 'Congratulations! You Got the Job! 🎉' : 'Application Update'}
                </AlertTitle>
                <AlertDescription className="text-gray-300 text-sm">
                  {hiringAlert.type === 'HIRED' 
                    ? `You have been officially hired for "${hiringAlert.jobTitle}". The client will contact you shortly.`
                    : `Your application for "${hiringAlert.jobTitle}" was not successful. Keep applying!`}
                </AlertDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full border-white/20 hover:bg-white/10 text-white shadow-lg backdrop-blur-md shrink-0 w-full sm:w-auto" 
              onClick={() => setHiringAlert(null)}
            >
              Dismiss
            </Button>
          </Alert>
        )}

        {/* Profile Incomplete Banner */}
        {!profileComplete && (
          <div className="mb-8 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-500/20 p-2 rounded-full">
                <User className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-300">Complete your profile!</h3>
                <p className="text-sm text-amber-200/70">
                  You need to complete your profile before you can apply for jobs.
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
              onClick={() => navigate('/editor/profile?setup=true')}
            >
              Complete Profile
            </Button>
          </div>
        )}

          <div className="bg-[#111] rounded-3xl p-10 shadow-2xl border border-white/5 relative overflow-hidden mb-8 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
            <div className="absolute -bottom-8 left-10 w-64 h-64 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-500">{user?.name?.split(' ')[0]}!</span>
              </h1>
              <p className="text-gray-400 text-xl font-light">
                Here's what's happening with your editing career today.
              </p>
            </div>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <Card className="bg-[#111] border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Available Jobs</CardTitle>
              <Briefcase className="h-5 w-5 text-rose-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{availableJobs.length}</div>
              <p className="text-xs text-gray-500 mt-1">New opportunities</p>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Applied Jobs</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{appliedJobs.length}</div>
              <p className="text-xs text-gray-500 mt-1">Applications sent</p>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Success Rate</CardTitle>
              <TrendingUpIcon className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {appliedJobs.length > 0 ? Math.round((appliedJobs.filter(j => j.status === 'HIRED').length / appliedJobs.length) * 100) : 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Based on applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Tabs */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="mb-8 bg-[#111] border border-white/5 p-1 rounded-xl">
              <TabsTrigger value="available" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">Available Jobs</TabsTrigger>
              <TabsTrigger value="applied" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">Applied Jobs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="available" className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">Recent Opportunities</h2>
                <Link to="/editor/jobs">
                  <Button variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                    View all <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              {availableJobs.length === 0 ? (
                <Card className="p-12 text-center bg-[#111] border-white/5 border-dashed">
                  <Briefcase className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-300 mb-2">No jobs available</h3>
                  <p className="text-gray-500">Check back later for new opportunities.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableJobs.slice(0, 6).map((job) => (
                    <Card key={job.id} className="bg-[#111] border-white/5 hover:border-rose-500/30 hover:shadow-[0_20px_50px_rgba(225,29,72,0.15)] transition-all duration-500 hover:-translate-y-2 flex flex-col group rounded-2xl overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-rose-400 transition-colors">{job.title}</h3>
                          <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 whitespace-nowrap ml-2">
                            {job.category}
                          </Badge>
                        </div>
                        <p className={`text-sm flex items-center mt-2 ${isExpired(job.deadline) ? 'text-red-400' : 'text-gray-500'}`}>
                          <Clock className="h-3 w-3 mr-1" />
                          {isExpired(job.deadline) ? 'Deadline Crossed' : 'Posted recently'}
                        </p>
                      </CardHeader>
                      <CardContent className="pb-4 flex-1 flex flex-col">
                        <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1 leading-relaxed">{job.description}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="flex items-center text-green-400 font-semibold min-w-0 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                            <span className="truncate" title={job.budget.toString()}>
                              {formatINRCompact(job.budget)}
                            </span>
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-400 hover:text-white hover:bg-white/10 shrink-0 rounded-full"
                            onClick={() => fetchJobDetails(job.id)}
                          >
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="applied" className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">Your Applications</h2>
              </div>
              
              {appliedJobs.length === 0 ? (
                <Card className="p-12 text-center bg-[#111] border-white/5 border-dashed">
                  <CheckCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-300 mb-2">No applications yet</h3>
                  <p className="text-gray-500 mb-6">Start applying to jobs to see them here.</p>
                  <Link to="/editor/jobs">
                    <Button className="bg-white text-black hover:bg-gray-200 rounded-full font-semibold px-8">Browse Jobs</Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {appliedJobs.map((job) => (
                    <Card key={job.id} className={`bg-[#111] border-white/5 hover:border-white/20 transition-all duration-300 ${job.status === 'HIRED' ? 'border-green-500/30 shadow-lg shadow-green-500/5' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg text-white line-clamp-1">{job.title}</h3>
                          <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                            <Button
                              size="sm"
                              disabled={job.status !== 'NOT_HIRED'}
                              className={`${job.status !== 'NOT_HIRED' ? 'bg-white/10 text-white hover:bg-white/10 cursor-default' : 'bg-rose-600 hover:bg-rose-700 text-white'} h-7 text-xs px-3 rounded-full`}
                            >
                              {job.status === 'HIRED' ? 'Hired' :
                               job.status === 'NOT_HIRED' ? 'Declined' : 'Pending'}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed">{job.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-green-400 font-semibold bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                            {formatINRCompact(job.budget)}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
                            onClick={() => fetchJobDetails(job.id)}
                          >
                            Details
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
        </div>
      </div>

      {/* Job Details Modal */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[#111] border-white/10 text-white">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <DialogTitle className="text-2xl font-bold">{selectedJob?.title}</DialogTitle>
            </div>
            <DialogDescription className="flex items-center mt-2 space-x-4 text-gray-400">
              <span className="flex items-center">
                <Briefcase className="mr-1 h-4 w-4" />
                {selectedJob?.category}
              </span>
              <span className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                Due {selectedJob && formatDate(selectedJob.deadline)}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
              <div>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-1">Client</p>
                <p className="font-semibold text-white">{selectedJob?.clientName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-1">Budget</p>
                <p className="font-bold text-xl text-green-400">{selectedJob && formatINRCompact(selectedJob.budget)}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Description</h4>
              <p className="text-gray-400 whitespace-pre-wrap leading-relaxed text-sm bg-white/5 p-4 rounded-xl border border-white/5">
                {selectedJob?.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Video Type</h4>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">{selectedJob?.videoType || 'Not specified'}</Badge>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Software Required</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob?.software && selectedJob.software.length > 0 ? (
                    selectedJob.software.map((sw, i) => (
                      <Badge key={i} variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">{sw}</Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">Any software</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10 mt-2">
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)} className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-full h-12">
              Close
            </Button>
            {selectedJob && (
              <Button
                onClick={handleApply}
                disabled={isExpired(selectedJob.deadline) || applying || !profileComplete || (selectedJob.applied && selectedJob.applicationStatus !== 'NOT_HIRED')}
                className={`flex-1 rounded-full h-12 font-semibold ${isExpired(selectedJob.deadline) || !profileComplete || (selectedJob.applied && selectedJob.applicationStatus !== 'NOT_HIRED') ? 'bg-white/10 text-gray-400 cursor-default hover:bg-white/10' : 'bg-rose-600 hover:bg-rose-700 text-white'} ${selectedJob.applied && selectedJob.applicationStatus === 'HIRED' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
              >
                {isExpired(selectedJob.deadline) ? (
                  'Not Available (Deadline Crossed)'
                ) : applying ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Applying...
                  </>
                ) : !profileComplete ? (
                  'Complete Profile'
                ) : selectedJob.applied ? (
                  selectedJob.applicationStatus === 'HIRED' ? (
                    <><CheckCircle className="h-5 w-5 mr-2" /> Hired</>
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
  );
};

function TrendingUpIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

export default EditorDashboard;
