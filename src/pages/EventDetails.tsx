import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Ticket, 
  Share2, 
  Info, 
  Image, 
  Music,
  Map,
  Star
} from 'lucide-react';

interface EventDetailsProps {
  eventId?: string;
}

const EventDetails: React.FC<EventDetailsProps> = ({ eventId: propEventId }) => {
  const { eventId: urlEventId } = useParams<{ eventId: string }>();
  const eventId = propEventId || urlEventId;
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState<any[]>([]);
  const [relatedEventsLoading, setRelatedEventsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (error) {
          throw error;
        }
        console.log('Event data fetched:', {
          title: data.title,
          custom_category: data.custom_category,
          category_id: data.category_id,
          fullData: data
        });
        setEventData(data);
      } catch (err) {
        setError('Failed to fetch event details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (!error && data) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch related events when event data is loaded
  useEffect(() => {
    if (eventData && eventData.custom_category) {
      fetchRelatedEvents(eventData.custom_category);
    }
  }, [eventData]);

  useEffect(() => {
    // Theme persistence
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  // Close share dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showShareOptions && !target.closest('.share-dropdown')) {
        setShowShareOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareOptions]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  const handleBookTickets = () => {
    // Navigate to ticket purchase page
    navigate(`/ticket-purchase/${eventId}`);
  };

  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  const shareToWhatsApp = () => {
    const text = `Check out this amazing event: ${eventData?.title || 'Event'}\n${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setShowShareOptions(false);
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
    setShowShareOptions(false);
  };

  const shareToTwitter = () => {
    const text = `Check out this amazing event: ${eventData?.title || 'Event'}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
    setShowShareOptions(false);
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
    setShowShareOptions(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
    setShowShareOptions(false);
  };

  // Fetch related events based on category
  const fetchRelatedEvents = async (category: string) => {
    try {
      setRelatedEventsLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('custom_category', category)
        .neq('id', eventId) // Exclude current event
        .limit(6); // Show max 6 related events

      if (error) {
        console.error('Error fetching related events:', error);
        return;
      }
      setRelatedEvents(data || []);
    } catch (err) {
      console.error('Error fetching related events:', err);
    } finally {
      setRelatedEventsLoading(false);
    }
  };

  // Handle related event click
  const handleRelatedEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  if (!eventData) {
    return <div className="text-center py-12">Event not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="text-2xl font-bold text-blue-600 hover:scale-105 hover:text-blue-700 transition-all cursor-pointer"
          >
            EventHub
          </button>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-all duration-300 px-4 py-2 rounded hover:bg-blue-50"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Events
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Event Hero Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12 transition-all duration-400 hover:shadow-xl">
          <div className="flex flex-col lg:flex-row">
            {/* Event Poster */}
            <div className="lg:w-80 lg:h-96 h-64 bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: `url(${eventData.banner_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'})` }}>
              {/* Status Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg ${
                  eventData.status === 'upcoming' ? 'bg-green-500' :
                  eventData.status === 'ongoing' ? 'bg-blue-500' :
                  eventData.status === 'cancelled' ? 'bg-red-500' :
                  'bg-gray-500'
                }`}>
                  {eventData.status?.charAt(0).toUpperCase() + eventData.status?.slice(1) || 'Unknown'}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 opacity-0 hover:opacity-100 transition-opacity duration-400"></div>
            </div>
            
            {/* Event Info */}
            <div className="flex-1 p-8 lg:p-10">
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 text-gray-900">
                {eventData.title}
              </h1>
              
              <p className="text-gray-600 text-sm mb-6">
                Category: {eventData.custom_category || 
                          (eventData.category_id && categories.find(cat => cat.id === eventData.category_id)?.name) || 
                          'General'}
              </p>

              {/* Event Meta */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>{new Date(eventData.date_time).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>{new Date(eventData.date_time).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>{eventData.venue}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Capacity: {eventData.max_participants || 'Unlimited'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <button
                  onClick={handleBookTickets}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Ticket className="w-5 h-5" />
                  Book Tickets
                </button>
                
                {/* Share Button with Dropdown */}
                <div className="relative share-dropdown">
                  <button
                    onClick={handleShare}
                    className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                  
                  {/* Share Options Dropdown */}
                  {showShareOptions && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-48">
                      <button
                        onClick={shareToWhatsApp}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                      >
                        <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">W</span>
      </div>
                        WhatsApp
                      </button>
                      
                      <button
                        onClick={shareToFacebook}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                      >
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">f</span>
                        </div>
                        Facebook
                      </button>
                      
                      <button
                        onClick={shareToTwitter}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                      >
                        <div className="w-6 h-6 bg-blue-400 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">𝕏</span>
      </div>
                        Twitter
                      </button>
                      
                      <button
                        onClick={shareToLinkedIn}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                      >
                        <div className="w-6 h-6 bg-blue-700 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">in</span>
      </div>
                        LinkedIn
                      </button>
                      
                      <hr className="my-1 border-gray-200" />
                      
                      <button
                        onClick={copyToClipboard}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                      >
                        <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs">📋</span>
                        </div>
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="text-gray-700 leading-relaxed">
                <p>{eventData.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Event Details Card */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-blue-600">
            <h3 className="text-xl font-semibold mb-6 text-blue-600 border-b border-gray-200 pb-3 flex items-center gap-3">
              <Info className="w-6 h-6" />
              Event Details
            </h3>
            <div className="space-y-6">
              <div>
                <div className="font-semibold text-gray-700 mb-2">Date & Time</div>
                <div className="text-gray-900">{new Date(eventData.date_time).toLocaleDateString()} • {new Date(eventData.date_time).toLocaleTimeString()}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">Category</div>
                <div className="text-gray-900">
                  {eventData.custom_category || 
                   (eventData.category_id && categories.find(cat => cat.id === eventData.category_id)?.name) || 
                   'General'}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">Organizer</div>
                <div className="text-gray-900">{eventData.organizer_name}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">Prize Money</div>
                <div className="text-gray-900">₹{eventData.prize_money || 0}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">Max Participants</div>
                <div className="text-gray-900">{eventData.max_participants || 'Unlimited'}</div>
              </div>
            </div>
          </div>

          {/* Ticket Information Card */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-purple-600">
            <h3 className="text-xl font-semibold mb-6 text-purple-600 border-b border-gray-200 pb-3 flex items-center gap-3">
              <Ticket className="w-6 h-6" />
              Ticket Information
            </h3>
            <div className="space-y-6">
              <div>
                <div className="font-semibold text-gray-700 mb-2">Ticket Type</div>
                <div className="text-gray-900">{eventData.ticket_type}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">Ticket Price</div>
                <div className="text-gray-900">₹{eventData.ticket_price || 0}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">Ticket Limit</div>
                <div className="text-gray-900">{eventData.ticket_limit || 'Unlimited'} tickets</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">Booking Deadline</div>
                <div className="text-gray-900">
                  {eventData.booking_deadline ? new Date(eventData.booking_deadline).toLocaleDateString() : 'No deadline'}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">Registration Required</div>
                <div className="text-gray-900">{eventData.is_registration_required ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>

          {/* Venue Information Card */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-green-600">
            <h3 className="text-xl font-semibold mb-4 text-green-600 border-b border-gray-200 pb-2 flex items-center gap-3">
              <MapPin className="w-6 h-6" />
              Venue & Contact
            </h3>
            <div className="space-y-4">
              <div>
                <div className="font-semibold text-gray-700 mb-2">Venue</div>
                <div className="text-gray-900">{eventData.venue}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">Contact Person</div>
                <div className="text-gray-900">{eventData.contact_name}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">Contact Email</div>
                <div className="text-gray-900">{eventData.contact_email}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">Contact Phone</div>
                <div className="text-gray-900">{eventData.contact_phone}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">Organizer Details</div>
                <div className="text-gray-900">{eventData.organizer_details || 'No details provided'}</div>
              </div>
              {eventData.website_url && (
                <div>
                  <div className="font-semibold text-gray-700 mb-2">Website</div>
                  <div className="text-gray-900">
                    <a href={eventData.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Visit Website
                    </a>
          </div>
        </div>
      )}
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-12 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <Map className="w-16 h-16 mx-auto mb-4 text-purple-600" />
            <span className="text-xl">Interactive Map Would Appear Here</span>
          </div>
        </div>

        {/* Related Events Section */}
        {relatedEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">More {eventData?.custom_category} Events</h2>
            
            <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-200">
              {relatedEventsLoading ? (
                <p>Loading related events...</p>
              ) : (
                relatedEvents.map((event) => (
                  <div key={event.id} className="flex-shrink-0 w-72 bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative">
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
                      <p className="text-gray-600 text-sm mb-2">{event.venue}</p>
                      <p className="text-gray-600 text-sm mb-2">
                        {new Date(event.date_time).toLocaleDateString()} • ₹{event.ticket_price || 0}
                      </p>
                      {/* Category Text */}
                      <p className="text-gray-500 text-sm mb-3">
                        Category: {event.custom_category || 
                                  (event.category_id && categories.find(cat => cat.id === event.category_id)?.name) || 
                                  'General'}
                      </p>
                      <button 
                        onClick={() => handleRelatedEventClick(event.id)}
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
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <div className="flex justify-center gap-8 mb-6 flex-wrap">
            <a href="#" className="hover:underline transition-all duration-300 hover:-translate-y-1">About Us</a>
            <a href="#" className="hover:underline transition-all duration-300 hover:-translate-y-1">Contact</a>
            <a href="#" className="hover:underline transition-all duration-300 hover:-translate-y-1">Terms</a>
            <a href="#" className="hover:underline transition-all duration-300 hover:-translate-y-1">Privacy</a>
          </div>
          <p className="opacity-90">© 2024 EventHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default EventDetails;
