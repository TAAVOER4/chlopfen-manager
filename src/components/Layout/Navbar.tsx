
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, Users, Award, BarChart, Settings, LogOut, LogIn } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isImpersonating, stopImpersonating, logout } = useUser();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: <BarChart className="w-5 h-5" /> },
    { name: 'Teilnehmer', href: '/participants', icon: <Users className="w-5 h-5" /> },
    { name: 'Bewertung', href: '/judging', icon: <Award className="w-5 h-5" /> },
    { name: 'Ergebnisse', href: '/results', icon: <BarChart className="w-5 h-5" /> },
    { name: 'Administration', href: '/admin', icon: <Settings className="w-5 h-5" /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const userRoleDisplay = currentUser?.role === 'admin' ? 'Administrator' : 'Richter';

  return (
    <nav className="bg-swiss-blue text-white">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold tracking-tight">Wettchlöpfen Manager</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => (
                  // Only show Admin link for admin users
                  (item.name !== 'Administration' || currentUser?.role === 'admin') && (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive(item.href)
                          ? 'bg-swiss-red text-white'
                          : 'text-gray-200 hover:bg-blue-800 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium flex items-center`}
                    >
                      {item.icon}
                      <span className="ml-2">{item.name}</span>
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-white flex gap-2 items-center bg-blue-800 px-3 py-1.5 rounded-full">
                    <User className="h-4 w-4" />
                    <span>{currentUser.name} ({userRoleDisplay})</span>
                  </div>
                  
                  {isImpersonating && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={stopImpersonating}
                      className="flex gap-2 items-center"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Zurück zu Admin
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex gap-2 items-center text-white hover:text-white hover:bg-blue-800"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Abmelden
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogin}
                  className="flex gap-2 items-center text-white hover:text-white hover:bg-blue-800"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Anmelden
                </Button>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              // Only show Admin link for admin users
              (item.name !== 'Administration' || currentUser?.role === 'admin') && (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-swiss-red text-white'
                      : 'text-gray-300 hover:bg-blue-800 hover:text-white'
                  } flex items-center px-3 py-2 rounded-md text-base font-medium`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              )
            ))}
            
            <div className="flex flex-col gap-2 pt-4 pb-2 border-t border-blue-700 mt-4">
              {currentUser ? (
                <>
                  <div className="px-3 text-sm text-gray-200">
                    Angemeldet als: {currentUser.name} ({userRoleDisplay})
                  </div>
                  
                  {isImpersonating && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        stopImpersonating();
                        setIsOpen(false);
                      }}
                      className="mx-2 flex gap-2 items-center"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Zurück zu Admin
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="mx-2 flex gap-2 items-center text-white"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Abmelden
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleLogin();
                    setIsOpen(false);
                  }}
                  className="mx-2 flex gap-2 items-center text-white"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Anmelden
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
