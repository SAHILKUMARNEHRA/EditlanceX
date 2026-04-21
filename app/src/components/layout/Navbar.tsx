import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Film, User, LogOut, LayoutDashboard, ShieldCheck, Bell } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin' || user?.email === 'sk.nehra2005@gmail.com';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (user?.role === 'editor') return '/editor/dashboard';
    if (user?.role === 'client') return '/client/dashboard';
    return '/';
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0A0A0A]/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-rose-500" />
            <span className="text-xl font-bold text-white">EditlanceX</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/requests">
                  <Button variant="ghost" size="sm" className="hidden sm:flex text-gray-300 hover:text-white hover:bg-white/10">
                    <Bell className="h-4 w-4 mr-2" />
                    Requests
                  </Button>
                </Link>
                <Link to={getDashboardLink()}>
                  <Button variant="ghost" size="sm" className="hidden sm:flex text-gray-300 hover:text-white hover:bg-white/10">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="hidden sm:flex border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
                      <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-rose-500/20 text-rose-400">
                          {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-[#111] border-white/10 text-white" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-white">{user?.name}</p>
                        <p className="text-sm text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                      <Link to="/requests" className="sm:hidden">
                        <Bell className="mr-2 h-4 w-4" />
                        Requests
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                      <Link to={getDashboardLink()}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer text-rose-400 font-semibold">
                        <Link to="/admin">
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'editor' && (
                      <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                        <Link to="/editor/profile">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
