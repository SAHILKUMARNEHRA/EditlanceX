import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, Camera, Briefcase, Link as LinkIcon, PartyPopper, XCircle, ArrowLeft, Clock } from 'lucide-react';
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
      
      if (isSetupMode && (!profileData.profile.bio || profileData.profile.skills.length === 0)) {
        setIsEditing(true);
      }
    } catch (err: any) {
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
      if (isSetupMode) setIsEditing(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.bio || formData.bio.trim().split(/\s+/).length < 20) {
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

    setValidationError('');
    setIsSaving(true);
    
    try {
      const updatedProfile = await api.updateEditorProfile(formData);
      setProfile(updatedProfile.profile);
      setIsEditing(false);
      
      if (isSetupMode) {
        navigate('/editor/dashboard');
      }
    } catch (err: any) {
      setValidationError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const addPortfolioLink = () => {
    if (newPortfolioLink && !formData.portfolioLinks.includes(newPortfolioLink)) {
      setFormData({
        ...formData,
        portfolioLinks: [...formData.portfolioLinks, newPortfolioLink]
      });
      setNewPortfolioLink('');
    }
  };

  const removePortfolioLink = (link: string) => {
    setFormData({
      ...formData,
      portfolioLinks: formData.portfolioLinks.filter(l => l !== link)
    });
  };

  const toggleSkill = (skill: string) => {
    if (formData.skills.includes(skill)) {
      setFormData({
        ...formData,
        skills: formData.skills.filter(s => s !== skill)
      });
    } else {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill]
      });
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
        
        {hiringAlert && (
          <Alert className={`mb-8 border relative overflow-hidden p-6 rounded-3xl shadow-2xl ${hiringAlert.type === 'HIRED' ? 'bg-gradient-to-br from-green-900/40 to-[#111] border-green-500/30' : 'bg-gradient-to-br from-red-900/40 to-[#111] border-red-500/30'}`}>
            <div className="absolute right-0 top-0 w-1/3 h-full opacity-30 pointer-events-none">
              <img 
                src={hiringAlert.type === 'HIRED' 
                  ? 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=3d%20render%20of%20golden%20confetti%20and%20party%20popper%20celebration%20cinematic%20lighting&image_size=landscape_16_9' 
                  : 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=3d%20render%20of%20closed%20door%20with%20subtle%20red%20neon%20light%20cinematic&image_size=landscape_16_9'} 
                alt="Background" 
                className="w-full h-full object-cover mix-blend-screen"
              />
            </div>
            <div className="relative z-10 flex items-start gap-4">
              {hiringAlert.type === 'HIRED' ? (
                <div className="bg-green-500/20 p-3 rounded-2xl border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                  <PartyPopper className="h-8 w-8 text-green-400" />
                </div>
              ) : (
                <div className="bg-red-500/20 p-3 rounded-2xl border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
              )}
              <div className="flex-1">
                <AlertTitle className={`text-2xl font-extrabold tracking-tight mb-2 ${hiringAlert.type === 'HIRED' ? 'text-green-400' : 'text-red-400'}`}>
                  {hiringAlert.type === 'HIRED' ? 'Congratulations! You Got the Job! 🎉' : 'Application Update'}
                </AlertTitle>
                <AlertDescription className="text-gray-300 text-lg flex items-center justify-between">
                  <span>
                    {hiringAlert.type === 'HIRED' 
                      ? `You have been officially hired for "${hiringAlert.jobTitle}". The client will contact you shortly.`
                      : `The application for "${hiringAlert.jobTitle}" was not successful this time. Keep applying!`}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-4 h-10 px-6 rounded-full border-white/20 hover:bg-white/10 text-white shadow-lg backdrop-blur-md" 
                    onClick={() => setHiringAlert(null)}
                  >
                    Dismiss
                  </Button>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4 h-10 w-10 p-0 rounded-full text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-white tracking-tight">Your Profile</h1>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="bg-rose-600 hover:bg-rose-700 text-white rounded-full font-semibold">
              Edit Profile
            </Button>
          )}
        </div>

        {validationError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 font-medium">
            {validationError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar / Photo */}
          <div className="md:col-span-1 space-y-6">
            <Card className="bg-[#111] border-white/5 rounded-3xl overflow-hidden">
              <CardContent className="p-8 text-center flex flex-col items-center">
                <div className="relative mb-6">
                  <Avatar className="h-32 w-32 border-4 border-white/10">
                    <AvatarImage src={formData.avatar} alt={formData.name} />
                    <AvatarFallback className="bg-gradient-to-br from-rose-500 to-purple-600 text-white text-4xl font-bold">
                      {formData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button size="icon" className="absolute bottom-0 right-0 rounded-full bg-rose-600 hover:bg-rose-700 text-white border-4 border-[#111]">
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{formData.name}</h2>
                <p className="text-gray-400 mb-4">{formData.email}</p>
                
                {!isEditing && (
                  <div className="w-full space-y-3 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                      <Briefcase className="h-4 w-4 text-blue-400" />
                      <span>{formData.experience} Editor</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                      <Clock className="h-4 w-4 text-green-400" />
                      <span>{formData.availability}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-[#111] border-white/5 rounded-3xl">
              <CardHeader className="border-b border-white/5 bg-white/[0.02] pb-4">
                <CardTitle className="text-xl text-white">About You</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-gray-300">Professional Bio <span className="text-red-500">*</span></Label>
                      <Textarea 
                        id="bio" 
                        placeholder="Tell clients about your editing style, niche, and what makes you unique. (Minimum 20 words)" 
                        className="min-h-[150px] bg-white/5 border-white/10 text-white focus:border-rose-500/50 rounded-xl"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      />
                      <p className="text-xs text-gray-500 text-right">
                        {formData.bio.trim().split(/\s+/).filter(w => w.length > 0).length} / 20 words minimum
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Experience Level <span className="text-red-500">*</span></Label>
                        <Select value={formData.experience} onValueChange={(val) => setFormData({...formData, experience: val})}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111] border-white/10 text-white">
                            <SelectItem value="Beginner" className="focus:bg-white/10">Beginner (0-2 years)</SelectItem>
                            <SelectItem value="Intermediate" className="focus:bg-white/10">Intermediate (2-5 years)</SelectItem>
                            <SelectItem value="Expert" className="focus:bg-white/10">Expert (5+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Availability <span className="text-red-500">*</span></Label>
                        <Select value={formData.availability} onValueChange={(val) => setFormData({...formData, availability: val})}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111] border-white/10 text-white">
                            <SelectItem value="Full-time" className="focus:bg-white/10">Full-time</SelectItem>
                            <SelectItem value="Part-time" className="focus:bg-white/10">Part-time</SelectItem>
                            <SelectItem value="Freelance" className="focus:bg-white/10">Freelance (Project based)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Skills & Software <span className="text-red-500">*</span></Label>
                      <div className="flex flex-wrap gap-2 mt-2 bg-white/5 p-4 rounded-xl border border-white/5">
                        {skillOptions.map(skill => (
                          <Badge 
                            key={skill}
                            variant={formData.skills.includes(skill) ? 'default' : 'outline'}
                            className={`cursor-pointer px-3 py-1 text-sm ${
                              formData.skills.includes(skill) 
                                ? 'bg-rose-600 hover:bg-rose-700 border-none' 
                                : 'bg-transparent border-white/20 text-gray-400 hover:text-white hover:border-white/40'
                            }`}
                            onClick={() => toggleSkill(skill)}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Portfolio Links</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="https://youtube.com/..." 
                          value={newPortfolioLink}
                          onChange={(e) => setNewPortfolioLink(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPortfolioLink())}
                          className="bg-white/5 border-white/10 text-white rounded-xl"
                        />
                        <Button type="button" onClick={addPortfolioLink} className="bg-white/10 text-white hover:bg-white/20 rounded-xl px-6">
                          Add
                        </Button>
                      </div>
                      
                      {formData.portfolioLinks.length > 0 && (
                        <div className="flex flex-col gap-2 mt-4">
                          {formData.portfolioLinks.map((link, i) => (
                            <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                              <span className="text-sm text-blue-400 truncate flex-1 flex items-center">
                                <LinkIcon className="h-3 w-3 mr-2 text-gray-500" />
                                {link}
                              </span>
                              <Button variant="ghost" size="sm" onClick={() => removePortfolioLink(link)} className="h-8 w-8 p-0 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Bio</h3>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap bg-white/5 p-5 rounded-2xl border border-white/5">
                        {profile?.bio || <span className="text-gray-600 italic">No bio provided. Click edit to add one.</span>}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile?.skills && profile.skills.length > 0 ? (
                          profile.skills.map(skill => (
                            <Badge key={skill} className="bg-rose-500/10 text-rose-400 border-none px-3 py-1 text-sm">{skill}</Badge>
                          ))
                        ) : (
                          <span className="text-gray-600 italic">No skills listed</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Portfolio</h3>
                      {profile?.portfolioLinks && profile.portfolioLinks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {profile.portfolioLinks.map((link, i) => (
                            <a 
                              key={i} 
                              href={link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
                            >
                              <div className="bg-blue-500/20 p-2 rounded-lg mr-3 group-hover:bg-blue-500/30 transition-colors">
                                <LinkIcon className="h-4 w-4 text-blue-400" />
                              </div>
                              <span className="text-sm text-gray-300 group-hover:text-white truncate">
                                {link.replace(/^https?:\/\//, '')}
                              </span>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-600 italic">No portfolio links added</span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              {isEditing && (
                <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3 rounded-b-3xl">
                  {!isSetupMode && (
                    <Button variant="outline" onClick={() => { setIsEditing(false); setFormData(profile || formData); }} className="border-white/20 text-white hover:bg-white/10 rounded-full px-6">
                      Cancel
                    </Button>
                  )}
                  <Button onClick={handleSave} disabled={isSaving} className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-8 font-semibold shadow-lg shadow-rose-600/20">
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Profile
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorProfile;
