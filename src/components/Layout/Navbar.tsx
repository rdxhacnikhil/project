import React, { useState } from 'react';
import { Menu, LogOut, User, Settings, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

interface NavbarProps {
  onSidebarToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSidebarToggle }) => {
  const { profile, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const handleBack = () => {
    if (location.pathname === '/admin') {
      navigate('/'); // Go to landing page from admin dashboard
    } else {
      navigate(-1); // Go back to previous page for other pages
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Show back button on all pages except landing page
  const showBackButton = location.pathname !== '/';

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 mr-2"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          
          {showBackButton && (
            <button
              onClick={handleBack}
              className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="font-medium">Back</span>
            </button>
          )}
          
          <button
            onClick={() => navigate('/')}
            className="text-lg font-semibold text-blue-600 lg:hidden hover:text-blue-700 transition-colors cursor-pointer"
          >
            EventHub
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {profile?.profile_pic ? (
                <img
                  src={profile.profile_pic}
                  alt={profile.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {profile?.name ? getInitials(profile.name) : 'U'}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.name || 'User'}
                </p>
                <p className="text-xs text-gray-600">
                  {profile?.role === 'admin' ? 'Administrator' : 'User'}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                <button
                  onClick={() => {
                    navigate('/admin/settings');
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 w-full text-left"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    navigate('/admin/profile');
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 w-full text-left"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </button>
                <hr className="my-1 border-gray-200" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;