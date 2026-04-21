import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, X, Camera, Briefcase, Link as LinkIcon, Clock, IndianRupee, Calendar, User, PartyPopper, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProfileData {
  name: string;
  email: string;
  avatar?: string;
  bio: string;
  skills: string[];
  experience: string;
  experienceDetails?: string;
  portfolioLinks: string[];
  availability: string;
}

const EditorProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newPortfolioLink, setNewPortfolioLink] = useState('');
  const [validationError, setValidationError] = useState('');
  const [hiringAlert, setHiringAlert] = useState<{ type: 'HIRED' | 'NOT_HIRED', jobTitle: string } | null>(null);

  const isSetupMode = new URLSearchParams(location.search).get('setup') === 'true';

  const skillOptions = [
    'Adobe Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Final Cut Pro', 
    'CapCut', 'Color Grading', 'Sound Design', 'Motion Graphics', 
    'VFX', '3D Animation', 'Subtitle/Captioning', 'Storytelling',
    'Thumbnails Design', 'Script Writing', 'Stock Footage Sourcing'
  ];

  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    email: '',
    avatar: '',
    bio: '',
    skills: [],
    experience: '',
    experienceDetails: '',
    portfolioLinks: [],
    availability: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    // Check for status updates
    const hiredJob = appliedJobs.find(job => job.status === 'HIRED');
    const rejectedJob = appliedJobs.find(job => job.status === 'NOT_HIRED');
    
    if (hiredJob) {
      setHiringAlert({ type: 'HIRED', jobTitle: hiredJob.title });
    } else if (rejectedJob) {
      setHiringAlert({ type: 'NOT_HIRED', jobTitle: rejectedJob.title });
    }
  }, [appliedJobs]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const [profileData, appliedJobsData] = await Promise.all([
        api.getEditorProfile(),
        api.getAppliedJobs()
      ]);
      
      setProfile(profileData.profile);
      setFormData(profileData.profile);
      setAppliedJobs(appliedJobsData.jobs || []);
      
      // If in setup mode and profile is empty, start editing automatically
      if (isSetupMode && (!profileData.profile.bio || profileData.profile.skills.length === 0)) {
        setIsEditing(true);
      }
    } catch (err: any) {
      // Initialize with default values if no profile exists
      const defaultProfile = {
        name: user?.name || '',
        email: user?.email || '',
        avatar: '',
        bio: '',
        skills: [],
        experience: '',
        experienceDetails: '',
        portfolioLinks: [],
        availability: '',
      };
      setProfile(defaultProfile);
      setFormData(defaultProfile);
      
      if (isSetupMode) {
        setIsEditing(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setValidationError('');
    
    // Validation
    if (!formData.bio || formData.bio.trim().split(/\\s+/).length < 20) {
      setValidationError('Please provide a bio with at least 20 words.');
      return;
    }
    if (formData.skills.length === 0) {
      setValidationError('Please select at least one skill.');
      return;
    }
    if (!formData.experience) {
      setValidationError('Please select your experience level.');
      return;
    }
    if (!formData.availability) {
      setValidationError('Please select your availability.');
      return;
    }
    if (formData.portfolioLinks.length === 0) {
      setValidationError('Please add at least one portfolio link.');
      return;
    }

    setIsSaving(true);
    try {
      await api.updateEditorProfile(formData);
      setProfile(formData);
      setIsEditing(false);
      if (isSetupMode) {
        navigate('/editor/dashboard');
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      // Fallback for user experience if API fails but we want to show updated state
      setProfile(formData);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => {
      const current = [...prev.skills];
      const index = current.indexOf(skill);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(skill);
      }
      return { ...prev, skills: current };
    });
  };

  const addPortfolioLink = () => {
    if (newPortfolioLink.trim() && !formData.portfolioLinks.includes(newPortfolioLink.trim())) {
      setFormData({ ...formData, portfolioLinks: [...formData.portfolioLinks, newPortfolioLink.trim()] });
      setNewPortfolioLink('');
    }
  };

  const removePortfolioLink = (linkToRemove: string) => {
    setFormData({
      ...formData,
      portfolioLinks: formData.portfolioLinks.filter((link) => link !== linkToRemove),
    });
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Notifications */}
        {hiringAlert && (
          <Alert className={`mb-6 border-2 ${hiringAlert.type === 'HIRED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            {hiringAlert.type === 'HIRED' ? (
              <PartyPopper className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <AlertTitle className={`font-bold ${hiringAlert.type === 'HIRED' ? 'text-green-800' : 'text-red-800'}`}>
              {hiringAlert.type === 'HIRED' ? 'Congratulations!' : 'Application Update'}
            </AlertTitle>
            <AlertDescription className={hiringAlert.type === 'HIRED' ? 'text-green-700' : 'text-red-700'}>
              {hiringAlert.type === 'HIRED' 
                ? `You have been hired for "${hiringAlert.jobTitle}"! The client will contact you soon.`
                : `The application for "${hiringAlert.jobTitle}" was not successful this time. Keep applying!`}
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-4 h-auto p-0 underline hover:bg-transparent" 
                onClick={() => setHiringAlert(null)}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Setup Mode Banner */}
        {isSetupMode && (
          <div className="mb-6 bg-rose-50 border border-rose-200 p-4 rounded-lg flex items-start space-x-3">
            <div className="bg-rose-100 p-2 rounded-full">
              <User className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <h3 className="font-semibold text-rose-900">Welcome to EditlanceX!</h3>
              <p className="text-sm text-rose-700">
                To start applying for jobs, you must complete your profile. Please provide your bio, skills, experience, and portfolio links.
              </p>
            </div>
          </div>
        )}

        {/* Validation Error */}
        {validationError && (
          <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg text-sm text-red-600">
            {validationError}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-2 text-gray-600">Manage your editor profile and portfolio</p>
          </div>
          <Button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={isSaving}
            className={isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-rose-500 hover:bg-rose-600'}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Edit Profile'
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6 text-center">
              <div className="relative inline-block">
                <Avatar className="h-32 w-32 mx-auto">
                  <AvatarImage src={profile?.avatar} alt={profile?.name} />
                  <AvatarFallback className="bg-rose-100 text-rose-600 text-4xl">
                    {profile?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <h2 className="mt-4 text-xl font-semibold text-gray-900">{profile?.name}</h2>
              <p className="text-sm text-gray-500">{profile?.email}</p>
              
              <div className="mt-4 flex items-center justify-center gap-2">
                <Badge variant="secondary" className="bg-rose-50 text-rose-600">
                  Video Editor
                </Badge>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4 text-left">
                <div className="flex items-center text-sm">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">{profile?.experience} experience</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">{profile?.availability}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Your professional information and skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bio */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Bio <span className="text-red-500">*</span></Label>
                {isEditing ? (
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="mt-2"
                    rows={4}
                    placeholder="Tell clients about yourself..."
                  />
                ) : (
                  <p className="mt-2 text-gray-600">{profile?.bio || 'No bio added yet'}</p>
                )}
              </div>

              <Separator />

              {/* Skills */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Skills <span className="text-red-500">*</span></Label>
                {isEditing ? (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {skillOptions.map((skill) => (
                      <div
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`
                          cursor-pointer px-3 py-2 rounded-md border text-xs text-center transition-all
                          ${formData.skills.includes(skill)
                            ? 'bg-rose-50 border-rose-500 text-rose-700 font-medium shadow-sm'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300 hover:bg-rose-50/30'}
                        `}
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile?.skills?.length ? (
                      profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-400">No skills added yet</span>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Experience */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Experience <span className="text-red-500">*</span></Label>
                {isEditing ? (
                  <Select
                    value={formData.experience}
                    onValueChange={(value) => setFormData({ ...formData, experience: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Less than 1 year">Less than 1 year</SelectItem>
                      <SelectItem value="1-2 years">1-2 years</SelectItem>
                      <SelectItem value="3-5 years">3-5 years</SelectItem>
                      <SelectItem value="5+ years">5+ years</SelectItem>
                      <SelectItem value="10+ years">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-2 text-gray-600">{profile?.experience || 'Not specified'}</p>
                )}
              </div>

              <Separator />

              {/* Experience Details */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Detailed Experience</Label>
                {isEditing ? (
                  <Textarea
                    className="mt-2"
                    placeholder="Tell us more about your experience, past projects, and achievements..."
                    value={formData.experienceDetails}
                    onChange={(e) => setFormData({ ...formData, experienceDetails: e.target.value })}
                    rows={4}
                  />
                ) : (
                  <p className="mt-2 text-gray-600">
                    {profile?.experienceDetails || 'No additional experience details provided.'}
                  </p>
                )}
              </div>

              <Separator />

              {/* Availability */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Availability <span className="text-red-500">*</span></Label>
                {isEditing ? (
                  <Select
                    value={formData.availability}
                    onValueChange={(value) => setFormData({ ...formData, availability: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                      <SelectItem value="Weekends only">Weekends only</SelectItem>
                      <SelectItem value="Not available">Not available</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-2 text-gray-600">{profile?.availability || 'Not specified'}</p>
                )}
              </div>

              <Separator />

              {/* Portfolio Links */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Portfolio Links <span className="text-red-500">*</span></Label>
                {isEditing ? (
                  <div className="mt-2">
                    <div className="space-y-2 mb-3">
                      {formData.portfolioLinks.map((link, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <span className="text-sm text-gray-600 truncate">{link}</span>
                          <button
                            onClick={() => removePortfolioLink(link)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newPortfolioLink}
                        onChange={(e) => setNewPortfolioLink(e.target.value)}
                        placeholder="https://..."
                        onKeyPress={(e) => e.key === 'Enter' && addPortfolioLink()}
                      />
                      <Button type="button" onClick={addPortfolioLink} variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    {profile?.portfolioLinks?.length ? (
                      profile.portfolioLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-rose-500 hover:text-rose-600"
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          {link}
                        </a>
                      ))
                    ) : (
                      <span className="text-gray-400">No portfolio links added yet</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Jobs Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Jobs</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {appliedJobs.length} Applications
            </Badge>
          </div>

          {appliedJobs.length === 0 ? (
            <Card className="p-12 text-center bg-gray-50/50 border-dashed">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-500 mb-6">Start applying to jobs to build your portfolio</p>
              <Button onClick={() => navigate('/editor/jobs')} className="bg-rose-500 hover:bg-rose-600">
                Browse Jobs
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appliedJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
                      <Badge className="bg-green-100 text-green-700">Applied</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{job.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-green-600 font-medium">
                        <IndianRupee className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate" title={job.budget.toString()}>
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 0,
                            notation: 'compact',
                          }).format(job.budget)}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(job.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Status: <span className="font-semibold text-rose-500">{job.status || 'PENDING'}</span>
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-rose-500 p-0 h-auto hover:bg-transparent"
                        onClick={() => navigate(`/editor/dashboard?jobId=${job.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorProfile;
