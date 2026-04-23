import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '@/services/api';
import { MAX_BUDGET_INR } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, CheckCircle, PlusCircle } from 'lucide-react';

const categories = [
  'Wedding',
  'YouTube',
  'Corporate',
  'Social Media',
  'Documentary',
  'Music Video',
  'Commercial',
  'Event',
  'Real Estate',
  'Other',
];

const videoTypes = ['Short Video (Reels/TikTok)', 'Long Video (YouTube/Doc)', 'Social Media Ad', 'Corporate Video', 'Other'];
const softwareList = ['Adobe Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'After Effects', 'CapCut', 'Other'];

const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    videoType: '',
    software: [] as string[],
    budget: '',
    deadline: '',
  });

  const handleChange = (field: string, value: any) => {
    if (field === 'budget') {
      const digits = String(value ?? '').replace(/\D/g, '').slice(0, 8);
      const n = digits ? Number(digits) : 0;
      const clamped = n > MAX_BUDGET_INR ? String(MAX_BUDGET_INR) : digits;
      setFormData((prev) => ({ ...prev, budget: clamped }));
      setError('');
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const toggleSoftware = (item: string) => {
    setFormData(prev => {
      const current = [...prev.software];
      const index = current.indexOf(item);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(item);
      }
      return { ...prev, software: current };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) { setError('Title is required'); return; }
    if (!formData.description.trim()) { setError('Description is required'); return; }
    if (!formData.category) { setError('Category is required'); return; }
    if (!formData.videoType) { setError('Video type is required'); return; }
    if (formData.software.length === 0) { setError('Please select at least one software'); return; }
    const budget = Number(formData.budget);
    if (!Number.isFinite(budget) || budget <= 0) { setError('Valid budget is required'); return; }
    if (budget > MAX_BUDGET_INR) { setError('Max budget allowed is ₹1 Cr'); return; }
    if (!formData.deadline) { setError('Deadline is required'); return; }

    setIsSubmitting(true);
    setError('');

    try {
      await api.createJob({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        videoType: formData.videoType,
        software: formData.software,
        budget,
        deadline: formData.deadline,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] py-8 flex items-center justify-center animate-in fade-in duration-500">
        <div className="max-w-2xl w-full px-4 sm:px-6 lg:px-8">
          <Card className="text-center p-12 bg-[#111] border-white/5 shadow-2xl rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-green-500/5 mix-blend-screen pointer-events-none"></div>
            <div className="mb-8 relative z-10">
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-4 relative z-10">Job Posted Successfully!</h2>
            <p className="text-gray-400 mb-10 text-lg relative z-10">
              Your job has been posted and is now visible to top video editors. You'll start receiving applications soon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Button onClick={() => navigate('/client/dashboard')} variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full h-12 px-8">
                Go to Dashboard
              </Button>
              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setFormData({ title: '', description: '', category: '', videoType: '', software: [], budget: '', deadline: '' });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 px-8 font-semibold shadow-lg shadow-blue-600/20"
              >
                Post Another Job
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8 animate-in fade-in duration-500 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/client/dashboard')}
            className="mb-6 text-gray-400 hover:text-white hover:bg-white/10 rounded-full pl-2 pr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="bg-[#111] rounded-3xl p-10 shadow-2xl border border-white/5 relative overflow-hidden mb-8 group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="bg-gradient-to-tr from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                <PlusCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1">
                  Post a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">New Job</span>
                </h1>
                <p className="text-gray-400 text-lg">Fill in the details below to find the perfect video editor</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 font-medium">
            {error}
          </div>
        )}

        <Card className="bg-[#111] border-white/5 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <CardHeader className="bg-white/[0.02] border-b border-white/5 pb-6">
            <CardTitle className="text-xl text-white">Job Details</CardTitle>
            <CardDescription className="text-gray-400">Provide clear information to attract the right editors</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-gray-300 font-semibold">Job Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  placeholder="e.g., Wedding Video Editing - 30 minutes"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  disabled={isSubmitting}
                  className="bg-white/5 border-white/10 text-white focus:border-blue-500/50 rounded-xl h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-gray-300 font-semibold">Description <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project, requirements, and what you're looking for in an editor..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={6}
                  disabled={isSubmitting}
                  className="bg-white/5 border-white/10 text-white focus:border-blue-500/50 rounded-xl resize-y"
                />
                <p className="text-sm text-gray-500">Include details about footage length, style preferences, and deliverables</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="category" className="text-gray-300 font-semibold">Category <span className="text-red-500">*</span></Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange('category', value)} disabled={isSubmitting}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-12">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-white/10 text-white">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="focus:bg-white/10 focus:text-white">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="videoType" className="text-gray-300 font-semibold">Video Type <span className="text-red-500">*</span></Label>
                  <Select value={formData.videoType} onValueChange={(value) => handleChange('videoType', value)} disabled={isSubmitting}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-12">
                      <SelectValue placeholder="Select a video type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-white/10 text-white">
                      {videoTypes.map((type) => (
                        <SelectItem key={type} value={type} className="focus:bg-white/10 focus:text-white">{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-300 font-semibold">Required Software <span className="text-red-500">*</span></Label>
                <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-xl border border-white/5">
                  {softwareList.map((software) => (
                    <Badge
                      key={software}
                      variant={formData.software.includes(software) ? 'default' : 'outline'}
                      className={`cursor-pointer px-4 py-1.5 text-sm ${
                        formData.software.includes(software)
                          ? 'bg-blue-600 hover:bg-blue-700 text-white border-none'
                          : 'bg-transparent border-white/20 text-gray-400 hover:text-white hover:border-white/40'
                      }`}
                      onClick={() => !isSubmitting && toggleSoftware(software)}
                    >
                      {software}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="budget" className="text-gray-300 font-semibold">Budget (₹) <span className="text-red-500">*</span></Label>
                  <Input
                    id="budget"
                    type="number"
                    min="1"
                    max={MAX_BUDGET_INR}
                    placeholder="e.g., 5000"
                    value={formData.budget}
                    onChange={(e) => handleChange('budget', e.target.value)}
                    disabled={isSubmitting}
                    className="bg-white/5 border-white/10 text-white focus:border-blue-500/50 rounded-xl h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="deadline" className="text-gray-300 font-semibold">Deadline <span className="text-red-500">*</span></Label>
                  <Input
                    id="deadline"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.deadline}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    disabled={isSubmitting}
                    className="bg-white/5 border-white/10 text-white focus:border-blue-500/50 rounded-xl h-12 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-full px-10 h-12 font-bold shadow-lg shadow-blue-600/20 text-lg transition-transform hover:scale-[1.02]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Job'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostJob;
