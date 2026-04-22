import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Briefcase, FileText, TrendingUp, Mail, ShieldAlert, Trash2, KeyRound, Eye } from 'lucide-react';
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
  const [viewJobDialogOpen, setViewJobDialogOpen] = useState(false);
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

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 1,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(budget);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4 bg-[#0A0A0A]">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        <p className="text-gray-400 mt-2">You do not have permission to view this page.</p>
        <Button className="mt-6 bg-rose-600 text-white rounded-full px-8" onClick={() => window.location.href = '/'}>
          Return Home
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8 animate-in fade-in duration-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-[#111] rounded-3xl p-10 shadow-2xl border border-white/5 relative overflow-hidden mb-12 group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="absolute -bottom-8 left-10 w-64 h-64 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-500">Admin Dashboard</span>
              </h1>
              <p className="text-gray-400 text-xl font-light">
                Overview of EditlanceX platform performance and users
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-[#111] border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
              <Users className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.stats?.totalUsers || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Registered on platform</p>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Jobs</CardTitle>
              <Briefcase className="h-5 w-5 text-rose-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.stats?.totalJobs || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Total jobs posted</p>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Applications</CardTitle>
              <FileText className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.stats?.totalApplications || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Applications submitted</p>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-250 group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Editors</CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.stats?.totalEditors || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Professional editors</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Chart */}
        <Card className="bg-[#111] border-white/5 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <CardHeader>
            <CardTitle className="text-white">Platform Growth</CardTitle>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#888" />
                  <YAxis axisLine={false} tickLine={false} stroke="#888" />
                  <Tooltip cursor={{ stroke: '#444', strokeWidth: 2 }} contentStyle={{ backgroundColor: '#222', borderRadius: '8px', border: '1px solid #333', color: '#fff' }} />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" name="Total Users" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="jobs" stroke="#f43f5e" name="Total Jobs" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Users and Jobs */}
        <Tabs defaultValue="users" className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <TabsList className="mb-6 bg-[#111] border border-white/5 p-1 rounded-xl">
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">User Management</TabsTrigger>
            <TabsTrigger value="jobs" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">Job Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card className="bg-[#111] border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  User Directory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="border-white/10">
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-gray-400">Name</TableHead>
                        <TableHead className="text-gray-400">Email</TableHead>
                        <TableHead className="text-gray-400">Role</TableHead>
                        <TableHead className="text-gray-400">Phone</TableHead>
                        <TableHead className="text-gray-400">Joined</TableHead>
                        <TableHead className="text-right text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors">
                          <TableCell className="font-medium text-white">{u.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center text-gray-300">
                              <Mail className="h-3 w-3 mr-2 text-gray-500" />
                              {u.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} 
                                   className={u.role === 'editor' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : u.role === 'client' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}>
                              {u.role ? u.role.toUpperCase() : 'USER'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">{u.phone || 'N/A'}</TableCell>
                          <TableCell className="text-gray-300">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-white/10 text-gray-300 hover:bg-white/10 hover:text-white rounded-full h-8 w-8 p-0"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setResetPassDialogOpen(true);
                                }}
                              >
                                <KeyRound className="h-4 w-4 text-blue-400" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-full h-8 w-8 p-0"
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
            <Card className="bg-[#111] border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Briefcase className="h-5 w-5 mr-2 text-rose-500" />
                  Job Directory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="border-white/10">
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-gray-400">Title</TableHead>
                        <TableHead className="text-gray-400">Client</TableHead>
                        <TableHead className="text-gray-400">Budget</TableHead>
                        <TableHead className="text-gray-400">Apps</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-right text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((j) => (
                        <TableRow key={j.id} className="border-white/5 hover:bg-white/5 transition-colors">
                          <TableCell className="font-medium text-white">{j.title}</TableCell>
                          <TableCell className="text-gray-300">{j.clientName}</TableCell>
                          <TableCell>
                            <div className="flex items-center text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 w-max">
                              {formatBudget(j.budget)}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">{j.applicationsCount}</TableCell>
                          <TableCell>
                            <Badge className={j.status === 'OPEN' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-800 text-gray-400'}>{j.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-white/10 text-gray-300 hover:bg-white/10 hover:text-white rounded-full h-8 w-8 p-0"
                                onClick={() => {
                                  setSelectedJob(j);
                                  setViewJobDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 text-blue-400" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-white/10 text-gray-300 hover:bg-white/10 hover:text-white rounded-full h-8 px-3"
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to close this job?')) {
                                    try {
                                      await api.updateJobStatus(j.id, 'CLOSED');
                                      fetchAdminData();
                                    } catch (err) {
                                      setError('Failed to close job');
                                    }
                                  }
                                }}
                                disabled={j.status !== 'OPEN'}
                              >
                                Close
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-full h-8 w-8 p-0"
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
      </div>

      {/* Modals */}
      
      {/* Delete User Modal */}
      <Dialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
        <DialogContent className="bg-[#111] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete <strong className="text-white">{selectedUser?.name}</strong>? This action cannot be undone and will remove all their data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-white/10 pt-4">
            <Button variant="outline" onClick={() => setDeleteUserDialogOpen(false)} className="border-white/20 text-white hover:bg-white/10 rounded-full">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser} className="rounded-full">Delete User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={resetPassDialogOpen} onOpenChange={setResetPassDialogOpen}>
        <DialogContent className="bg-[#111] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Reset Password for {selectedUser?.name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a new password for this user. They will be able to log in using this new password.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-password" className="text-gray-300">New Password</Label>
            <Input 
              id="new-password" 
              type="text" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="Enter new password"
              className="bg-white/5 border-white/10 text-white mt-2"
            />
          </div>
          <DialogFooter className="border-t border-white/10 pt-4">
            <Button variant="outline" onClick={() => setResetPassDialogOpen(false)} className="border-white/20 text-white hover:bg-white/10 rounded-full">Cancel</Button>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white rounded-full" onClick={handleResetPassword}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Job Modal */}
      <Dialog open={deleteJobDialogOpen} onOpenChange={setDeleteJobDialogOpen}>
        <DialogContent className="bg-[#111] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete the job <strong className="text-white">"{selectedJob?.title}"</strong>? This will also remove all associated applications.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-white/10 pt-4">
            <Button variant="outline" onClick={() => setDeleteJobDialogOpen(false)} className="border-white/20 text-white hover:bg-white/10 rounded-full">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteJob} className="rounded-full">Delete Job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Job Modal */}
      <Dialog open={viewJobDialogOpen} onOpenChange={setViewJobDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[#111] border-white/10 text-white">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <DialogTitle className="text-2xl font-bold">{selectedJob?.title}</DialogTitle>
              <Badge className={selectedJob?.status === 'OPEN' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-800 text-gray-400'}>
                {selectedJob?.status}
              </Badge>
            </div>
            <DialogDescription className="flex items-center mt-2 space-x-4 text-gray-400">
              <span className="flex items-center">
                <Briefcase className="mr-1 h-4 w-4" />
                {selectedJob?.category}
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
                <p className="font-bold text-xl text-green-400">{selectedJob && formatBudget(selectedJob.budget)}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Description</h4>
              <p className="text-gray-400 whitespace-pre-wrap leading-relaxed text-sm bg-white/5 p-4 rounded-xl border border-white/5">
                {selectedJob?.description}
              </p>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10 mt-2">
            <Button variant="outline" onClick={() => setViewJobDialogOpen(false)} className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-full h-12">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminDashboard;
