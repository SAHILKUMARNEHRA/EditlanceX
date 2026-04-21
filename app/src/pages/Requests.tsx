import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, User, CheckCircle, XCircle, Briefcase, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Requests: React.FC = () => {
  const { user } = useAuth();
  const [directRequests, setDirectRequests] = useState<any[]>([]);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      let data;
      if (user?.role === 'client') {
        data = await api.getClientRequests();
      } else {
        data = await api.getEditorRequests();
      }
      setDirectRequests(data.directRequests || []);
      setJobApplications(data.jobApplications || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (id: string, status: 'HIRED' | 'NOT_HIRED') => {
    try {
      await api.respondToRequest(id, status);
      setDirectRequests(directRequests.map(req => 
        req.id === id ? { ...req, status } : req
      ));
    } catch (err: any) {
      console.error('Failed to respond to request:', err);
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
                <Card key={req.id} className="bg-[#111] border-white/5 hover:border-white/10 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
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
                              <Badge className="bg-white/5 text-gray-400 border-white/10 font-normal">
                                {user?.role === 'client' ? 'Editor' : 'Client'}
                              </Badge>
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
                      
                      <div className="p-6 bg-white/[0.02] flex items-center justify-center min-w-[200px]">
                        {req.status === 'PENDING' ? (
                          user?.role === 'editor' ? (
                            <div className="flex flex-col gap-3 w-full">
                              <Button onClick={() => handleRespond(req.id, 'HIRED')} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold shadow-lg shadow-green-600/20">
                                <CheckCircle className="h-4 w-4 mr-2" /> Accept
                              </Button>
                              <Button variant="outline" onClick={() => handleRespond(req.id, 'NOT_HIRED')} className="w-full border-white/10 text-gray-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 rounded-full font-semibold">
                                <XCircle className="h-4 w-4 mr-2" /> Decline
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center w-full">
                              <div className="inline-flex items-center justify-center p-3 bg-yellow-500/10 rounded-full mb-3">
                                <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
                              </div>
                              <p className="font-semibold text-yellow-500">Pending Response</p>
                            </div>
                          )
                        ) : (
                          <div className="text-center w-full">
                            <div className={`inline-flex items-center justify-center p-3 rounded-full mb-3 ${req.status === 'HIRED' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                              {req.status === 'HIRED' ? <CheckCircle className="h-8 w-8 text-green-500" /> : <XCircle className="h-8 w-8 text-red-500" />}
                            </div>
                            <p className={`font-bold text-lg ${req.status === 'HIRED' ? 'text-green-500' : 'text-red-500'}`}>
                              {req.status === 'HIRED' ? 'Accepted' : 'Declined'}
                            </p>
                          </div>
                        )}
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
                <Card key={app.id} className="bg-[#111] border-white/5 hover:border-white/10 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="p-6 flex-1 border-b sm:border-b-0 sm:border-r border-white/5">
                        <div className="flex items-start gap-4">
                          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full shadow-inner mt-1">
                            <Briefcase className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-white mb-1 group-hover:text-blue-400 transition-colors">
                              {app.job?.title}
                            </h3>
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
                      
                      <div className="p-6 bg-white/[0.02] flex items-center justify-center min-w-[200px]">
                        <div className="text-center w-full">
                          <div className={`inline-flex items-center justify-center p-3 rounded-full mb-3 ${
                            app.status === 'HIRED' ? 'bg-green-500/10' : 
                            app.status === 'NOT_HIRED' ? 'bg-red-500/10' : 
                            'bg-yellow-500/10'
                          }`}>
                            {app.status === 'HIRED' ? <CheckCircle className="h-8 w-8 text-green-500" /> : 
                             app.status === 'NOT_HIRED' ? <XCircle className="h-8 w-8 text-red-500" /> : 
                             <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />}
                          </div>
                          <p className={`font-bold text-lg ${
                            app.status === 'HIRED' ? 'text-green-500' : 
                            app.status === 'NOT_HIRED' ? 'text-red-500' : 
                            'text-yellow-500'
                          }`}>
                            {app.status === 'PENDING' ? 'Under Review' : 
                             app.status === 'HIRED' ? 'Hired' : 'Declined'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Requests;
