import React, { useEffect, useState } from 'react';
import * as api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Search, Calendar, User, CheckCircle, Filter, Briefcase } from 'lucide-react';
import { formatINRCompact } from '@/lib/utils';

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

const EditorJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);

  const categories = ['All', 'YouTube', 'Corporate', 'Wedding', 'Social Media', 'Music Video', 'Commercial', 'Other'];

  useEffect(() => {
    fetchJobs();
    checkProfile();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, selectedCategory]);

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

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const data = await api.getJobs();
      setJobs(data.jobs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        j => j.title.toLowerCase().includes(lowerQuery) || 
             j.description.toLowerCase().includes(lowerQuery)
      );
    }
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(j => j.category === selectedCategory);
    }

    filtered.sort((a, b) => {
      const isAExpired = new Date(a.deadline).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
      const isBExpired = new Date(b.deadline).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
      if (isAExpired && !isBExpired) return 1;
      if (!isAExpired && isBExpired) return -1;
      return 0;
    });

    setFilteredJobs(filtered);
  };

  const isExpired = (deadline: string) => new Date(deadline).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);

  // Open the details modal instantly using the data we already loaded from getJobs().
  // For editors, getJobById returns no extra fields (the applications list is hidden),
  // so a blocking network call here only made the modal hang for several seconds.
  const openJobDetails = (job: Job) => {
    setSelectedJob(job);
    setDetailsDialogOpen(true);
  };

  const handleApply = async () => {
    if (!selectedJob) return;

    setApplying(true);
    // Optimistic Update
    const previousJob = { ...selectedJob };
    const previousJobs = [...jobs];
    const previousFilteredJobs = [...filteredJobs];

    try {
      setSelectedJob({ ...selectedJob, applied: true, applicationStatus: 'PENDING' });
      setJobs(jobs.map(j => j.id === selectedJob.id ? { ...j, applied: true, applicationStatus: 'PENDING' } : j));
      setFilteredJobs(filteredJobs.map(j => j.id === selectedJob.id ? { ...j, applied: true, applicationStatus: 'PENDING' } : j));

      await api.applyJob(selectedJob.id);
      
      // Refresh cleanly in background
      api.getJobById(selectedJob.id).then(updatedJob => setSelectedJob(updatedJob));
    } catch (err: any) {
      console.error('Failed to apply for job:', err);
      // Revert on error
      setSelectedJob(previousJob);
      setJobs(previousJobs);
      setFilteredJobs(previousFilteredJobs);
    } finally {
      setApplying(false);
    }
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
          {!profileComplete && (
            <div className="mb-6 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-amber-500/20 p-2 rounded-full">
                  <User className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-300">Complete your profile</h3>
                  <p className="text-sm text-amber-200/70">
                    You need to complete your profile before you can apply for jobs.
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
                onClick={() => window.location.href = '/editor/profile?setup=true'}
              >
                Go to Profile
              </Button>
            </div>
          )}

          <div className="bg-[#111] rounded-3xl p-10 shadow-2xl border border-white/5 relative overflow-hidden mb-8 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
            <div className="absolute -bottom-8 left-10 w-64 h-64 bg-yellow-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="bg-gradient-to-tr from-rose-500 to-yellow-500 p-3 rounded-2xl shadow-lg">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
                  Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-yellow-500">Jobs</span>
                </h1>
                <p className="text-gray-400 text-lg">Find video editing opportunities that match your skills</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-8 bg-[#111] border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <Input
                    placeholder="Search by keyword..."
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-64">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl">
                      <div className="flex items-center">
                        <Filter className="h-4 w-4 mr-2 text-gray-500" />
                        <SelectValue placeholder="Category" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-white/10 text-white">
                      {categories.map(c => (
                        <SelectItem key={c} value={c} className="focus:bg-white/10 focus:text-white">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Listings */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            {filteredJobs.length === 0 ? (
              <Card className="p-16 text-center bg-[#111] border-white/5 border-dashed rounded-3xl">
                <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No jobs found</h3>
                <p className="text-gray-500">Try adjusting your search filters.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="bg-[#111] border-white/5 hover:border-rose-500/30 hover:shadow-[0_20px_50px_rgba(225,29,72,0.15)] transition-all duration-500 hover:-translate-y-2 flex flex-col group rounded-2xl overflow-hidden">
                    <CardHeader className="pb-3 border-b border-white/5 bg-white/[0.02]">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-xl text-white line-clamp-1 group-hover:text-rose-400 transition-colors">{job.title}</h3>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {job.clientName}
                        </span>
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20">{job.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-5 pb-6 flex-1 flex flex-col">
                      <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">{job.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Budget</p>
                          <div className="flex items-center text-green-400 min-w-0">
                            <span className="font-bold text-lg truncate" title={job.budget.toString()}>{formatINRCompact(job.budget)}</span>
                          </div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Deadline</p>
                          <div className={`flex items-center ${isExpired(job.deadline) ? 'text-red-400' : 'text-white'}`}>
                            <Calendar className={`h-4 w-4 mr-1 ${isExpired(job.deadline) ? 'text-red-400' : 'text-blue-400'}`} />
                            <span className="font-medium text-sm">{isExpired(job.deadline) ? 'Deadline Crossed' : new Date(job.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 items-center flex-wrap mt-auto">
                        <Button
                          variant="outline"
                          onClick={() => openJobDetails(job)}
                          className="flex-1 border-white/10 text-white hover:bg-white/10 rounded-full"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedJob(job);
                            setDetailsDialogOpen(true);
                          }}
                          disabled={isExpired(job.deadline) || !profileComplete || (job.applied && job.applicationStatus !== 'NOT_HIRED')}
                          className={`flex-1 rounded-full font-semibold ${isExpired(job.deadline) || !profileComplete || (job.applied && job.applicationStatus !== 'NOT_HIRED') ? 'bg-white/10 text-gray-400 hover:bg-white/10 cursor-default' : 'bg-rose-600 hover:bg-rose-700 text-white'} ${job.applied && job.applicationStatus === 'HIRED' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                        >
                          {isExpired(job.deadline) ? (
                            'Not Available'
                          ) : job.applied ? (
                            job.applicationStatus === 'HIRED' ? (
                              <><CheckCircle className="h-4 w-4 mr-2" /> Hired</>
                            ) : job.applicationStatus === 'NOT_HIRED' ? (
                              'Apply Again'
                            ) : (
                              'Pending'
                            )
                          ) : (
                            'Apply Now'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Job Details Modal */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-[#111] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedJob?.title}</DialogTitle>
              <DialogDescription className="flex items-center mt-2 space-x-4 text-gray-400">
                <span className="flex items-center">
                  <Briefcase className="mr-1 h-4 w-4" />
                  {selectedJob?.category}
                </span>
                <span className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  Due {selectedJob && new Date(selectedJob.deadline).toLocaleDateString()}
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
    </div>
  );
};

export default EditorJobs;
