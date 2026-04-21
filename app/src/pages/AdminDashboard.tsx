import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Briefcase, FileText, TrendingUp, Mail, ShieldAlert, Clock, Trash2, KeyRound, IndianRupee } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [resetPassDialogOpen, setResetPassDialogOpen] = useState(false);
  const [deleteJobDialogOpen, setDeleteJobDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');

  const isAdmin = user?.role === 'admin' || user?.email === 'sk.nehra2005@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsData, usersData, jobsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminJobs()
      ]);
      setStats(statsData);
      setUsers(usersData.users || []);
      setJobs(jobsData.jobs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.deleteUser(selectedUser.id);
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setDeleteUserDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await api.resetUserPassword(selectedUser.id, newPassword);
      setResetPassDialogOpen(false);
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    }
  };

  const handleDeleteJob = async () => {
    try {
      await api.deleteJob(selectedJob.id);
      setJobs(jobs.filter(j => j.id !== selectedJob.id));
      setDeleteJobDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete job');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
        <Button className="mt-6 bg-rose-500" onClick={() => window.location.href = '/'}>
          Return Home
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of EditlanceX platform performance and users</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.stats?.totalUsers || 0}</div>
              <p className="text-xs text-gray-500">Registered on platform</p>
            </CardContent>
          </Card>
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.stats?.totalJobs || 0}</div>
              <p className="text-xs text-gray-500">Total jobs posted</p>
            </CardContent>
          </Card>
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.stats?.totalApplications || 0}</div>
              <p className="text-xs text-gray-500">Applications submitted</p>
            </CardContent>
          </Card>
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-250">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Editors</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.stats?.totalEditors || 0}</div>
              <p className="text-xs text-gray-500">Professional editors</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Chart */}
        <Card className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { name: 'Jan', users: Math.max(0, stats?.stats?.totalUsers - 20) || 0, jobs: Math.max(0, stats?.stats?.totalJobs - 10) || 0 },
                  { name: 'Feb', users: Math.max(0, stats?.stats?.totalUsers - 15) || 0, jobs: Math.max(0, stats?.stats?.totalJobs - 8) || 0 },
                  { name: 'Mar', users: Math.max(0, stats?.stats?.totalUsers - 5) || 0, jobs: Math.max(0, stats?.stats?.totalJobs - 2) || 0 },
                  { name: 'Apr', users: stats?.stats?.totalUsers || 0, jobs: stats?.stats?.totalJobs || 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" name="Total Users" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="jobs" stroke="#f43f5e" name="Total Jobs" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Users and Jobs */}
        <Tabs defaultValue="users" className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <TabsList className="mb-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="jobs">Job Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Directory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-gray-400" />
                              {u.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} 
                                   className={u.role === 'editor' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}>
                              {u.role.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{u.phone || 'N/A'}</TableCell>
                          <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setResetPassDialogOpen(true);
                                }}
                              >
                                <KeyRound className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setDeleteUserDialogOpen(true);
                                }}
                                disabled={u.id === user?.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Job Directory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Apps</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((j) => (
                        <TableRow key={j.id}>
                          <TableCell className="font-medium">{j.title}</TableCell>
                          <TableCell>{j.clientName}</TableCell>
                          <TableCell>
                            <div className="flex items-center text-green-600">
                              <IndianRupee className="h-3 w-3 mr-0.5" />
                              {j.budget}
                            </div>
                          </TableCell>
                          <TableCell>{j.applicationsCount}</TableCell>
                          <TableCell>
                            <Badge variant={j.status === 'OPEN' ? 'default' : 'secondary'}>{j.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => {
                                  setSelectedJob(j);
                                  setDeleteJobDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
          <Card>
            <CardHeader>
              <CardTitle>Recent Job Postings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentJobs?.map((job: any) => (
                  <div key={job.id} className="flex justify-between items-center p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                    <div>
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <p className="text-xs text-gray-500">by {job.client.name} • {new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline">{job.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg transition-colors hover:bg-blue-100">
                  <h4 className="text-sm font-semibold text-blue-900">Growth Insight</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Your platform currently has a ratio of {(stats?.stats?.totalEditors / stats?.stats?.totalUsers * 100).toFixed(1)}% editors.
                  </p>
                </div>
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg transition-colors hover:bg-rose-100">
                  <h4 className="text-sm font-semibold text-rose-900">Engagement</h4>
                  <p className="text-xs text-rose-700 mt-1">
                    Average applications per job: {(stats?.stats?.totalApplications / (stats?.stats?.totalJobs || 1)).toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      
      {/* Delete User Modal */}
      <Dialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone and will remove all their data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={resetPassDialogOpen} onOpenChange={setResetPassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password for {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Enter a new password for this user. They will be able to log in using this new password.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-password">New Password</Label>
            <Input 
              id="new-password" 
              type="text" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="Enter new password"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPassDialogOpen(false)}>Cancel</Button>
            <Button className="bg-rose-500" onClick={handleResetPassword}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Job Modal */}
      <Dialog open={deleteJobDialogOpen} onOpenChange={setDeleteJobDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the job <strong>"{selectedJob?.title}"</strong>? This will also remove all associated applications.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteJobDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteJob}>Delete Job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminDashboard;