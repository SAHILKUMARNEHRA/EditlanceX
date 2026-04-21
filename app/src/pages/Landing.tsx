import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Film, Users, Briefcase, CheckCircle, ArrowRight, Star, Play, Edit3, Upload } from 'lucide-react';

const Landing: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (user?.role === 'editor') return '/editor/dashboard';
    if (user?.role === 'client') return '/client/dashboard';
    return '/';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-36 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-tr from-rose-500 to-purple-600 p-5 rounded-2xl transform hover:scale-110 transition-all duration-500 shadow-2xl shadow-rose-500/20">
                <Film className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6">
              Connect with Top{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500">Video Editors</span>
            </h1>
            {isAuthenticated && (
              <div className="mb-10 p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 inline-block animate-in fade-in slide-in-from-bottom-4 duration-700">
                <p className="text-xl font-medium text-white">
                  Welcome back, {user?.name?.split(' ')[0]}! 🚀 
                  <span className="block text-sm text-gray-400 font-normal mt-2">
                    Accessing as a <span className="font-semibold text-rose-400 capitalize">{user?.role}</span>
                  </span>
                </p>
              </div>
            )}
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
              The premier marketplace connecting visionary creators with elite video editing talent. 
              Transform your raw footage into cinematic masterpieces.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              {isAuthenticated ? (
                <Link to={getDashboardLink()}>
                  <Button size="lg" className="bg-white text-black hover:bg-gray-200 text-lg px-8 h-14 rounded-full font-semibold transition-transform hover:scale-105">
                    Launch Workspace
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <Button size="lg" className="bg-white text-black hover:bg-gray-200 text-lg px-8 h-14 rounded-full font-semibold transition-transform hover:scale-105">
                      Start Creating
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="text-lg px-8 h-14 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold transition-transform hover:scale-105">
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
      <section className="py-24 bg-black border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">How It Works</h2>
            <p className="text-xl text-gray-400 font-light">Your journey to perfect content in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-[#111] border-white/10 text-center hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 group">
              <CardContent className="pt-10 pb-10">
                <div className="w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all duration-500">
                  <Users className="h-10 w-10 text-rose-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">1. Create Profile</h3>
                <p className="text-gray-400 leading-relaxed">
                  Join as a creator or an editor. Build a stunning portfolio that showcases your unique style.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#111] border-white/10 text-center hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 group">
              <CardContent className="pt-10 pb-10">
                <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-500">
                  <Briefcase className="h-10 w-10 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">2. Match</h3>
                <p className="text-gray-400 leading-relaxed">
                  Post requirements or browse opportunities. Our platform connects the right talent instantly.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#111] border-white/10 text-center hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 group">
              <CardContent className="pt-10 pb-10">
                <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500">
                  <CheckCircle className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">3. Collaborate</h3>
                <p className="text-gray-400 leading-relaxed">
                  Work together seamlessly. Deliver high-quality edits and build long-lasting partnerships.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Editors */}
      <section className="py-24 bg-[#0A0A0A] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-rose-900/10 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
              <Badge className="bg-rose-500/10 text-rose-400 mb-6 px-4 py-1.5 rounded-full border-rose-500/20 text-sm font-semibold">For Editors</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                Turn your passion into <br/>a <span className="text-rose-500">thriving career</span>
              </h2>
              <p className="text-xl text-gray-400 mb-10 font-light leading-relaxed">
                Stop hunting for clients and start creating. Get matched with premium brands and creators who value your unique editing style.
              </p>
              <ul className="space-y-5 mb-10">
                {[
                  'Access high-paying, exclusive projects',
                  'Build a stunning, interactive portfolio',
                  'Direct communication with clients',
                  'Grow your freelance business fast',
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-300 text-lg">
                    <div className="mr-4 bg-rose-500/20 p-1 rounded-full">
                      <CheckCircle className="h-5 w-5 text-rose-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button className="bg-rose-600 hover:bg-rose-700 text-white px-8 h-14 rounded-full text-lg font-semibold transition-transform hover:scale-105 shadow-lg shadow-rose-600/20">
                  Apply as Editor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="bg-[#111] p-8 rounded-2xl border border-white/5 hover:border-rose-500/30 transition-all duration-500 hover:-translate-y-2 group">
                <Edit3 className="h-10 w-10 text-rose-500 mb-5 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold text-white mb-2">Video Editing</h4>
                <p className="text-gray-400 font-light">Cinematic, Corporate, YouTube</p>
              </div>
              <div className="bg-[#111] p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all duration-500 mt-12 hover:-translate-y-2 group">
                <Play className="h-10 w-10 text-blue-500 mb-5 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold text-white mb-2">Color Grading</h4>
                <p className="text-gray-400 font-light">Professional DaVinci Resolve</p>
              </div>
              <div className="bg-[#111] p-8 rounded-2xl border border-white/5 hover:border-yellow-500/30 transition-all duration-500 hover:-translate-y-2 group">
                <Star className="h-10 w-10 text-yellow-500 mb-5 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold text-white mb-2">Motion FX</h4>
                <p className="text-gray-400 font-light">After Effects & 3D Animation</p>
              </div>
              <div className="bg-[#111] p-8 rounded-2xl border border-white/5 hover:border-green-500/30 transition-all duration-500 mt-12 hover:-translate-y-2 group">
                <Upload className="h-10 w-10 text-green-500 mb-5 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold text-white mb-2">Social Media</h4>
                <p className="text-gray-400 font-light">High-retention TikToks & Reels</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Clients */}
      <section className="py-24 bg-black border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 animate-in fade-in slide-in-from-left-8 duration-1000 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 blur-3xl rounded-full"></div>
              <div className="bg-[#111] border border-white/10 rounded-3xl p-10 text-white shadow-2xl relative z-10 hover:border-purple-500/30 transition-colors duration-500">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
                  <h3 className="text-2xl font-bold">Top Talent Pool</h3>
                  <Badge className="bg-purple-500/20 text-purple-300 border-none">Verified</Badge>
                </div>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/5">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-lg">
                        {String.fromCharCode(64 + i)}
                      </div>
                      <div>
                        <div className="h-4 w-32 bg-white/20 rounded mb-2"></div>
                        <div className="h-3 w-24 bg-white/10 rounded"></div>
                      </div>
                      <div className="ml-auto flex space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 animate-in fade-in slide-in-from-right-8 duration-1000">
              <Badge className="bg-purple-500/10 text-purple-400 mb-6 px-4 py-1.5 rounded-full border-purple-500/20 text-sm font-semibold">For Creators & Brands</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                Hire world-class editors <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">on demand</span>
              </h2>
              <p className="text-xl text-gray-400 mb-10 font-light leading-relaxed">
                Scale your content production effortlessly. Post a job, review stunning portfolios, and hire the perfect editor for your exact vision.
              </p>
              <ul className="space-y-5 mb-10">
                {[
                  'Post projects and get pitches instantly',
                  'Review highly-curated video portfolios',
                  'Find specialists for any video format',
                  'Secure, streamlined collaboration',
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-300 text-lg">
                    <div className="mr-4 bg-purple-500/20 p-1 rounded-full">
                      <CheckCircle className="h-5 w-5 text-purple-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/signup">
                  <Button className="bg-white text-black hover:bg-gray-200 px-8 h-14 rounded-full text-lg font-semibold transition-transform hover:scale-105">
                    Hire an Editor
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] to-[#111]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-96 bg-rose-600/20 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
            Ready to elevate your <br/>video content?
          </h2>
          <p className="text-2xl text-gray-400 mb-12 font-light">
            Join the fastest-growing network of elite video professionals today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white text-xl px-10 h-16 rounded-full font-bold shadow-2xl shadow-rose-600/30 transition-transform hover:scale-105">
                Create Free Account
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-xl px-10 h-16 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white font-bold transition-transform hover:scale-105 backdrop-blur-sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="bg-white/10 p-2 rounded-xl">
                <Film className="h-8 w-8 text-rose-500" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">EditlanceX</span>
            </div>
            <div className="flex space-x-8 text-gray-400 font-medium">
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
              <Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            </div>
          </div>
          <div className="mt-12 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} EditlanceX. Designed for Creators.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
