import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Briefcase, CheckCircle, Users, Eye, MoreVertical, MapPin, PieChart as PieChartIcon, User } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  videoType?: string;
  software?: string[];
  budget: number;
  deadline: string;
  status: string;
  createdAt: string;
  applications?: any[];
}

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const data = await api.getPostedJobs();
      setJobs(data.jobs || []);
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
      setViewDialogOpen(true);
    } catch (err: any) {
      console.error('Error fetching job details:', err);
    }
  };

  const handleUpdateStatus = async (status: 'HIRED' | 'NOT_HIRED') => {
    if (!selectedApplication || !selectedJob) return;

    // Optimistic UI Update
    const previousApp = { ...selectedApplication };
    const previousJob = { ...selectedJob };
    const previousJobs = [...jobs];

    try {
      setIsUpdatingStatus(true);
      // Immediately update local state
      setSelectedApplication({ ...selectedApplication, status });
      setSelectedJob({
        ...selectedJob,
        applications: selectedJob.applications?.map((app: any) => 
          app.id === selectedApplication.id ? { ...app, status } : app
        )
      });
      setJobs(jobs.map(j => 
        j.id === selectedJob.id 
          ? { 
              ...j, 
              applications: j.applications?.map((app: any) => 
                app.id === selectedApplication.id ? { ...app, status } : app
              ) 
            } 
          : j
      ));

      // Make API call in background
      await api.updateApplicationStatus(selectedApplication.id, status);
      
    } catch (err: any) {
      console.error('Failed to update status:', err);
      // Revert on error
      setSelectedApplication(previousApp);
      setSelectedJob(previousJob);
      setJobs(previousJobs);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 1,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(budget);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const activeJobs = jobs.filter(j => j.status === 'OPEN');
  const totalApplications = jobs.reduce((acc, job) => acc + (job.applications?.length || 0), 0);

  const hiringStats = React.useMemo(() => {
    let hired = 0;
    let notHired = 0;
    let pending = 0;
    const hiredEditors: any[] = [];

    jobs.forEach(job => {
      job.applications?.forEach(app => {
        if (app.status === 'HIRED') {
          hired++;
          hiredEditors.push({ ...app.editor, jobTitle: job.title });
        } else if (app.status === 'NOT_HIRED') {
          notHired++;
        } else {
          pending++;
        }
      });
    });

    return {
      data: [
        { name: 'Hired', value: hired, color: '#22c55e' },
        { name: 'Declined', value: notHired, color: '#ef4444' },
        { name: 'Pending', value: pending, color: '#eab308' }
      ].filter(d => d.value > 0),
      hiredEditors
    };
  }, [jobs]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8 animate-in fade-in duration-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="bg-[#111] rounded-3xl p-10 shadow-2xl border border-white/5 relative overflow-hidden mb-12 group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="absolute -bottom-8 left-10 w-64 h-64 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{user?.name?.split(' ')[0]}!</span>
              </h1>
              <p className="text-gray-400 text-xl font-light">
                Manage your job postings and find the perfect editor.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/client/editors">
                <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 px-8 h-14 rounded-full text-lg font-semibold transition-transform hover:scale-105 backdrop-blur-sm">
                  Browse Editors
                </Button>
              </Link>
              <Link to="/client/post-job">
                <Button className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 px-8 h-14 rounded-full text-lg font-semibold transition-transform hover:scale-105 shadow-lg shadow-white/10">
                  <Plus className="mr-2 h-5 w-5" />
                  Post New Job
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <Card className="bg-[#111] border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Jobs Posted</CardTitle>
              <Briefcase className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{jobs.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Jobs</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{activeJobs.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Applications</CardTitle>
              <Users className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalApplications}</div>
            </CardContent>
          </Card>
        </div>

        {/* Hiring Graph & Recently Hired */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <Card className="bg-[#111] border-white/5 col-span-1 lg:col-span-1 hover:border-white/10 transition-all duration-300">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-lg font-bold text-white">Application Stats</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 h-[300px]">
              {hiringStats.data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={hiringStats.data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {hiringStats.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <PieChartIcon className="h-16 w-16 mb-4 opacity-20" />
                  <p>No applications yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/5 col-span-1 lg:col-span-2 hover:border-white/10 transition-all duration-300 flex flex-col">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="text-lg font-bold text-white">Recently Hired Editors</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0 max-h-[300px] custom-scrollbar">
              {hiringStats.hiredEditors.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {hiringStats.hiredEditors.map((editor, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
                          {editor.name ? editor.name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
                        </div>
                        <div>
                          <p className="font-bold text-white">{editor.name}</p>
                          <p className="text-xs text-gray-400 mt-1 flex items-center">
                            <Briefcase className="h-3 w-3 mr-1" />
                            Hired for: <span className="text-green-400 ml-1 font-medium">{editor.jobTitle}</span>
                          </p>
                        </div>
                      </div>
                      <Link to={`/editor/${editor.id}`}>
                        <Button variant="outline" size="sm" className="rounded-full border-white/10 text-gray-300 hover:text-white hover:bg-white/10 h-8">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
                  <Users className="h-12 w-12 mb-4 opacity-20" />
                  <p>You haven't hired anyone yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Job Listings */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Your Postings</h2>
          </div>

          {jobs.length === 0 ? (
            <Card className="p-12 text-center bg-[#111] border-white/5 border-dashed">
              <Briefcase className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No jobs posted yet</h3>
              <p className="text-gray-500 mb-6">Create your first job posting to start receiving applications.</p>
              <Link to="/client/post-job">
                <Button className="bg-white text-black hover:bg-gray-200 rounded-full font-semibold px-8 h-12">Post a Job</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className="bg-[#111] border-white/5 hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] group overflow-hidden rounded-2xl">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-xl text-white group-hover:text-blue-400 transition-colors mb-2">{job.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">{job.category}</Badge>
                            <span>Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge className={job.status === 'OPEN' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-800 text-gray-400'}>
                          {job.status}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-400 text-sm line-clamp-2 mb-6 leading-relaxed">
                        {job.description}
                      </p>
                      
                      <div className="flex items-center gap-6">
                        <div className="flex items-center text-gray-400">
                          <Users className="h-4 w-4 mr-2 text-purple-400" />
                          <span className="font-medium text-white mr-1">{job.applications?.length || 0}</span> applications
                        </div>
                        <div className="flex items-center text-gray-400">
                          <span className="flex items-center font-semibold text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                            {formatBudget(job.budget)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 p-6 flex flex-row md:flex-col justify-center items-center gap-3 border-t md:border-t-0 md:border-l border-white/5">
                      <Button 
                        onClick={() => fetchJobDetails(job.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-10"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Applications
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full md:w-auto border-white/10 text-gray-300 hover:bg-white/10 hover:text-white rounded-full h-10">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#111] border-white/10 text-white">
                          {job.status === 'OPEN' && (
                            <DropdownMenuItem 
                              className="focus:bg-white/10 focus:text-white cursor-pointer"
                              onClick={async () => {
                                try {
                                  await api.updateJobStatus(job.id, 'CLOSED');
                                  fetchJobs();
                                } catch (err) {
                                  console.error('Failed to close job');
                                }
                              }}
                            >
                              Close Job
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                            onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this job?')) {
                                  try {
                                    await api.deleteJob(job.id);
                                    fetchJobs();
                                  } catch (err) {
                                    console.error('Failed to delete job');
                                  }
                                }
                            }}
                          >
                            Delete Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Job & Applications Modal */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-[#111] border-white/10 text-white">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <DialogTitle className="text-2xl font-bold text-white">{selectedJob?.title}</DialogTitle>
              <Badge className={selectedJob?.status === 'OPEN' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-800 text-gray-400'}>
                {selectedJob?.status}
              </Badge>
            </div>
            <DialogDescription className="text-gray-400 mt-2">
              Posted on {selectedJob && new Date(selectedJob.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-8">
            {/* Job Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Budget</p>
                <p className="text-lg font-bold text-green-400 flex items-center">
                  <span className="truncate" title={selectedJob?.budget.toString()}>
                    {selectedJob && formatBudget(selectedJob.budget)}
                  </span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Category</p>
                <p className="text-sm font-medium text-white">{selectedJob?.category}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Deadline</p>
                <p className="text-sm font-medium text-white">{selectedJob && new Date(selectedJob.deadline).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Applicants</p>
                <p className="text-lg font-bold text-purple-400">{selectedJob?.applications?.length || 0}</p>
              </div>
            </div>

            {/* Applications List */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Applications</h3>
              
              {!selectedJob?.applications || selectedJob.applications.length === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                  <Users className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No applications received yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedJob.applications.map((app) => (
                    <div key={app.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:border-white/20 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-lg text-white">{app.editor.name}</h4>
                            {app.status === 'HIRED' && <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Hired</Badge>}
                            {app.status === 'NOT_HIRED' && <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Declined</Badge>}
                          </div>
                          
                          {app.isContacted && (
                            <div className="flex flex-col gap-1 text-sm text-gray-400 mb-3 bg-white/5 p-3 rounded-xl border border-white/5">
                              <p><strong>Email:</strong> <a href={`mailto:${app.editor.email}`} className="text-blue-400 hover:underline">{app.editor.email}</a></p>
                              {app.editor.phone && <p><strong>Phone:</strong> {app.editor.phone}</p>}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                              {app.editor.profile?.experience || 'Professional'} Editor
                            </Badge>
                            <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/10">
                              {app.editor.profile?.availability || 'Available'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 min-w-[120px]">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full border-white/20 text-white hover:bg-white/10 rounded-full"
                            onClick={() => {
                              setSelectedApplication(app);
                              setApplicationDialogOpen(true);
                            }}
                          >
                            Review
                          </Button>
                          {!app.isContacted && (
                            <Button 
                              size="sm"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                              onClick={async () => {
                                try {
                                  await api.markAsContacted(app.id);
                                  const updatedJob = await api.getJobById(selectedJob.id);
                                  setSelectedJob(updatedJob);
                                } catch (err) {
                                  console.error('Failed to reveal contact info', err);
                                }
                              }}
                            >
                              Contact
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Application Modal */}
      <Dialog open={applicationDialogOpen} onOpenChange={setApplicationDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#111] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Application Review</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="py-4 space-y-6">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                  {selectedApplication.editor.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">{selectedApplication.editor.name}</h3>
                  <p className="text-gray-400 text-sm flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    Applied {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Editor Profile</h4>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Bio</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{selectedApplication.editor.profile?.bio || 'No bio provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.editor.profile?.skills?.map((skill: string, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-blue-500/10 text-blue-400 border-none">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  {selectedApplication.editor.profile?.portfolioLinks && selectedApplication.editor.profile.portfolioLinks.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Portfolio Links</p>
                      <div className="flex flex-col gap-2">
                        {selectedApplication.editor.profile.portfolioLinks.map((link: string, i: number) => (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline truncate bg-blue-500/5 p-2 rounded-lg border border-blue-500/10">
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!selectedApplication.isContacted ? (
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-center">
                  <p className="text-blue-400 text-sm mb-3">Contact the editor to see their email and phone number, and to make a hiring decision.</p>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8"
                    onClick={async () => {
                      try {
                        await api.markAsContacted(selectedApplication.id);
                        const updatedJob = await api.getJobById(selectedJob!.id);
                        setSelectedJob(updatedJob);
                        
                        const updatedApp = updatedJob.applications.find((a: any) => a.id === selectedApplication.id);
                        setSelectedApplication(updatedApp);
                      } catch (err) {
                        console.error('Failed to reveal contact info', err);
                      }
                    }}
                  >
                    Contact Editor
                  </Button>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                  <h4 className="font-semibold text-white mb-4 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                    Contact Information Revealed
                  </h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p className="flex items-center"><strong className="w-16 text-gray-500">Email:</strong> <a href={`mailto:${selectedApplication.editor.email}`} className="text-blue-400 hover:underline">{selectedApplication.editor.email}</a></p>
                    {selectedApplication.editor.phone && <p className="flex items-center"><strong className="w-16 text-gray-500">Phone:</strong> {selectedApplication.editor.phone}</p>}
                  </div>
                </div>
              )}
              
              {selectedApplication?.isContacted && (
                <div className="flex gap-3 w-full sm:w-auto pt-4 border-t border-white/10">
                  <Button 
                    onClick={() => handleUpdateStatus('HIRED')}
                    disabled={isUpdatingStatus || selectedApplication.status === 'HIRED'}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1 rounded-full h-12 font-semibold disabled:bg-green-600/50"
                  >
                    {isUpdatingStatus ? <Loader2 className="h-5 w-5 animate-spin" /> : 
                     selectedApplication.status === 'HIRED' ? 'Hired' : 'Hire Editor'}
                  </Button>
                  <Button 
                    onClick={() => handleUpdateStatus('NOT_HIRED')}
                    disabled={isUpdatingStatus || selectedApplication.status === 'NOT_HIRED'}
                    variant="destructive"
                    className="flex-1 rounded-full h-12 font-semibold bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 disabled:opacity-50"
                  >
                    {selectedApplication.status === 'NOT_HIRED' ? 'Declined' : 'Decline'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDashboard;
