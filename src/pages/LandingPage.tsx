import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  ArrowRight,
  Music,
  Laptop,
  Briefcase,
  Activity,
  GraduationCap,
  Palette,
  Code,
  Moon,
  Sun,
  Search,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MoreHorizontal,
  Plus,
  Settings,
  User,
  Ticket,
  LogOut,
  Mic,
  Monitor,
  Building2,
  Trophy,
  BookOpen,
  Brush,
  Terminal,
  Zap
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchCategory, setSearchCategory] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  
  // Helper function to get user initials
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        console.log('Fetching events from Supabase...');
        
        // First, let's test the connection
        const { data: testData, error: testError } = await supabase
          .from('events')
          .select('count')
          .limit(1);
        
        if (testError) {
          console.error('Supabase connection test failed:', testError);
          setEvents([]);
          setLoading(false);
          return;
        }
        
        console.log('Supabase connection successful');
        
        // Now fetch actual events
        const { data, error } = await supabase
          .from('events')
          .select(`
            id,
            title,
            description,
            date_time,
            venue,
            organizer_name,
            prize_money,
            ticket_price,
            ticket_type,
            banner_url,
            status,
            max_participants,
            booking_deadline,
            ticket_limit,
            custom_category,
            category_id
          `)
          .order('date_time', { ascending: true })
          .limit(20);

        if (error) {
          console.error('Error fetching events:', error);
          setEvents([]);
        } else {
          console.log('Events fetched successfully:', data);
          console.log('Number of events:', data?.length || 0);
          // Debug: Log each event's category data
          data?.forEach((event, index) => {
            console.log(`Event ${index + 1}:`, {
              title: event.title,
              custom_category: event.custom_category,
              category_id: event.category_id,
              fullEvent: event
            });
          });
          setEvents(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);

  // Update filteredEvents when events change
  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode class to body
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };



  const handleCategoryClick = (categoryName: string) => {
    setSearchCategory(categoryName);
    setSearchLocation(''); // Clear location filter when category is selected
    
    // Filter events by category
    const filtered = events.filter(event => {
      const matchesCategory = event.custom_category === categoryName || 
                             (event.category_id && categories.find(cat => cat.id === event.category_id)?.name === categoryName);
      return matchesCategory;
    });
    setFilteredEvents(filtered);
    
    // Scroll to events section
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategorySelect = (categoryName: string) => {
    setSearchCategory(categoryName);
    // Auto-filter when category is selected from dropdown
    if (categoryName) {
      const filtered = events.filter(event => {
        const matchesCategory = event.custom_category === categoryName || 
                               (event.category_id && categories.find(cat => cat.id === event.category_id)?.name === categoryName);
        return matchesCategory;
      });
      setFilteredEvents(filtered);
    } else {
      // Show all events if "All Categories" is selected
      setFilteredEvents(events);
    }
  };

  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error fetching categories:', error);
          // Fallback to default categories if Supabase fails
          setCategories([
            { name: 'Music', icon: Music },
            { name: 'Tech', icon: Laptop },
            { name: 'Business', icon: Briefcase },
            { name: 'Sports', icon: Activity },
            { name: 'Education', icon: GraduationCap },
            { name: 'Arts', icon: Palette },
            { name: 'Coding', icon: Code },
            { name: 'Hackathon', icon: Laptop }
          ]);
        } else {
          setCategories(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
        // Fallback to default categories
        setCategories([
          { name: 'Music', icon: Music },
          { name: 'Tech', icon: Laptop },
          { name: 'Business', icon: Briefcase },
          { name: 'Sports', icon: Activity },
          { name: 'Education', icon: GraduationCap },
          { name: 'Arts', icon: Palette },
          { name: 'Coding', icon: Code },
          { name: 'Hackathon', icon: Laptop }
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Navigation */}
      <nav className={`flex items-center justify-between px-8 py-4 shadow-sm ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center">
          <Calendar className="w-8 h-8 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-blue-600">EventHub</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <a href="#events" className="font-medium hover:text-[#2563eb] transition-colors">Events</a>
          <a href="#categories" className="font-medium hover:text-[#2563eb] transition-colors">Categories</a>
          <a href="#contact" className="font-medium hover:text-[#2563eb] transition-colors">Contact</a>
          
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="grid grid-cols-3 gap-0.5">
                  <div className="w-1 h-1 bg-gray-600 dark:bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-600 dark:bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-600 dark:bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-600 dark:bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-600 dark:bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-600 dark:bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-600 dark:bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-600 dark:bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-600 dark:bg-gray-300 rounded-full"></div>
                </div>
              </button>
              
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <Link
                    to="/admin/events/create"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <Plus className="w-5 h-5 mr-3 text-blue-600" />
                    Create Event
                  </Link>
                  <Link
                    to="/admin/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <User className="w-5 h-5 mr-3 text-blue-600" />
                    Profile Settings
                  </Link>
                  <Link
                    to="/admin/bookings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <Ticket className="w-5 h-5 mr-3 text-blue-600" />
                    My Bookings
                  </Link>
                  <hr className="my-2 border-gray-200 dark:border-gray-600" />
                  <Link
                    to="/admin"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 w-full text-left font-semibold"
                  >
                    <Settings className="w-5 h-5 mr-3 text-blue-600" />
                    Admin Dashboard
                  </Link>
                </div>
              )}
              
              {/* Close dropdown when clicking outside */}
              {isDropdownOpen && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            
            {user ? (
              // User is logged in - show profile picture with dropdown
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center justify-center"
                >
                  {profile?.profile_pic ? (
                    <img
                      src={profile.profile_pic}
                      alt={profile.name || 'Profile'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md hover:scale-105 transition-transform cursor-pointer"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-md hover:scale-105 transition-transform cursor-pointer">
                      {profile?.name ? getInitials(profile.name) : 'U'}
                    </div>
                  )}
                </button>
                
                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {profile?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {profile?.email || 'user@example.com'}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await signOut();
                          toast.success('Signed out successfully');
                          // Stay on landing page instead of redirecting
                        } catch (error) {
                          toast.error('Error signing out');
                        }
                        setIsProfileDropdownOpen(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
                
                {/* Close dropdown when clicking outside */}
                {isProfileDropdownOpen && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  />
                )}
              </div>
            ) : (
              // User is not logged in - show login/register buttons
              <>
                <Link
                  to="/auth"
                  className="px-4 py-2 border border-[#2563eb] text-[#2563eb] rounded-lg hover:bg-[rgba(37,99,235,0.1)] transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  className="px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors font-medium"
                >
                  Register
                </Link>
              </>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative py-20 px-8 text-center text-white"
        style={{
          background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
          url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=500&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <h1 className="text-5xl font-bold mb-4">Discover Amazing Events Near You</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Find and explore concerts, festivals, workshops and more across India
        </p>
        
        <div className="flex max-w-2xl mx-auto gap-2">
          <select
            value={searchCategory}
            onChange={(e) => handleCategorySelect(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-900"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id || category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          
          <select
            value={searchLocation}
            onChange={(e) => {
              setSearchLocation(e.target.value);
              // Auto-filter when location changes
              if (e.target.value) {
                const filtered = events.filter(event => {
                  const matchesCategory = searchCategory === '' || 
                                        event.custom_category === searchCategory ||
                                        (event.category_id && categories.find(cat => cat.id === event.category_id)?.name === searchCategory);
                  const matchesLocation = event.venue?.toLowerCase().includes(e.target.value.toLowerCase());
                  return matchesCategory && matchesLocation;
                });
                setFilteredEvents(filtered);
              } else {
                // Show all events if no location selected
                const filtered = events.filter(event => {
                  const matchesCategory = searchCategory === '' || 
                                        event.custom_category === searchCategory ||
                                        (event.category_id && categories.find(cat => cat.id === event.category_id)?.name === searchCategory);
                  return matchesCategory;
                });
                setFilteredEvents(filtered);
              }
            }}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-900"
          >
            <option value="">Select City</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Chennai">Chennai</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Pune">Pune</option>
            <option value="Jaipur">Jaipur</option>
            <option value="Goa">Goa</option>
          </select>
          

        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            // User is logged in - show admin dashboard link
            <Link
              to="/admin"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg flex items-center justify-center"
            >
              Go to Admin Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          ) : (
            // User is not logged in - show get started link
            <Link
              to="/auth"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg flex items-center justify-center"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Events Section */}
        <div className="mt-16" id="events">
          <h2 className="text-3xl font-bold mb-8 text-left px-8">Trending Events in India</h2>
        
        <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-200">
          {loading ? (
            <p>Loading events...</p>
          ) : filteredEvents.length === 0 ? (
            <p>No events found matching your criteria.</p>
          ) : (
            filteredEvents.map((event, index) => (
              <div key={event.id} className="flex-shrink-0 w-72 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative">
                {/* Status Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                    event.status === 'upcoming' ? 'bg-green-500' :
                    event.status === 'ongoing' ? 'bg-blue-500' :
                    event.status === 'cancelled' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}>
                    {event.status?.charAt(0).toUpperCase() + event.status?.slice(1) || 'Unknown'}
                  </span>
                </div>
                
                <img 
                  src={event.banner_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80"} 
                  alt={event.title} 
                  className="w-full h-40 object-cover" 
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{event.venue}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {new Date(event.date_time).toLocaleDateString()} • ₹{event.ticket_price || 0}
                  </p>
                  {/* Category Text */}
                  <p className="text-gray-500 text-sm mb-3">
                    Category: {event.custom_category || 
                              (event.category_id && categories.find(cat => cat.id === event.category_id)?.name) || 
                              'General'}
                  </p>
                  <button 
                    onClick={() => handleEventClick(event.id)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Explore Event
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>


      </section>

      {/* Categories Section */}
      <div className="py-12 px-8 bg-gray-100 dark:bg-gray-800" id="categories">
        <h2 className="text-3xl font-bold text-center mb-12">Browse Categories</h2>
        <div className="flex justify-center gap-6 max-w-6xl mx-auto overflow-x-auto pb-4">
          {categoriesLoading ? (
            <p className="text-center">Loading categories...</p>
          ) : (
            categories
              .filter(category => {
                const name = category.name.toLowerCase();
                // Hide "Health & Wellness", "Other", and similar categories
                return !name.includes('health') && 
                       !name.includes('wellness') && 
                       !name.includes('other') &&
                       !name.includes('misc') &&
                       !name.includes('general');
              })
              .map((category, index) => {
                // Get icon based on category name
                const getIcon = (name: string) => {
                  switch (name.toLowerCase()) {
                    case 'music': return Mic;
                    case 'tech': return Monitor;
                    case 'business': return Building2;
                    case 'sports': return Trophy;
                    case 'education': return BookOpen;
                    case 'arts': return Brush;
                    case 'coding': return Terminal;
                    case 'hackathon': return Zap;
                    case 'entertainment': return Music;
                    case 'technology': return Monitor;
                    case 'corporate': return Building2;
                    case 'fitness': return Activity;
                    case 'academic': return GraduationCap;
                    case 'creative': return Palette;
                    case 'programming': return Code;
                    case 'innovation': return Zap;
                    default: return Activity;
                  }
                };
                
                const IconComponent = getIcon(category.name);
                
                return (
                  <div
                    key={category.id || index}
                    onClick={() => handleCategoryClick(category.name)}
                    className="bg-white dark:bg-gray-700 rounded-xl p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300 hover:bg-blue-50 hover:scale-105 flex flex-col items-center gap-3 min-w-[120px] flex-shrink-0"
                  >
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{category.name}</span>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-8" id="contact">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">EventHub</h3>
            <p className="mb-4">
              Smart Event Management System with ML-based Recommendations and Feedback Analysis
            </p>
            <p className="text-sm">Copyright ©2025 All rights reserved</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
            <p className="mb-4">Have questions or need help? Reach out to our team anytime.</p>
            <div className="space-y-2">
              <p className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                support@eventhub.com
              </p>
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                +91 98765 43210
              </p>
              <p className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                123 Event Street, Mumbai, India
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Newsletter</h3>
            <p className="mb-4">Stay updated with our latest events</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Enter Email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Follow Us</h3>
            <p className="mb-4">Let us be social</p>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 