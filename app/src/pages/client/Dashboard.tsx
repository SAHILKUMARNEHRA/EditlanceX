import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Tabs components removed - not used in this component
import { Loader2, Plus, Briefcase, Users, Eye, IndianRupee, Calendar, ArrowRight, Clock } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

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
  applicationsCount?: number;
  createdAt: string;
  applications?: any[];
}

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  
  // New state for viewing editor profile
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const data = await api.getPostedJobs();
      setPostedJobs(data.jobs || []);
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
      setError(err.message || 'Failed to fetch job details');
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const viewEditorProfile = (app: any) => {
    setSelectedApplication(app);
    setEditorModalOpen(true);
  };

  const handleContactEditor = async () => {
     if (!selectedApplication) return;
     
     try {
       const data = await api.markAsContacted(selectedApplication.id);
       // Update local state with the returned full editor info
       setSelectedApplication({ ...selectedApplication, isContacted: true, editor: data.editor });
       // Also update in selectedJob
       if (selectedJob) {
         const updatedApps = selectedJob.applications?.map((app: any) => 
           app.id === selectedApplication.id ? { ...app, isContacted: true, editor: data.editor } : app
         );
         setSelectedJob({ ...selectedJob, applications: updatedApps });
       }
     } catch (err: any) {
       console.error('Failed to mark as contacted:', err);
     }
   };

  const handleUpdateStatus = async (status: 'HIRED' | 'NOT_HIRED') => {
    if (!selectedApplication) return;
    
    setIsUpdatingStatus(true);
    try {
      await api.updateApplicationStatus(selectedApplication.id, status);
      // Update local state
      setSelectedApplication({ ...selectedApplication, status });
      // Also update in selectedJob
      if (selectedJob) {
        const updatedApps = selectedJob.applications?.map((app: any) => 
          app.id === selectedApplication.id ? { ...app, status } : app
        );
        setSelectedJob({ ...selectedJob, applications: updatedApps });
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdatingStatus(false);
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
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your video editing projects and find talented editors
            </p>
          </div>
          <Link to="/client/post-job" className="mt-4 sm:mt-0">
            <Button className="bg-rose-500 hover:bg-rose-600">
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posted Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{postedJobs.length}</div>
              <p className="text-xs text-gray-500">Active job postings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {postedJobs.reduce((acc, job) => acc + (job.applicationsCount || 0), 0)}
              </div>
              <p className="text-xs text-gray-500">From all your jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <IndianRupee className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBudget(postedJobs.reduce((acc, job) => acc + job.budget, 0))}
              </div>
              <p className="text-xs text-gray-500">Across all posted jobs</p>
            </CardContent>
          </Card>
        </div>

        {/* Posted Jobs */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Posted Jobs</h2>
            <Link to="/client/post-job">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Post Job
              </Button>
            </Link>
          </div>

          {postedJobs.length === 0 ? (
            <Card className="p-8 text-center">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-gray-500 mb-4">Post your first job to find talented video editors</p>
              <Link to="/client/post-job">
                <Button className="bg-rose-500 hover:bg-rose-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Post a Job
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {postedJobs.map((job) => (
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
                    
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="flex items-center text-green-600 font-medium">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {formatBudget(job.budget)}
                      </span>
                      <span className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(job.deadline)}
                      </span>
                    </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-1 text-blue-500" />
                          <span>{job.applicationsCount || 0} applications</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-500 hover:text-rose-600"
                          onClick={() => fetchJobDetails(job.id)}
                          disabled={isFetchingDetails}
                        >
                          {isFetchingDetails && selectedJob?.id === job.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </>
                          )}
                        </Button>
                      </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Find Editors CTA */}
        <Card className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-semibold mb-2">Looking for talented editors?</h3>
                <p className="text-rose-100">Browse our community of professional video editors</p>
              </div>
              <Link to="/client/editors">
                <Button variant="secondary" className="bg-white text-rose-500 hover:bg-gray-100">
                  Browse Editors
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Details and Applications Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {selectedJob?.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-rose-50 text-rose-600">
                {selectedJob?.category}
              </Badge>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                Posted {selectedJob && formatDate(selectedJob.createdAt)}
              </span>
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-8 py-4">
              {/* Job Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Budget</p>
                  <p className="text-lg font-bold text-green-600 flex items-center">
                    <span className="truncate" title={selectedJob.budget.toString()}>
                      {formatBudget(selectedJob.budget)}
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Deadline</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(selectedJob.deadline)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Video Type</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedJob.videoType || 'Not specified'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Applications</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedJob.applications?.length || 0} total
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Project Description</h4>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-white border rounded-lg p-4">
                  {selectedJob.description}
                </div>
              </div>

              {/* Software */}
              {selectedJob.software && selectedJob.software.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900">Required Software</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.software.map((sw: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-white border-gray-200 text-gray-700">
                        {sw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Applications List */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  Received Applications
                </h3>
                
                {(!selectedJob.applications || selectedJob.applications.length === 0) ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-gray-500 text-sm">No applications received yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedJob.applications.map((app: any) => (
                      <Card 
                        key={app.id} 
                        className="overflow-hidden hover:border-rose-400 cursor-pointer transition-all hover:shadow-md group"
                        onClick={() => viewEditorProfile(app)}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <Avatar className="h-12 w-12 shrink-0 group-hover:scale-105 transition-transform">
                              <AvatarImage src={app.editor.avatar} />
                              <AvatarFallback className="bg-rose-100 text-rose-600">
                                {app.editor.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-bold text-gray-900">{app.editor.name}</h4>
                                  <p className="text-xs text-gray-500">{app.editor.email}</p>
                                </div>
                                <Badge variant="outline" className="text-[10px] uppercase">
                                  Applied {new Date(app.appliedAt).toLocaleDateString()}
                                </Badge>
                              </div>
                              
                              <div className="space-y-3">
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {app.editor.profile?.bio || 'No bio provided.'}
                                </p>
                                
                                <div className="flex flex-wrap gap-1">
                                  {app.editor.profile?.skills?.slice(0, 4).map((skill: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-[10px] py-0 px-1 bg-gray-100">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {(app.editor.profile?.skills?.length || 0) > 4 && (
                                    <span className="text-[10px] text-gray-400">+{app.editor.profile.skills.length - 4} more</span>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-3 pt-1">
                                  <div className="flex items-center text-[11px] text-gray-500">
                                    <Briefcase className="h-3 w-3 mr-1" />
                                    {app.editor.profile?.experience || 'No exp specified'}
                                  </div>
                                  <div className="flex items-center text-[11px] text-gray-500">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {app.editor.profile?.availability || 'Unknown availability'}
                                  </div>
                                </div>
                                
                                {app.editor.profile?.experienceDetails && (
                                  <div className="mt-2 p-2 bg-rose-50/50 rounded text-xs text-gray-600 border border-rose-100/50">
                                    <p className="font-semibold text-rose-700 mb-1">Detailed Experience:</p>
                                    <p className="line-clamp-3">{app.editor.profile.experienceDetails}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)} className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editor Profile Details Modal */}
      <Dialog open={editorModalOpen} onOpenChange={setEditorModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Editor Profile</DialogTitle>
            <DialogDescription>Full details and experience of the applicant</DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-50 p-6 rounded-2xl">
                <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                  <AvatarImage src={selectedApplication.editor.avatar} />
                  <AvatarFallback className="bg-rose-100 text-rose-600 text-3xl font-bold">
                    {selectedApplication.editor.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedApplication.editor.name}</h3>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                    <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                      {selectedApplication.editor.profile?.experience || 'Professional'} Editor
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      {selectedApplication.editor.profile?.availability || 'Available'}
                    </Badge>
                    {selectedApplication.status !== 'PENDING' && (
                      <Badge className={selectedApplication.status === 'HIRED' ? 'bg-green-500' : 'bg-red-500'}>
                        {selectedApplication.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info - Exclusive */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Contact Information
                </h4>
                {selectedApplication.isContacted ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-500">
                    <div className="space-y-1">
                      <p className="text-xs text-blue-600 font-semibold uppercase">Email Address</p>
                      <p className="text-gray-900 font-medium">{selectedApplication.editor.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-blue-600 font-semibold uppercase">Phone Number</p>
                      <p className="text-gray-900 font-medium">{selectedApplication.editor.phone || 'Not provided'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-blue-700 mb-3">Contact details are hidden. Click below to reveal.</p>
                    <Button 
                      onClick={handleContactEditor}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Reveal Contact Details
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">About</h4>
                  <p className="text-gray-600 leading-relaxed bg-white border rounded-xl p-4 italic">
                    "{selectedApplication.editor.profile?.bio || 'No bio provided.'}"
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Skills & Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.editor.profile?.skills?.map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-700 px-3 py-1">
                        {skill}
                      </Badge>
                    )) || <span className="text-gray-400 text-sm italic">No skills listed</span>}
                  </div>
                </div>

                {selectedApplication.editor.profile?.experienceDetails && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Detailed Experience</h4>
                    <div className="text-sm text-gray-600 bg-rose-50/30 border border-rose-100 rounded-xl p-4 whitespace-pre-wrap">
                      {selectedApplication.editor.profile.experienceDetails}
                    </div>
                  </div>
                )}

                {selectedApplication.editor.profile?.portfolioLinks && selectedApplication.editor.profile.portfolioLinks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Portfolio Links</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedApplication.editor.profile.portfolioLinks.map((link: string, i: number) => (
                        <a 
                          key={i} 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center p-3 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-colors overflow-hidden"
                        >
                          <ArrowRight className="h-3 w-3 mr-2 shrink-0" />
                          <span className="truncate">{link}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setEditorModalOpen(false)} className="w-full sm:w-auto">
              Close Profile
            </Button>
            
            {selectedApplication?.isContacted && (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  onClick={() => handleUpdateStatus('HIRED')}
                  disabled={isUpdatingStatus || selectedApplication.status === 'HIRED'}
                  className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                >
                  {isUpdatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Hired'}
                </Button>
                <Button 
                  onClick={() => handleUpdateStatus('NOT_HIRED')}
                  disabled={isUpdatingStatus || selectedApplication.status === 'NOT_HIRED'}
                  variant="destructive"
                  className="flex-1 sm:flex-none"
                >
                  Not Hired
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDashboard;
