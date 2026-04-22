import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
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
import { Loader2, Search, Star, Filter, User, CheckCircle, Video } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface Editor {
  id: string;
  name: string;
  avatar?: string;
  skills: string[];
  experience: string;
  bio?: string;
  availability: string;
  requestStatus?: string;
}

const EditorListing: React.FC = () => {
  const { user } = useAuth();
  const [editors, setEditors] = useState<Editor[]>([]);
  const [filteredEditors, setFilteredEditors] = useState<Editor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [selectedEditor, setSelectedEditor] = useState<Editor | null>(null);
  const [hireDialogOpen, setHireDialogOpen] = useState(false);
  const [hiring, setHiring] = useState(false);

  const experiences = ['All', 'Beginner', 'Intermediate', 'Expert'];

  useEffect(() => {
    fetchEditors();
  }, []);

  useEffect(() => {
    filterEditors();
  }, [editors, searchQuery, selectedExperience]);

  const fetchEditors = async () => {
    try {
      setIsLoading(true);
      const data = await api.getEditors();
      setEditors(data.editors || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch editors');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEditors = () => {
    let filtered = editors;
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        e => e.name.toLowerCase().includes(lowerQuery) || 
             e.skills.some(s => s.toLowerCase().includes(lowerQuery)) ||
             (e.bio && e.bio.toLowerCase().includes(lowerQuery))
      );
    }
    if (selectedExperience !== 'All') {
      filtered = filtered.filter(e => e.experience === selectedExperience);
    }
    setFilteredEditors(filtered);
  };

  const handleHire = async () => {
    if (!selectedEditor) return;

    setHiring(true);
    // Optimistic Update
    const previousEditors = [...editors];
    try {
      setEditors(editors.map(ed => 
        ed.id === selectedEditor.id ? { ...ed, requestStatus: 'PENDING' } : ed
      ));
      setHireDialogOpen(false);

      await api.sendDirectRequest(selectedEditor.id);
    } catch (err: any) {
      console.error('Failed to send request:', err);
      // Revert on error
      setEditors(previousEditors);
    } finally {
      setHiring(false);
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
        
        <div className="bg-[#111] rounded-3xl p-10 shadow-2xl border border-white/5 relative overflow-hidden mb-10 group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="absolute -bottom-8 left-10 w-64 h-64 bg-pink-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-gradient-to-tr from-rose-500 to-pink-500 p-3 rounded-2xl shadow-lg">
              <Video className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
                Find Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">Editors</span>
              </h1>
              <p className="text-gray-400 text-lg">Browse talented editors and find the perfect match for your project</p>
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
                  placeholder="Search editors by name or skills..."
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-64">
                <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Experience Level" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10 text-white">
                    {experiences.map(e => (
                      <SelectItem key={e} value={e} className="focus:bg-white/10 focus:text-white">{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor Grid */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          {filteredEditors.length === 0 ? (
            <Card className="p-16 text-center bg-[#111] border-white/5 border-dashed rounded-3xl">
              <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No editors found</h3>
              <p className="text-gray-500">Try adjusting your search criteria.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEditors.map((editor) => (
                <Card key={editor.id} className="bg-[#111] border-white/5 hover:border-white/20 transition-all duration-300 group rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-500/10">
                  <CardHeader className="pb-4 bg-white/[0.02] border-b border-white/5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                          {editor.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-white group-hover:text-rose-400 transition-colors">{editor.name}</h3>
                          <p className="text-sm text-gray-400 flex items-center mt-1">
                            <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                            {editor.experience} Editor
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 pb-6 flex-1 flex flex-col">
                    <div className="mb-6 flex-1">
                      <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                        {editor.bio || 'No bio provided.'}
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Top Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {editor.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-rose-500/10 text-rose-400 border-none">
                            {skill}
                          </Badge>
                        ))}
                        {editor.skills.length > 3 && (
                          <Badge variant="secondary" className="bg-white/5 text-gray-400 border-none">
                            +{editor.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                      <div className="text-sm">
                        <span className="text-gray-500 mr-2">Availability:</span>
                        <span className="font-medium text-green-400">{editor.availability}</span>
                      </div>
                      {user && user.role === 'client' && (
                        <Button
                          onClick={() => {
                            setSelectedEditor(editor);
                            setHireDialogOpen(true);
                          }}
                          disabled={!!editor.requestStatus && editor.requestStatus !== 'NOT_HIRED'}
                          className={`rounded-full h-10 px-6 font-semibold shadow-lg ${
                            editor.requestStatus === 'HIRED'
                              ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20'
                              : editor.requestStatus === 'PENDING'
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-yellow-500/20'
                              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                          }`}
                          size="sm"
                        >
                          {editor.requestStatus === 'HIRED' ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Hired
                            </>
                          ) : editor.requestStatus === 'PENDING' ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Requested
                            </>
                          ) : (
                            <>
                              <User className="h-4 w-4 mr-2" />
                              Hire Direct
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hire Modal */}
      <Dialog open={hireDialogOpen} onOpenChange={setHireDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#111] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Direct Hire Request</DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              Send a direct request to hire <strong className="text-white">{selectedEditor?.name}</strong>. They will be notified and can accept or decline your request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-3xl font-bold text-white shadow-inner mb-2">
              {selectedEditor?.name.charAt(0)}
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 border-t border-white/10 pt-6">
            <Button variant="outline" onClick={() => setHireDialogOpen(false)} className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-full h-12">
              Cancel
            </Button>
            <Button onClick={handleHire} disabled={hiring} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full h-12 font-semibold">
              {hiring ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditorListing;
