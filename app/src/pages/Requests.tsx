import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, User, CheckCircle, XCircle, Briefcase, Clock, Mail, AlertTriangle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const Requests: React.FC = () => {
  const { user } = useAuth();
  const [directRequests, setDirectRequests] = useState<any[]>([]);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [reqType, setReqType] = useState<'direct' | 'application' | null>(null);
  
  const isFirstFetch = useRef(true);

  // Sync selectedReq if data updates via polling
  useEffect(() => {
    if (selectedReq && reqType) {
      const sourceArray = reqType === 'direct' ? directRequests : jobApplications;
      const updatedReq = sourceArray.find(r => r.id === selectedReq.id);
      if (updatedReq && updatedReq.status !== selectedReq.status) {
        setSelectedReq(updatedReq);
      }
    }
  }, [directRequests, jobApplications]);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      if (isFirstFetch.current) {
        setIsLoading(true);
      }
      let data;
      if (user?.role === 'client') {
        data = await api.getClientRequests();
      } else {
        data = await api.getEditorRequests();
      }
      setDirectRequests(data.directRequests || []);
      setJobApplications(data.jobApplications || []);
    } catch (err: any) {
      console.error('Failed to fetch requests:', err);
      if (isFirstFetch.current) {
        setError(err.message || 'Failed to fetch requests');
      }
    } finally {
      if (isFirstFetch.current) {
        setIsLoading(false);
        isFirstFetch.current = false;
      }
    }
  };

  const handleRespond = async (id: string, status: 'HIRED' | 'NOT_HIRED', type: 'direct' | 'application') => {
    try {
      if (type === 'direct') {
        await api.respondToRequest(id, status);
        setDirectRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
        if (selectedReq?.id === id) setSelectedReq({ ...selectedReq, status });
      } else {
        await api.updateApplicationStatus(id, status);
        setJobApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
        if (selectedReq?.id === id) setSelectedReq({ ...selectedReq, status });
      }
    } catch (err: any) {
      console.error('Failed to respond:', err);
    }
  };

  const openModal = (req: any, type: 'direct' | 'application') => {
    setSelectedReq(req);
    setReqType(type);
  };

  const getContactEmail = () => {
    if (!selectedReq) return null;
    if (reqType === 'direct') {
      return user?.role === 'client' ? selectedReq.editor?.email : selectedReq.client?.email;
    } else {
      return user?.role === 'client' ? selectedReq.editor?.email : selectedReq.job?.client?.email;
    }
  };

  const getOtherName = () => {
    if (!selectedReq) return '';
    if (reqType === 'direct') {
      return user?.role === 'client' ? selectedReq.editor?.name : selectedReq.client?.name;
    } else {
      return user?.role === 'client' ? selectedReq.editor?.name : selectedReq.job?.client?.name;
    }
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'HIRED') return <Badge className="bg-green-500/20 text-green-400 border-none"><CheckCircle className="h-3 w-3 mr-1" /> Accepted</Badge>;
    if (status === 'NOT_HIRED') return <Badge className="bg-red-500/20 text-red-400 border-none"><XCircle className="h-3 w-3 mr-1" /> Declined</Badge>;
    return <Badge className="bg-yellow-500/20 text-yellow-500 border-none"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-[#111] rounded-3xl p-10 shadow-2xl border border-white/5 relative overflow-hidden mb-10 group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="absolute -bottom-8 left-10 w-64 h-64 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-gradient-to-tr from-rose-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <Bell className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Activity Hub</h1>
              <p className="text-gray-400 mt-1">Track your direct requests and job applications</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400">
            {error}
          </div>
        )}

        <Tabs defaultValue="direct" className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <TabsList className="mb-8 bg-[#111] border border-white/5 p-1 rounded-xl w-full sm:w-auto">
            <TabsTrigger value="direct" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 flex-1 sm:flex-none">
              Direct Requests <Badge className="ml-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border-none">{directRequests.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="applications" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 flex-1 sm:flex-none">
              Job Applications <Badge className="ml-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-none">{jobApplications.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-4">
            {directRequests.length === 0 ? (
              <Card className="p-16 text-center bg-[#111] border-white/5 border-dashed rounded-3xl">
                <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-10 w-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No direct requests yet</h3>
                <p className="text-gray-500">Direct hire requests will appear here.</p>
              </Card>
            ) : (
              directRequests.map((req) => (
                <Card key={req.id} onClick={() => openModal(req, 'direct')} className="cursor-pointer bg-[#111] border-white/5 hover:border-white/10 hover:bg-white/[0.02] hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="p-6 flex-1 border-b sm:border-b-0 sm:border-r border-white/5">
                        <div className="flex items-start gap-4">
                          <div className="bg-gradient-to-br from-rose-500 to-orange-500 p-4 rounded-full shadow-inner mt-1">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-bold text-xl text-white group-hover:text-rose-400 transition-colors">
                                {user?.role === 'client' ? req.editor?.name : req.client?.name}
                              </h3>
                              {renderStatusBadge(req.status)}
                            </div>
                            <p className="text-gray-400">
                              {user?.role === 'client' ? 'You requested to hire this editor' : 'This client wants to hire you directly'}
                            </p>
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(req.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 flex items-center justify-center min-w-[150px] text-gray-500 group-hover:text-white transition-colors">
                        <span className="flex items-center text-sm font-medium"><ExternalLink className="h-4 w-4 mr-2" /> View Details</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            {jobApplications.length === 0 ? (
              <Card className="p-16 text-center bg-[#111] border-white/5 border-dashed rounded-3xl">
                <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-10 w-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No job applications yet</h3>
                <p className="text-gray-500">Job applications will appear here.</p>
              </Card>
            ) : (
              jobApplications.map((app) => (
                <Card key={app.id} onClick={() => openModal(app, 'application')} className="cursor-pointer bg-[#111] border-white/5 hover:border-white/10 hover:bg-white/[0.02] hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="p-6 flex-1 border-b sm:border-b-0 sm:border-r border-white/5">
                        <div className="flex items-start gap-4">
                          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full shadow-inner mt-1">
                            <Briefcase className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-bold text-xl text-white group-hover:text-blue-400 transition-colors">
                                {app.job?.title}
                              </h3>
                              {renderStatusBadge(app.status)}
                            </div>
                            <p className="text-gray-400">
                              {user?.role === 'client' ? `Application from ` : `Applied to `}
                              <span className="font-semibold text-gray-300">{user?.role === 'client' ? app.editor?.name : app.job?.client?.name}</span>
                            </p>
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(app.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 flex items-center justify-center min-w-[150px] text-gray-500 group-hover:text-white transition-colors">
                        <span className="flex items-center text-sm font-medium"><ExternalLink className="h-4 w-4 mr-2" /> View Details</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* DETAILS MODAL */}
        <Dialog open={!!selectedReq} onOpenChange={(open) => !open && setSelectedReq(null)}>
          <DialogContent className="bg-[#111] text-white border-white/10 sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {reqType === 'direct' ? <User className="h-6 w-6 text-rose-500" /> : <Briefcase className="h-6 w-6 text-blue-500" />}
                Request Details
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {reqType === 'direct' ? 'Direct hiring request' : 'Job application'}
              </DialogDescription>
            </DialogHeader>

            {selectedReq && (
              <div className="mt-4 space-y-6">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400 text-sm">Status</span>
                    {renderStatusBadge(selectedReq.status)}
                  </div>
                  
                  {reqType === 'application' && (
                    <div className="mb-4">
                      <span className="text-gray-400 text-sm block mb-1">Job Title</span>
                      <span className="text-lg font-medium text-white">{selectedReq.job?.title}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-gray-400 text-sm block mb-1">
                      {user?.role === 'client' ? 'Editor Name' : 'Client Name'}
                    </span>
                    <span className="text-lg font-medium text-white">{getOtherName()}</span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <span className="text-gray-400 text-sm block mb-1">Received On</span>
                    <span className="text-white">{new Date(selectedReq.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Accept/Decline Buttons (Only if Pending and user has permission to respond) */}
                {selectedReq.status === 'PENDING' && (
                  (reqType === 'direct' && user?.role === 'editor') || 
                  (reqType === 'application' && user?.role === 'client')
                ) && (
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleRespond(selectedReq.id, 'HIRED', reqType)} 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-600/20 py-6"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" /> Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleRespond(selectedReq.id, 'NOT_HIRED', reqType)} 
                      className="flex-1 border-white/10 text-gray-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 rounded-xl py-6"
                    >
                      <XCircle className="h-5 w-5 mr-2" /> Decline
                    </Button>
                  </div>
                )}

                {/* Show Contact Info if HIRED */}
                {selectedReq.status === 'HIRED' && (
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-5 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="h-5 w-5 text-green-400" />
                      <h4 className="font-semibold text-green-400">Contact Information</h4>
                    </div>
                    <p className="text-white font-medium text-lg mb-3 bg-black/30 p-3 rounded-lg">{getContactEmail()}</p>
                    
                    <div className="flex items-start gap-2 text-yellow-500/80 bg-yellow-500/10 p-3 rounded-lg text-sm">
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                      <p>Save this contact details, it will not be displayed again.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Requests;
