import React, { useEffect, useState } from 'react';
import * as api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Star, Briefcase, Filter, CheckCircle } from 'lucide-react';

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

const experienceLevels = ['All', 'Less than 1 year', '1-2 years', '3-5 years', '5+ years', '10+ years'];

const EditorListing: React.FC = () => {
  const [editors, setEditors] = useState<Editor[]>([]);
  const [filteredEditors, setFilteredEditors] = useState<Editor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [selectedEditor, setSelectedEditor] = useState<Editor | null>(null);
  const [hireDialogOpen, setHireDialogOpen] = useState(false);
  const [hiring, setHiring] = useState(false);

  useEffect(() => {
    fetchEditors();
  }, []);

  useEffect(() => {
    filterEditors();
  }, [searchQuery, selectedExperience, editors]);

  const fetchEditors = async () => {
    try {
      setIsLoading(true);
      const data = await api.getEditors();
      setEditors(data.editors || []);
      setFilteredEditors(data.editors || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch editors');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEditors = () => {
    let filtered = editors;

    if (searchQuery) {
      filtered = filtered.filter(
        (editor) =>
          editor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          editor.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedExperience !== 'All') {
      filtered = filtered.filter((editor) => editor.experience === selectedExperience);
    }

    setFilteredEditors(filtered);
  };

  const handleHire = async () => {
    if (!selectedEditor) return;

    setHiring(true);
    try {
      await api.sendDirectRequest(selectedEditor.id);
      
      // Update local state
      setEditors(editors.map(ed => 
        ed.id === selectedEditor.id ? { ...ed, requestStatus: 'PENDING' } : ed
      ));
      
      setHireDialogOpen(false);
      setSelectedEditor(null);
    } catch (err: any) {
      console.error('Failed to send request:', err);
      // Optional: show error toast here
    } finally {
      setHiring(false);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Video Editors</h1>
          <p className="mt-2 text-gray-600">Browse talented editors and find the perfect match for your project</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full md:w-56">
                <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredEditors.length} {filteredEditors.length === 1 ? 'editor' : 'editors'}
          </p>
        </div>

        {/* Editors Grid */}
        {filteredEditors.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No editors found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEditors.map((editor) => (
              <Card key={editor.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={editor.avatar} alt={editor.name} />
                      <AvatarFallback className="bg-rose-100 text-rose-600 text-xl">
                        {editor.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{editor.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Briefcase className="h-4 w-4 mr-1 text-rose-500" />
                        <span>{editor.experience}</span>
                      </div>
                    </div>
                  </div>

                  {editor.bio && (
                    <p className="text-sm text-gray-600 mt-4 line-clamp-2">{editor.bio}</p>
                  )}

                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {editor.skills.slice(0, 4).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {editor.skills.length > 4 && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                          +{editor.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">{editor.availability}</span>
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEditor(editor);
                            setHireDialogOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedEditor(editor);
                            setHireDialogOpen(true);
                          }}
                          disabled={!!editor.requestStatus && editor.requestStatus !== 'NOT_HIRED'}
                          className={
                            editor.requestStatus === 'HIRED'
                              ? 'bg-green-500 hover:bg-green-600'
                              : editor.requestStatus === 'PENDING'
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : 'bg-rose-500 hover:bg-rose-600'
                          }
                          size="sm"
                        >
                          {editor.requestStatus === 'HIRED' ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Hired
                            </>
                          ) : editor.requestStatus === 'PENDING' ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              Requested
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-1" />
                              Hire
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Hire Dialog */}
        <Dialog open={hireDialogOpen} onOpenChange={setHireDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Hire Editor</DialogTitle>
              <DialogDescription>
                Are you sure you want to hire this editor for your project?
              </DialogDescription>
            </DialogHeader>

            {selectedEditor && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedEditor.avatar} alt={selectedEditor.name} />
                    <AvatarFallback className="bg-rose-100 text-rose-600">
                      {selectedEditor.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedEditor.name}</h4>
                    <p className="text-sm text-gray-600">{selectedEditor.experience} experience</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {selectedEditor.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setHireDialogOpen(false)} disabled={hiring}>
                Cancel
              </Button>
              <Button onClick={handleHire} disabled={hiring} className="bg-rose-500 hover:bg-rose-600">
                {hiring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Hire'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EditorListing;
