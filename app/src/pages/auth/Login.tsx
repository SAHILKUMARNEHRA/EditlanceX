import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Film, Loader2, Chrome, User, Briefcase } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'editor' | 'client'>('editor');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password, role);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setIsLoading(true);
      try {
        await googleLogin(tokenResponse.access_token, role);
        navigate('/');
      } catch (err: any) {
        setError(err.message || 'Google login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google login failed. Please try again.');
    },
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-white">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000 pointer-events-none"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="bg-gradient-to-tr from-rose-500 to-purple-600 p-3 rounded-2xl shadow-lg">
            <Film className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Sign in to your account to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="bg-[#111] border-white/10 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl">
          <CardHeader className="border-b border-white/5 bg-white/[0.02] pb-6">
            <CardTitle className="text-xl text-white">Sign In</CardTitle>
            <CardDescription className="text-gray-400">Choose your role and enter credentials</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-gray-300 font-semibold uppercase tracking-wider text-xs">I want to log in as</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(value) => setRole(value as 'editor' | 'client')}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="editor" id="editor" className="peer sr-only" disabled={isLoading} />
                    <Label
                      htmlFor="editor"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-white/10 bg-white/5 p-4 hover:bg-white/10 peer-data-[state=checked]:border-rose-500 peer-data-[state=checked]:bg-rose-500/10 cursor-pointer transition-all"
                    >
                      <User className={`mb-2 h-6 w-6 ${role === 'editor' ? 'text-rose-400' : 'text-gray-400'}`} />
                      <span className={`text-sm font-semibold ${role === 'editor' ? 'text-white' : 'text-gray-400'}`}>Editor</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="client" id="client" className="peer sr-only" disabled={isLoading} />
                    <Label
                      htmlFor="client"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-white/10 bg-white/5 p-4 hover:bg-white/10 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-500/10 cursor-pointer transition-all"
                    >
                      <Briefcase className={`mb-2 h-6 w-6 ${role === 'client' ? 'text-purple-400' : 'text-gray-400'}`} />
                      <span className={`text-sm font-semibold ${role === 'client' ? 'text-white' : 'text-gray-400'}`}>Client</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email address <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-white/5 border-white/10 text-white focus:border-rose-500/50 rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password <span className="text-red-500">*</span></Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-white/5 border-white/10 text-white focus:border-rose-500/50 rounded-xl h-12"
                />
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className={`w-full ${role === 'client' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'} text-white rounded-full h-12 font-bold shadow-lg transition-transform hover:scale-[1.02]`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="bg-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-[#111] text-gray-500 uppercase tracking-wider font-semibold text-xs">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-6 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-full h-12 font-semibold"
                onClick={() => handleGoogleLogin()}
                disabled={isLoading}
              >
                <Chrome className="mr-2 h-5 w-5 text-blue-400" />
                Google
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-white/5 bg-white/[0.02] py-4">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className={`font-semibold ${role === 'client' ? 'text-purple-400 hover:text-purple-300' : 'text-rose-400 hover:text-rose-300'}`}>
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
