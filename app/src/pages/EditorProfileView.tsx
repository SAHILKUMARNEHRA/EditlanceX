import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, Briefcase, Clock, Mail, Phone, LinkIcon, User } from 'lucide-react';

interface Editor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio: string;
  skills: string[];
  experience: string;
  portfolioLinks: string[];
  availability: string;
}

const EditorProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEditor = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await api.getEditorById(id);
        setEditor(data.editor);
      } catch (err: any) {
        setError(err.message || 'Failed to load editor profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEditor();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (error || !editor) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mb-4">
          <User className="h-10 w-10 text-gray-600" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Editor not found</h2>
        <p className="text-gray-500 mb-6">{error || "This editor profile is no longer available."}</p>
        <Button onClick={() => navigate(-1)} className="bg-rose-600 hover:bg-rose-700 text-white rounded-full font-semibold px-8">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8 animate-in fade-in duration-500 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4 h-10 w-10 p-0 rounded-full text-gray-400 hover:text-white hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-white tracking-tight">Editor Profile</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <Card className="bg-[#111] border-white/5 rounded-3xl overflow-hidden">
              <CardContent className="p-8 text-center flex flex-col items-center">
                <Avatar className="h-32 w-32 border-4 border-white/10 mb-6">
                  <AvatarFallback className="bg-gradient-to-br from-rose-500 to-purple-600 text-white text-4xl font-bold">
                    {editor.name ? editor.name.charAt(0).toUpperCase() : 'E'}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold text-white mb-1">{editor.name}</h2>
                <p className="text-gray-400 mb-4 break-all text-sm">{editor.email}</p>

                <div className="w-full space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                    <Briefcase className="h-4 w-4 text-blue-400" />
                    <span>{editor.experience || 'Experience not specified'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                    <Clock className="h-4 w-4 text-green-400" />
                    <span>{editor.availability || 'Availability unknown'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-[#111] border-white/5 rounded-3xl">
              <CardHeader className="border-b border-white/5 bg-white/[0.02] pb-4">
                <CardTitle className="text-lg text-white">Contact</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Mail className="h-4 w-4 text-rose-400 shrink-0" />
                  <span className="break-all">{editor.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Phone className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{editor.phone || 'Not provided'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-[#111] border-white/5 rounded-3xl">
              <CardHeader className="border-b border-white/5 bg-white/[0.02] pb-4">
                <CardTitle className="text-xl text-white">About</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-400 whitespace-pre-wrap leading-relaxed">
                  {editor.bio || 'This editor has not added a bio yet.'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#111] border-white/5 rounded-3xl">
              <CardHeader className="border-b border-white/5 bg-white/[0.02] pb-4">
                <CardTitle className="text-xl text-white">Skills</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {editor.skills && editor.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {editor.skills.map((skill, i) => (
                      <Badge key={i} variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No skills listed.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#111] border-white/5 rounded-3xl">
              <CardHeader className="border-b border-white/5 bg-white/[0.02] pb-4">
                <CardTitle className="text-xl text-white">Portfolio</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {editor.portfolioLinks && editor.portfolioLinks.length > 0 ? (
                  <div className="space-y-3">
                    {editor.portfolioLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.startsWith('http') ? link : `https://${link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 break-all"
                      >
                        <LinkIcon className="h-4 w-4 shrink-0" />
                        {link}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No portfolio links added.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorProfileView;
