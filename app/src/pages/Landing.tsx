import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Film, Users, Briefcase, CheckCircle, ArrowRight, Star, Play, Edit3, Upload } from 'lucide-react';

const Landing: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (user?.role === 'editor') return '/editor/dashboard';
    if (user?.role === 'client') return '/client/dashboard';
    return '/';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-50 to-pink-100 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-rose-500 p-4 rounded-2xl">
                <Film className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Connect with Top{' '}
              <span className="text-rose-500">Video Editors</span>
            </h1>
            {isAuthenticated && (
              <div className="mb-8 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-rose-100 inline-block animate-in fade-in slide-in-from-bottom-4 duration-700">
                <p className="text-xl font-medium text-gray-900">
                  Hi {user?.name?.split(' ')[0]}! 👋 
                  <span className="block text-sm text-gray-500 font-normal mt-1">
                    You are logged in as a <span className="font-semibold text-rose-500 capitalize">{user?.role}</span>
                  </span>
                </p>
              </div>
            )}
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              EditlanceX is the premier platform connecting talented video editors with clients 
              who need professional editing services. Find work or hire editors effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to={getDashboardLink()}>
                  <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-lg px-8">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-lg px-8">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="text-lg px-8">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Simple steps to get started on EditlanceX</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-rose-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Create Account</h3>
                <p className="text-gray-600">
                  Sign up as a video editor or client. Choose your role and set up your profile in minutes.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Post or Apply</h3>
                <p className="text-gray-600">
                  Clients post jobs with requirements. Editors browse and apply to projects that match their skills.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Collaborate</h3>
                <p className="text-gray-600">
                  Connect with the right people, discuss details, and create amazing video content together.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Editors */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                For Video Editors
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Find exciting video editing projects that match your skills and schedule. 
                Build your portfolio and grow your freelance career.
              </p>
              <ul className="space-y-4">
                {[
                  'Browse diverse job opportunities',
                  'Showcase your skills and portfolio',
                  'Apply to projects with one click',
                  'Build your professional network',
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <CheckCircle className="h-5 w-5 text-rose-500 mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/signup">
                  <Button className="bg-rose-500 hover:bg-rose-600">
                    Join as Editor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <Edit3 className="h-8 w-8 text-rose-500 mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Video Editing</h4>
                <p className="text-sm text-gray-600">Wedding, corporate, YouTube & more</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm mt-8">
                <Play className="h-8 w-8 text-blue-500 mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Color Grading</h4>
                <p className="text-sm text-gray-600">Professional color correction</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <Star className="h-8 w-8 text-yellow-500 mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Motion Graphics</h4>
                <p className="text-sm text-gray-600">After Effects & animation</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm mt-8">
                <Upload className="h-8 w-8 text-green-500 mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Social Media</h4>
                <p className="text-sm text-gray-600">Reels, TikToks & shorts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Clients */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Find the Perfect Editor</h3>
                <p className="text-rose-100 mb-6">
                  Browse through our community of talented video editors and find the perfect match for your project.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-sm font-medium"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm">+500 editors ready to work</span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                For Clients
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Post your video editing projects and connect with skilled editors. 
                From weddings to corporate videos, find the right talent for your needs.
              </p>
              <ul className="space-y-4">
                {[
                  'Post jobs with detailed requirements',
                  'Browse editor profiles and portfolios',
                  'Hire editors that match your budget',
                  'Get professional results quickly',
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <CheckCircle className="h-5 w-5 text-rose-500 mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/signup">
                  <Button className="bg-rose-500 hover:bg-rose-600">
                    Join as Client
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Join thousands of editors and clients already using EditlanceX to create amazing video content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-lg px-8">
                Create Free Account
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 border-rose-200 text-rose-600 hover:bg-rose-50">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Film className="h-8 w-8 text-rose-500" />
              <span className="text-xl font-bold text-gray-900">EditlanceX</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <Link to="/login" className="hover:text-rose-500">Login</Link>
              <Link to="/signup" className="hover:text-rose-500">Sign Up</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} EditlanceX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
