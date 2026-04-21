import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, User, CheckCircle, XCircle, Briefcase } from 'lucide-react';
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
      // Update local state
      setDirectRequests(directRequests.map(req => 
        req.id === id ? { ...req, status } : req
      ));
    } catch (err: any) {
      console.error('Failed to respond to request:', err);
    }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <Bell className="h-8 w-8 text-rose-500" />
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Requests</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <Tabs defaultValue="direct" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="direct">Direct Requests ({directRequests.length})</TabsTrigger>
            <TabsTrigger value="applications">Job Applications ({jobApplications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-4">
            {directRequests.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No direct requests yet</h3>
                <p className="text-gray-500">Direct hire requests will appear here.</p>
              </Card>
            ) : (
              directRequests.map((req) => (
                <Card key={req.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-rose-100 p-3 rounded-full">
                          <User className="h-6 w-6 text-rose-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {user?.role === 'client' ? req.editor?.name : req.client?.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {user?.role === 'client' ? 'You requested to hire this editor' : 'This client wants to hire you directly'}
                          </p>
                          <div className="mt-2 text-xs text-gray-400">
                            {new Date(req.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:items-end gap-2">
                        {req.status === 'PENDING' ? (
                          user?.role === 'editor' ? (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleRespond(req.id, 'HIRED')} className="bg-green-500 hover:bg-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" /> Accept
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRespond(req.id, 'NOT_HIRED')}>
                                <XCircle className="h-4 w-4 mr-1" /> Decline
                              </Button>
                            </div>
                          ) : (
                            <Badge className="bg-yellow-500">Pending Response</Badge>
                          )
                        ) : (
                          <Badge className={req.status === 'HIRED' ? 'bg-green-500' : 'bg-red-500'}>
                            {req.status === 'HIRED' ? 'Accepted' : 'Declined'}
                          </Badge>
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
              <Card className="p-8 text-center border-dashed">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No job applications yet</h3>
                <p className="text-gray-500">Job applications will appear here.</p>
              </Card>
            ) : (
              jobApplications.map((app) => (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Briefcase className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {app.job?.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {user?.role === 'client' ? `Application from ${app.editor?.name}` : `You applied to ${app.job?.client?.name}`}
                          </p>
                          <div className="mt-2 text-xs text-gray-400">
                            {new Date(app.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:items-end gap-2">
                        <Badge className={
                          app.status === 'HIRED' ? 'bg-green-500' : 
                          app.status === 'NOT_HIRED' ? 'bg-red-500' : 
                          'bg-yellow-500'
                        }>
                          {app.status === 'PENDING' ? 'Pending Review' : 
                           app.status === 'HIRED' ? 'Hired' : 'Declined'}
                        </Badge>
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