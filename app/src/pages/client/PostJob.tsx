import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

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
    
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.category) {
      setError('Category is required');
      return;
    }
    if (!formData.videoType) {
      setError('Video type is required');
      return;
    }
    if (formData.software.length === 0) {
      setError('Please select at least one software');
      return;
    }
    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      setError('Valid budget is required');
      return;
    }
    if (!formData.deadline) {
      setError('Deadline is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.createJob({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        videoType: formData.videoType,
        software: formData.software,
        budget: parseFloat(formData.budget),
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center p-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Posted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your job has been posted and is now visible to video editors. You'll start receiving applications soon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/client/dashboard')} variant="outline">
                Go to Dashboard
              </Button>
              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setFormData({
                    title: '',
                    description: '',
                    category: '',
                    videoType: '',
                    software: [],
                    budget: '',
                    deadline: '',
                  });
                }}
                className="bg-rose-500 hover:bg-rose-600"
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/client/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
          <p className="mt-2 text-gray-600">Fill in the details below to find the perfect video editor</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Provide clear information to attract the right editors</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Job Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Wedding Video Editing - 30 minutes"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project, requirements, and what you're looking for in an editor..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={5}
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500">
                  Include details about footage length, style preferences, and deliverables
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Video Type */}
              <div className="space-y-2">
                <Label htmlFor="videoType">
                  Video Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.videoType}
                  onValueChange={(value) => handleChange('videoType', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a video type" />
                  </SelectTrigger>
                  <SelectContent>
                    {videoTypes.map((vt) => (
                      <SelectItem key={vt} value={vt}>
                        {vt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Software Selection */}
              <div className="space-y-3">
                <Label>
                  Required Software <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {softwareList.map((sw) => (
                    <div
                      key={sw}
                      onClick={() => !isSubmitting && toggleSoftware(sw)}
                      className={`
                        cursor-pointer px-4 py-2 rounded-md border text-sm text-center transition-all
                        ${formData.software.includes(sw)
                          ? 'bg-rose-50 border-rose-500 text-rose-700 font-medium shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300 hover:bg-rose-50/30'}
                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {sw}
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget and Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="budget">
                    Budget (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    min="1"
                    placeholder="e.g., 500"
                    value={formData.budget}
                    onChange={(e) => handleChange('budget', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">
                    Deadline <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    disabled={isSubmitting}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>
              )}

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/client/dashboard')}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-rose-500 hover:bg-rose-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
